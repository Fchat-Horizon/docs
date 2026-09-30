<script setup lang="ts">
  import { computed } from 'vue';
  import type { StatsData } from '../data/stats';
  import { PLATFORMS, formatNumber } from './chartUtils';

  const props = defineProps<{ stats: StatsData }>();

  const tiles = computed(() => [
    { label: 'Downloads', value: formatNumber(props.stats.downloads) },
    {
      label: 'Stable releases',
      value: formatNumber(
        props.stats.releases.filter((r) => !r.prerelease).length,
      ),
    },
    { label: 'GitHub stars', value: formatNumber(props.stats.stars) },
    { label: 'Contributors', value: formatNumber(props.stats.contributors) },
  ]);

  const split = computed(() => {
    const total = PLATFORMS.reduce(
      (sum, p) => sum + props.stats.byPlatform[p.key],
      0,
    );
    return PLATFORMS.map((p) => ({
      ...p,
      share: props.stats.byPlatform[p.key] / Math.max(total, 1),
    }));
  });
</script>

<template>
  <div class="stats-overview">
    <div class="tiles">
      <div
        v-for="tile in tiles"
        :key="tile.label"
        class="tile"
      >
        <div class="tile-label">{{ tile.label }}</div>
        <div class="tile-value">{{ tile.value }}</div>
      </div>
    </div>

    <div class="split">
      <div class="tile-label">Downloads by platform</div>
      <div
        class="split-bar"
        role="img"
        :aria-label="
          split
            .map((s) => `${s.label} ${Math.round(s.share * 100)}%`)
            .join(', ')
        "
      >
        <span
          v-for="s in split"
          :key="s.key"
          :class="['split-segment', s.key]"
          :style="{ flexGrow: s.share }"
        />
      </div>
      <div class="split-labels">
        <span
          v-for="s in split"
          :key="s.key"
          class="split-label"
        >
          <span :class="['swatch', s.key]" />
          <strong>{{ Math.round(s.share * 100) }}%</strong> {{ s.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .stats-overview {
    --series-windows: #2a78d6;
    --series-linux: #eb6834;
    --series-mac: #1baf7a;
    margin: 24px 0;
  }

  :root.dark .stats-overview {
    --series-windows: #3987e5;
    --series-linux: #d95926;
    --series-mac: #199e70;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .tile,
  .split {
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
  }

  .tile-label {
    font-size: 13px;
    color: var(--vp-c-text-2);
  }

  .tile-value {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--vp-c-text-1);
  }

  .split {
    margin-top: 12px;
  }

  .split-bar {
    display: flex;
    gap: 2px;
    height: 12px;
    margin: 8px 0;
  }

  .split-segment:first-child {
    border-radius: 4px 0 0 4px;
  }

  .split-segment:last-child {
    border-radius: 0 4px 4px 0;
  }

  .split-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }

  .split-label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .split-label strong {
    color: var(--vp-c-text-1);
  }

  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .windows {
    background: var(--series-windows);
  }

  .linux {
    background: var(--series-linux);
  }

  .mac {
    background: var(--series-mac);
  }
</style>
