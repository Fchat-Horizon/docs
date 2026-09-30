<script setup lang="ts">
  import type { Chart, Plugin } from 'chart.js';
  import { computed, ref } from 'vue';
  import { Line } from 'vue-chartjs';
  import type { ReleaseLaunch, StatsData } from '../data/stats';
  import { baseOptions, useChartReady, useChartTheme } from './chartSetup';
  import { formatDate, formatNumber } from './chartUtils';

  const props = defineProps<{ stats: StatsData }>();

  const ready = useChartReady();
  const theme = useChartTheme();
  const channel = ref<'stable' | 'prerelease'>('stable');
  const count = ref<3 | 5 | 'all'>(5);
  const majorOnly = ref(false);

  const WINDOW_HOURS = 14 * 24;
  const HOUR_MS = 3_600_000;

  interface Curve {
    label: string;
    publishedAt: string;
    complete: boolean;
    points: { hours: number; downloads: number }[];
  }

  function valueAt(launch: ReleaseLaunch, hours: number) {
    const points = launch.points;
    if (hours <= 0) return 0;
    const i = points.findIndex((p) => p.hours >= hours);
    if (i === -1) return points[points.length - 1].downloads;
    const a = points[i - 1] ?? points[i];
    const b = points[i];
    const f = b.hours === a.hours ? 1 : (hours - a.hours) / (b.hours - a.hours);
    return a.downloads + (b.downloads - a.downloads) * f;
  }

  const minorOf = (tag: string) => tag.match(/^v?(\d+\.\d+)\./)?.[1];

  // ^ A x.y series is measured from its x.y.0 release and includes every
  // patch released in the window, since hotfixes take over the downloads a
  // x.y.0 would otherwise get. Series whose x.y.0 predates tracking have no
  // launch to show.
  function seriesCurves(launches: ReleaseLaunch[]): Curve[] {
    const curves: Curve[] = [];
    for (const base of launches) {
      const minor = minorOf(base.tag);
      if (!minor || base.tag.replace(/^v/, '') !== `${minor}.0`) continue;
      const start = Date.parse(base.publishedAt);
      const members = launches
        .filter((l) => minorOf(l.tag) === minor)
        .map((l) => ({
          launch: l,
          offset: (Date.parse(l.publishedAt) - start) / HOUR_MS,
        }))
        .filter((m) => m.offset >= 0 && m.offset < WINDOW_HOURS);
      const times = [
        ...new Set(
          members.flatMap((m) =>
            m.launch.points.map((p) => p.hours + m.offset),
          ),
        ),
      ]
        .filter((h) => h <= WINDOW_HOURS)
        .sort((a, b) => a - b);
      curves.push({
        label: `v${minor}.x`,
        publishedAt: base.publishedAt,
        complete: base.complete,
        points: times.map((h) => ({
          hours: h,
          downloads: members.reduce(
            (sum, m) => sum + valueAt(m.launch, h - m.offset),
            0,
          ),
        })),
      });
    }
    return curves;
  }

  // ^ Prereleases get a small fraction of stable downloads, so the two are
  // never shown together: on one scale the prerelease lines flatten out.
  const allCurves = computed<Curve[]>(() => {
    const launches = props.stats.launches.filter(
      (l) => l.prerelease === (channel.value === 'prerelease'),
    );
    if (channel.value === 'stable' && majorOnly.value)
      return seriesCurves(launches);
    return launches.map((l) => ({
      label: l.tag,
      publishedAt: l.publishedAt,
      complete: l.complete,
      points: l.points,
    }));
  });

  // ^ Each release's colour comes from its position in the full release
  // history of its channel, so it never changes as new releases ship, and
  // any 8 consecutive releases get 8 different colours. Major versions are
  // numbered among major versions the same way.
  const colorOf = computed(() => {
    const prerelease = channel.value === 'prerelease';
    const history = props.stats.releases.filter(
      (r) => r.prerelease === prerelease,
    );
    const labels =
      !prerelease && majorOnly.value
        ? [...new Set(history.map((r) => `v${minorOf(r.tag)}.x`))]
        : history.map((r) => r.tag);
    const palette = theme.value.categorical;
    return new Map(
      labels.map((label, i) => [label, palette[i % palette.length]]),
    );
  });

  const curves = computed(() =>
    count.value === 'all'
      ? allCurves.value
      : allCurves.value.slice(-count.value),
  );
  const newest = computed(() => curves.value.at(-1)?.label);

  const emptyMessage = computed(() =>
    channel.value === 'stable' && majorOnly.value
      ? 'No major version has launched since tracking began in July 2026. The next x.y.0 release will be the first.'
      : 'No releases have launched since tracking began in July 2026.',
  );

  // ^ Labels sit at each line's end; when two would overlap, the older
  // one is dropped and its name stays available in the legend and tooltip.
  const endLabelPlugin: Plugin<'line'> = {
    id: 'endLabels',
    afterDatasetsDraw(chart: Chart) {
      const { ctx } = chart;
      const placed: number[] = [];
      ctx.save();
      ctx.font = `12px ${chart.options.font?.family ?? 'sans-serif'}`;
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      for (let i = chart.data.datasets.length - 1; i >= 0; i--) {
        const meta = chart.getDatasetMeta(i);
        if (meta.hidden) continue;
        const last = meta.data[meta.data.length - 1];
        if (!last || placed.some((y) => Math.abs(y - last.y) < 14)) continue;
        placed.push(last.y);
        const curve = curves.value[i];
        const text = curve.complete ? curve.label : `${curve.label} (so far)`;
        const x = Math.min(last.x + 6, chart.chartArea.right - 4);
        ctx.textAlign = x === last.x + 6 ? 'left' : 'right';
        ctx.strokeStyle = theme.value.surface;
        ctx.strokeText(text, x, last.y);
        ctx.fillStyle =
          curve.label === newest.value ? theme.value.text : theme.value.muted;
        ctx.fillText(text, x, last.y);
      }
      ctx.restore();
    },
  };

  const chartData = computed(() => ({
    datasets: curves.value.map((c) => {
      const color = colorOf.value.get(c.label)!;
      return {
        label: c.label,
        data: c.points.map((p) => ({ x: p.hours / 24, y: p.downloads })),
        borderColor: color,
        backgroundColor: color,
        borderWidth: c.label === newest.value ? 3 : 2,
        tension: 0.25,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: theme.value.surface,
      };
    }),
  }));

  const options = computed(() => {
    const base = baseOptions(theme.value);
    return {
      ...base,
      interaction: { mode: 'nearest' as const, intersect: false },
      layout: { padding: { right: 96 } },
      scales: {
        ...base.scales,
        x: {
          ...base.scales.x,
          type: 'linear' as const,
          min: 0,
          max: WINDOW_HOURS / 24,
          ticks: {
            ...base.scales.x.ticks,
            stepSize: 1,
            callback: (value: number | string) =>
              Number(value) % 2 === 0 ? `Day ${value}` : '',
          },
        },
      },
      plugins: {
        ...base.plugins,
        legend: {
          display: curves.value.length > 1,
          align: 'start' as const,
          reverse: true,
          labels: {
            color: theme.value.muted,
            usePointStyle: true,
            pointStyle: 'line' as const,
            boxWidth: 16,
          },
        },
        tooltip: {
          ...base.plugins.tooltip,
          callbacks: {
            title: ([item]: { dataset: { label?: string } }[]) =>
              item.dataset.label ?? '',
            label: ({ parsed }: { parsed: { x: number; y: number } }) =>
              `${formatNumber(parsed.y)} downloads`,
            afterLabel: ({ parsed }: { parsed: { x: number } }) =>
              parsed.x < 1
                ? `${Math.round(parsed.x * 24)} hours after release`
                : `${parsed.x.toFixed(1)} days after release`,
          },
        },
      },
    };
  });

  const tableRows = computed(() =>
    [...curves.value].reverse().map((c) => {
      const last = c.points[c.points.length - 1]?.hours ?? 0;
      return {
        label: c.label,
        publishedAt: c.publishedAt,
        after: [1, 7, 14].map((d) =>
          last >= d * 24
            ? valueAt({ points: c.points } as ReleaseLaunch, d * 24)
            : null,
        ),
      };
    }),
  );
