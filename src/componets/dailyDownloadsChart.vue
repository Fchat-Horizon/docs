<script setup lang="ts">
  import type { Chart, Plugin } from 'chart.js';
  import { computed } from 'vue';
  import { Line } from 'vue-chartjs';
  import type { StatsData } from '../data/stats';
  import {
    baseOptions,
    useChartReady,
    useChartTheme,
    useZoom,
    zoomOptions,
  } from './chartSetup';
  import { PLATFORMS, formatDate, formatNumber } from './chartUtils';
  import chartZoomBar from './chartZoomBar.vue';

  const props = defineProps<{ stats: StatsData }>();

  const ready = useChartReady();
  const theme = useChartTheme();
  const { chartRef, zoomed, onChange, reset } = useZoom();

  const days = computed(() => props.stats.daily);

  const shortDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const releaseMarkers = computed(() => {
    const index = new Map(days.value.map((d, i) => [d.date, i]));
    return props.stats.releases
      .filter((r) => !r.prerelease)
      .map((r) => ({ tag: r.tag, i: index.get(r.publishedAt.slice(0, 10)) }))
      .filter((r): r is { tag: string; i: number } => r.i !== undefined);
  });

  // ^ Adjacent releases would overlap, so labels alternate between two rows.
  const releaseMarkerPlugin: Plugin<'line'> = {
    id: 'releaseMarkers',
    afterDatasetsDraw(chart: Chart) {
      const { ctx, chartArea, scales } = chart;
      let previousX = -Infinity;
      let row = 0;
      ctx.save();
      ctx.font = `12px ${chart.options.font?.family ?? 'sans-serif'}`;
      ctx.textAlign = 'center';
      for (const { tag, i } of releaseMarkers.value) {
        const x = scales.x.getPixelForValue(i);
        if (x < chartArea.left || x > chartArea.right) continue;
        row = x - previousX < 56 ? 1 - row : 0;
        previousX = x;
        const labelY = chartArea.top - 20 + row * 14;
        ctx.strokeStyle = theme.value.axis;
        ctx.beginPath();
        ctx.moveTo(x, labelY + 4);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.fillStyle = theme.value.muted;
        ctx.fillText(tag, x, labelY);
      }
      ctx.restore();
    },
  };

  const crosshairPlugin: Plugin<'line'> = {
    id: 'crosshair',
    afterDatasetsDraw(chart: Chart) {
      const active = chart.tooltip?.getActiveElements()[0];
      if (!active) return;
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.strokeStyle = theme.value.muted;
      ctx.beginPath();
      ctx.moveTo(active.element.x, chartArea.top);
      ctx.lineTo(active.element.x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };

  const chartData = computed(() => ({
    labels: days.value.map((d) => shortDate.format(new Date(d.date))),
    datasets: [
      {
        label: 'Downloads',
        data: days.value.map((d) => Math.round(d.total)),
        borderColor: theme.value.series.windows,
        backgroundColor: `${theme.value.series.windows}1a`,
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: theme.value.surface,
        pointHoverBackgroundColor: theme.value.series.windows,
      },
    ],
  }));

  const options = computed(() => {
    const base = baseOptions(theme.value);
    return {
      ...base,
      layout: { padding: { top: 32 } },
      plugins: {
        ...base.plugins,
        zoom: zoomOptions(theme.value, 7, onChange),
        tooltip: {
          ...base.plugins.tooltip,
          displayColors: false,
          callbacks: {
            title: ([item]: { dataIndex: number }[]) =>
              formatDate(days.value[item.dataIndex].date),
            label: ({ parsed }: { parsed: { y: number } }) =>
              `${formatNumber(parsed.y)} downloads`,
            footer: ([item]: { dataIndex: number }[]) =>
              PLATFORMS.map(
                (p) =>
                  `${p.label}: ${formatNumber(days.value[item.dataIndex].byPlatform[p.key])}`,
              ),
          },
        },
      },
    };
  });
</script>

<template>
  <figure class="daily-chart">
    <div class="chart-controls">
      <slot name="controls" />
    </div>
    <p class="chart-caption">
      Downloads per day, starting {{ formatDate(days[0].date) }}. Github doesn't
      keep this history, so this chart only includes data from our first
      recorded snapshot.
    </p>

    <div class="chart-canvas">
      <Line
        v-if="ready"
        ref="chartRef"
        :data="chartData"
        :options="options"
        :plugins="[releaseMarkerPlugin, crosshairPlugin]"
        aria-label="Downloads per day, with stable releases marked."
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
            <th>Date</th>
            <th
              v-for="p in PLATFORMS"
              :key="p.key"
            >
              {{ p.label }}
            </th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in [...days].reverse()"
            :key="d.date"
          >
            <td>{{ formatDate(d.date) }}</td>
            <td
              v-for="p in PLATFORMS"
              :key="p.key"
            >
              {{ formatNumber(d.byPlatform[p.key]) }}
            </td>
            <td>{{ formatNumber(d.total) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<style scoped>
  .daily-chart {
    margin: 16px 0 24px;
  }
</style>
