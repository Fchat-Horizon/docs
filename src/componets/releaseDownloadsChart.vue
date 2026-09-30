<script setup lang="ts">
  import type { Chart, Plugin, ScriptableContext } from 'chart.js';
  import { computed, onMounted, ref, watch } from 'vue';
  import { Bar as BarChart } from 'vue-chartjs';
  import type { PlatformCounts, ReleaseStat, StatsData } from '../data/stats';
  import {
    baseOptions,
    useChartReady,
    useChartTheme,
    useZoom,
    zoomOptions,
  } from './chartSetup';
  import {
    PLATFORMS,
    formatDate,
    formatDays,
    formatNumber,
  } from './chartUtils';
  import chartZoomBar from './chartZoomBar.vue';

  const props = defineProps<{ stats: StatsData }>();

  interface Bar {
    label: string;
    publishedAt: string;
    total: number;
    byPlatform: PlatformCounts;
    daysAsLatest: number;
    isCurrent: boolean;
    isCurrentStable: boolean;
    releaseCount: number;
  }

  const showPrereleases = ref(false);
  const grouped = ref(false);

  const ready = useChartReady();
  const theme = useChartTheme();
  const { chartRef, zoomed, onChange, reset } = useZoom();

  onMounted(() => {
    if (window.matchMedia('(max-width: 560px)').matches) grouped.value = true;
  });
  watch([showPrereleases, grouped], reset);

  const minorVersion = (tag: string) => tag.match(/^v?(\d+\.\d+)/)?.[1] ?? tag;

  const currentStableTag = computed(
    () => props.stats.releases.find((r) => r.isCurrent && !r.prerelease)?.tag,
  );

  function toBar(members: ReleaseStat[], label: string): Bar {
    const byPlatform = { windows: 0, linux: 0, mac: 0 };
    for (const m of members)
      for (const { key } of PLATFORMS) byPlatform[key] += m.byPlatform[key];
    return {
      label,
      publishedAt: members[0].publishedAt,
      total: members.reduce((sum, m) => sum + m.total, 0),
      byPlatform,
      daysAsLatest: members.reduce((sum, m) => sum + m.daysAsLatest, 0),
      isCurrent: members.some((m) => m.isCurrent),
      isCurrentStable: members.some((m) => m.tag === currentStableTag.value),
      releaseCount: members.length,
    };
  }

  const bars = computed<Bar[]>(() => {
    const visible = props.stats.releases.filter(
      (r) => showPrereleases.value || !r.prerelease,
    );
    if (!grouped.value) return visible.map((r) => toBar([r], r.tag));

    const groups = new Map<string, ReleaseStat[]>();
    for (const r of visible) {
      const key = minorVersion(r.tag);
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
    return [...groups].map(([key, members]) => toBar(members, `v${key}.x`));
  });

  function latestNote(bar: Bar): string {
    const days = formatDays(bar.daysAsLatest);
    if (bar.releaseCount > 1)
      return `${bar.releaseCount} releases, newest for ${days} combined`;
    return bar.isCurrent
      ? `Newest release for ${days}, active`
      : `Newest release for ${days}`;
  }

  const currentLabelPlugin: Plugin<'bar'> = {
    id: 'currentLabel',
    afterDatasetsDraw(chart: Chart) {
      const i = bars.value.findIndex((b) => b.isCurrentStable);
      if (i < 0) return;
      const { ctx, chartArea, scales } = chart;
      const x = scales.x.getPixelForValue(i);
      if (x < chartArea.left || x > chartArea.right) return;
      const bar = bars.value[i];
      const y = scales.y.getPixelForValue(bar.total) - 8;
      ctx.save();
      ctx.font = `600 12px ${chart.options.font?.family ?? 'sans-serif'}`;
      ctx.textAlign = x > chartArea.right - 40 ? 'right' : 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = theme.value.surface;
      ctx.strokeText('Current', x, y);
      ctx.fillStyle = theme.value.muted;
      ctx.fillText('Current', x, y);
      ctx.restore();
    },
  };

  const chartData = computed(() => ({
    labels: bars.value.map((b) => b.label),
    datasets: PLATFORMS.map((p, i) => {
      const isTop = i === PLATFORMS.length - 1;
      return {
        label: p.label,
        data: bars.value.map((b) => b.byPlatform[p.key]),
        backgroundColor: theme.value.series[p.key],
        // * The top border in the surface colour is the gap between segments,
        // skipped on short segments where it would hide the segment itself.
        borderColor: theme.value.surface,
        borderWidth: (ctx: ScriptableContext<'bar'>) => {
          const y = ctx.chart.scales.y;
          const value = Number(ctx.raw) || 0;
          const height = y.getPixelForValue(0) - y.getPixelForValue(value);
          return isTop || height < 6 ? 0 : { top: 2 };
        },
        borderSkipped: 'start' as const,
        borderRadius: isTop ? { topLeft: 4, topRight: 4 } : 0,
        maxBarThickness: 24,
        categoryPercentage: 0.9,
        barPercentage: 0.9,
      };
    }),
  }));

  const options = computed(() => {
    const base = baseOptions(theme.value);
    return {
      ...base,
      layout: { padding: { top: 16 } },
      scales: {
        x: { ...base.scales.x, stacked: true },
        y: { ...base.scales.y, stacked: true },
      },
      plugins: {
        ...base.plugins,
        legend: {
          display: true,
          align: 'start' as const,
          labels: {
            color: theme.value.muted,
            usePointStyle: true,
            pointStyle: 'rectRounded' as const,
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        zoom: zoomOptions(theme.value, 5, onChange),
        tooltip: {
          ...base.plugins.tooltip,
          callbacks: {
            title: ([item]: { dataIndex: number }[]) => {
              const bar = bars.value[item.dataIndex];
              return `${bar.label} · ${formatDate(bar.publishedAt)}`;
            },
            label: (item: {
              dataset: { label?: string };
              parsed: { y: number };
            }) => `${item.dataset.label}: ${formatNumber(item.parsed.y)}`,
            footer: ([item]: { dataIndex: number }[]) => {
              const bar = bars.value[item.dataIndex];
              return [
                `All platforms: ${formatNumber(bar.total)}`,
                latestNote(bar),
              ];
            },
          },
        },
      },
    };
  });
</script>

<template>
  <figure class="release-chart">
    <div class="chart-controls">
      <slot name="controls" />
      <label class="chart-toggle">
        <input
          v-model="showPrereleases"
          type="checkbox"
        />
        Prereleases
      </label>
      <label class="chart-toggle">
        <input
          v-model="grouped"
          type="checkbox"
        />
        Group by minor version
      </label>
    </div>

    <p class="chart-caption">
      Total downloads for each release. Releases that stayed current longer had
      more time to collect downloads, so bar height isn't a measure of
      popularity.
    </p>

    <div class="chart-canvas">
      <BarChart
        v-if="ready"
        ref="chartRef"
        :data="chartData"
        :options="options"
        :plugins="[currentLabelPlugin]"
        aria-label="Downloads per release, stacked by platform. The table below has the same data."
      />
    </div>
    <chartZoomBar
      :zoomed="zoomed"
      @reset="reset"
    />

    <details class="chart-table">
      <summary>View as table</summary>
      <table>
        <thead>
          <tr>
            <th>Release</th>
            <th>Published</th>
            <th
              v-for="p in PLATFORMS"
              :key="p.key"
            >
              {{ p.label }}
            </th>
            <th>Total</th>
            <th>Days as newest</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bar in [...bars].reverse()"
            :key="bar.label"
          >
            <td>{{ bar.label }}</td>
            <td>{{ formatDate(bar.publishedAt) }}</td>
            <td
              v-for="p in PLATFORMS"
              :key="p.key"
            >
              {{ formatNumber(bar.byPlatform[p.key]) }}
            </td>
            <td>{{ formatNumber(bar.total) }}</td>
            <td>{{ Math.round(bar.daysAsLatest) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<style scoped>
  .release-chart {
    margin: 16px 0 24px;
  }
</style>
