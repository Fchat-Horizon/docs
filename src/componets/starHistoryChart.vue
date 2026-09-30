<script setup lang="ts">
  import { computed } from 'vue';
  import { Line } from 'vue-chartjs';
  import type { StatsData } from '../data/stats';
  import { baseOptions, useChartReady, useChartTheme } from './chartSetup';
  import { formatDate } from './chartUtils';

  const props = defineProps<{ stats: StatsData }>();

  const ready = useChartReady();
  const theme = useChartTheme();

  const monthYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  // * The source is sparse (a row per change), so the line holds flat to the
  // snapshot date.
  const points = computed(() => {
    const history = props.stats.starHistory.map((p) => ({
      x: Date.parse(p.date),
      y: p.stars,
    }));
    const last = history[history.length - 1];
    return [...history, { x: Date.parse(props.stats.snapshotDate), y: last.y }];
  });

  const chartData = computed(() => ({
    datasets: [
      {
        label: 'Stars',
        data: points.value,
        stepped: 'before' as const,
        borderColor: theme.value.series.windows,
        backgroundColor: `${theme.value.series.windows}1a`,
        borderWidth: 2,
        fill: true,
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
      scales: {
        ...base.scales,
        x: {
          ...base.scales.x,
          type: 'linear' as const,
          min: points.value[0].x,
          max: points.value[points.value.length - 1].x,
          ticks: {
            ...base.scales.x.ticks,
            maxTicksLimit: 6,
            callback: (value: number | string) =>
              monthYear.format(new Date(Number(value))),
          },
        },
      },
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins.tooltip,
          displayColors: false,
          callbacks: {
            title: ([item]: { parsed: { x: number } }[]) =>
              formatDate(new Date(item.parsed.x).toISOString()),
            label: ({ parsed }: { parsed: { y: number } }) =>
              `${parsed.y} stars`,
          },
        },
      },
    };
  });
</script>

<template>
  <figure class="star-chart">
    <div class="canvas">
      <Line
        v-if="ready"
        :data="chartData"
        :options="options"
        :aria-label="`GitHub stars over time, from ${points[0].y} to ${points[points.length - 1].y}.`"
      />
    </div>
  </figure>
</template>

<style scoped>
  .star-chart {
    margin: 16px 0 24px;
  }

  .canvas {
    position: relative;
    height: 180px;
  }
</style>
