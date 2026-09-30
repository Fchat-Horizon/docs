<script setup lang="ts">
  import { withBase } from 'vitepress';
  import { computed } from 'vue';
  import { useLiveStats } from '../../../composables/useLiveStats';

  const stats = useLiveStats();
  const thousands = computed(() =>
    Math.floor((stats.value?.downloads ?? 0) / 1000),
  );
</script>

<template>
  <a
    v-if="stats"
    class="hero-stats"
    :href="withBase('/stats')"
  >
    <strong>{{ thousands }}K+</strong> downloads, Check out our stats! →
  </a>
</template>

<style scoped>
  .hero-stats {
    display: inline-block;
    margin-top: 20px;
    font-size: 15px;
    color: var(--vp-c-text-2);
    text-decoration: none;
    transition: color 120ms ease;
  }

  .hero-stats:hover {
    color: var(--vp-c-brand-1);
  }

  .hero-stats strong {
    color: var(--vp-c-text-1);
  }
</style>