</script>

<template>
  <figure class="launches-chart">
    <div class="chart-controls">
      <slot name="controls" />
      <div
        class="chart-segmented"
        role="group"
        aria-label="Channel"
      >
        <button
          :aria-pressed="channel === 'stable'"
          @click="channel = 'stable'"
        >
          Stable
        </button>
        <button
          :aria-pressed="channel === 'prerelease'"
          @click="channel = 'prerelease'"
        >
          Prereleases
        </button>
      </div>
      <div
        class="chart-segmented"
        role="group"
        aria-label="How many releases to show"
      >
        <button
          v-for="option in [3, 5, 'all'] as const"
          :key="option"
          :aria-pressed="count === option"
          @click="count = option"
        >
          {{ option === 'all' ? 'All' : `Last ${option}` }}
        </button>
      </div>
      <label
        v-if="channel === 'stable'"
        class="chart-toggle"
      >
        <input
          v-model="majorOnly"
          type="checkbox"
        />
        Major versions only
      </label>
    </div>

    <p class="chart-caption">
      Downloads in each release's first two weeks, including auto-updates, so
      every release is measured over the same stretch of time.
      <template v-if="channel === 'stable' && majorOnly">
        Each major version counts its patches too, from the day its x.y.0
        release came out.
      </template>
      <template v-else>
        Tracking began in July 2026, so older releases don't appear.
      </template>
    </p>

    <div class="chart-canvas">
      <p
        v-if="!curves.length"
        class="empty"
      >
        {{ emptyMessage }}
      </p>
      <Line
        v-else-if="ready"
        :data="chartData"
        :options="options"
        :plugins="[endLabelPlugin]"
        aria-label="Downloads over each release's first two weeks. The table below has the same data."
      />
    </div>

    <details
      v-if="curves.length"
      class="chart-table"
    >
      <summary>View as table</summary>
      <table>
        <thead>
          <tr>
            <th>Release</th>
            <th>Published</th>
            <th>After 1 day</th>
            <th>After 7 days</th>
            <th>After 14 days</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableRows"
            :key="row.label"
          >
            <td>{{ row.label }}</td>
            <td>{{ formatDate(row.publishedAt) }}</td>
            <td
              v-for="(value, i) in row.after"
              :key="i"
            >
              {{ value === null ? '–' : formatNumber(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<style scoped>
  .launches-chart {
    margin: 16px 0 24px;
  }

  .empty {
    display: grid;
    place-items: center;
    height: 100%;
    margin: 0;
    padding: 0 24px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    color: var(--vp-c-text-2);
    text-align: center;
  }
</style>
