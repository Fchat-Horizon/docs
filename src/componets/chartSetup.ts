import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useData } from 'vitepress';
import { computed, onMounted, ref, shallowRef } from 'vue';
import type { Platform } from '../data/stats';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

let zoomRegistered: Promise<void> | undefined;

// ^ chartjs-plugin-zoom pulls in hammerjs, which touches `window` on import
// and would break the SSR build, so it's loaded in the browser only.
function registerZoom() {
  zoomRegistered ??= import('chartjs-plugin-zoom').then(({ default: zoom }) => {
    Chart.register(zoom);
  });
  return zoomRegistered;
}

export function useChartReady() {
  const ready = ref(false);
  onMounted(async () => {
    Chart.defaults.font.family = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--vp-font-family-base');
    await registerZoom();
    ready.value = true;
  });
  return ready;
}

const LIGHT = {
  series: { windows: '#2a78d6', linux: '#eb6834', mac: '#1baf7a' },
  // ! Order matters: it's the validated colour-blind-safe sequence.
  categorical: [
    '#2a78d6',
    '#eb6834',
    '#1baf7a',
    '#eda100',
    '#e87ba4',
    '#008300',
    '#4a3aa7',
    '#e34948',
  ],
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  text: '#3c3c43',
  surface: '#ffffff',
  tooltip: '#ffffff',
  tooltipBorder: '#e2e2e3',
};

const DARK = {
  series: { windows: '#3987e5', linux: '#d95926', mac: '#199e70' },
  categorical: [
    '#3987e5',
    '#d95926',
    '#199e70',
    '#c98500',
    '#d55181',
    '#008300',
    '#9085e9',
    '#e66767',
  ],
  grid: '#2c2c2a',
  axis: '#383835',
  muted: '#898781',
  text: '#dfdfd6',
  surface: '#1c191c',
  tooltip: '#202127',
  tooltipBorder: '#2e2e32',
};

export type ChartTheme = typeof LIGHT & {
  series: Record<Platform, string>;
};

export function useChartTheme() {
  const { isDark } = useData();
  return computed<ChartTheme>(() => (isDark.value ? DARK : LIGHT));
}

export function baseOptions(theme: ChartTheme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        grid: { display: false },
        border: { color: theme.axis },
        ticks: { color: theme.muted, maxRotation: 0, autoSkipPadding: 16 },
      },
      y: {
        beginAtZero: true,
        grid: { color: theme.grid },
        border: { display: false },
        ticks: { color: theme.muted, maxTicksLimit: 6 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.tooltip,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        titleColor: theme.text,
        bodyColor: theme.text,
        footerColor: theme.muted,
        footerFont: { weight: 'normal' as const },
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
  };
}

export function useZoom() {
  const chartRef = shallowRef<{ chart?: Chart } | null>(null);
  const zoomed = ref(false);
  const onChange = ({ chart }: { chart: Chart }) => {
    zoomed.value = chart.isZoomedOrPanned();
  };
  const reset = () => {
    chartRef.value?.chart?.resetZoom();
    zoomed.value = false;
  };
  return { chartRef, zoomed, onChange, reset };
}

export function zoomOptions(
  theme: ChartTheme,
  minRange: number,
  onChange: (context: { chart: Chart }) => void,
) {
  return {
    limits: { x: { min: 'original', max: 'original', minRange } },
    zoom: {
      mode: 'x' as const,
      onZoomComplete: onChange,
      drag: {
        enabled: true,
        backgroundColor: `${theme.series.windows}22`,
        borderColor: theme.series.windows,
        borderWidth: 1,
      },
      wheel: { enabled: true, modifierKey: 'ctrl' as const },
      pinch: { enabled: true },
    },
    pan: {
      enabled: true,
      mode: 'x' as const,
      modifierKey: 'shift' as const,
      onPanComplete: onChange,
    },
  };
}
