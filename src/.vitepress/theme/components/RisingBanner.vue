<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
  import { useData, withBase } from 'vitepress';

  const { frontmatter } = useData();
  const isHome = computed(() => frontmatter.value.layout === 'home');

  const banner = ref<HTMLElement | null>(null);
  let observer: ResizeObserver | null = null;

  function clearHeight() {
    if (typeof document === 'undefined') return;
    document.documentElement.style.removeProperty('--vp-layout-top-height');
  }

  function syncHeight() {
    if (typeof document === 'undefined' || !banner.value) return;
    document.documentElement.style.setProperty(
      '--vp-layout-top-height',
      `${banner.value.offsetHeight}px`,
    );
  }

  watch(
    isHome,
    async (show) => {
      observer?.disconnect();
      observer = null;
      if (!show) {
        clearHeight();
        return;
      }
      await nextTick();
      syncHeight();
      if (typeof ResizeObserver !== 'undefined' && banner.value) {
        observer = new ResizeObserver(syncHeight);
        observer.observe(banner.value);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    observer?.disconnect();
    clearHeight();
  });
</script>

<template>
  <div
    v-if="isHome"
    ref="banner"
    class="rising-banner"
    role="region"
    aria-label="Notice for F-Chat Rising users"
  >
    <p class="rising-banner__text">
      <strong>Using F-Chat Rising?</strong> Rising can no longer connect to
      chat. Horizon is its community-run continuation, with all the same
      features, your logs, and active updates.
    </p>
    <a
      class="rising-banner__cta"
      :href="
        withBase('/docs/faq.html#i-m-a-rising-user-and-i-can-t-connect-anymore')
      "
    >
      Rising user? Look here &rarr;
    </a>
  </div>
</template>

<style scoped lang="scss">
  .rising-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--vp-z-index-layout-top);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem 1.25rem;
    padding: 0.6rem 1.5rem;
    background: linear-gradient(120deg, #432371 0%, #a0487e 60%, #ffa978 100%);
    color: #fff;
    font-size: 0.875rem;
    line-height: 1.4;
    text-align: center;
  }

  .rising-banner__text {
    margin: 0;
    max-width: 70ch;
  }

  .rising-banner__cta {
    flex-shrink: 0;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
    transition:
      background 180ms ease,
      transform 180ms ease;
  }

  .rising-banner__cta:hover,
  .rising-banner__cta:focus {
    background: rgba(255, 255, 255, 0.28);
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    .rising-banner__cta {
      transition: none;
    }
  }
</style>
