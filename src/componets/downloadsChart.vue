<script setup lang="ts">
  import { ref } from 'vue';
  import type { StatsData } from '../data/stats';
  import dailyDownloadsChart from './dailyDownloadsChart.vue';
  import launchesChart from './launchesChart.vue';
  import releaseDownloadsChart from './releaseDownloadsChart.vue';

  defineProps<{ stats: StatsData }>();

  const VIEWS = {
    release: releaseDownloadsChart,
    time: dailyDownloadsChart,
    launches: launchesChart,
  };
  const view = ref<keyof typeof VIEWS>('release');
</script>

<template>
  <KeepAlive>
    <component
      :is="VIEWS[view]"
      :stats="stats"
    >
      <template #controls>
        <div
          class="chart-segmented"
          role="group"
          aria-label="View"
        >
          <button
            :aria-pressed="view === 'release'"
            @click="view = 'release'"
          >
            By release
          </button>
          <button
            :aria-pressed="view === 'time'"
            @click="view = 'time'"
          >
            Over time
          </button>
          <button
            :aria-pressed="view === 'launches'"
            @click="view = 'launches'"
          >
            Launches
          </button>
        </div>
      </template>
    </component>
  </KeepAlive>
</template>
