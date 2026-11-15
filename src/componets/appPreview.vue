<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useData, withBase } from 'vitepress';
  import clientWindow from './clientWindow.vue';

  const themes = [
    { id: 'wilted-rose', name: 'Wilted Rose' },
    { id: 'peached', name: 'Peached' },
    { id: 'default', name: 'Default' },
    { id: 'dark', name: 'Dark' },
    { id: 'dark-dimmed', name: 'Dark Dimmed' },
    { id: 'moon-prism', name: 'Moon Prism' },
    { id: 'mocha', name: 'Mocha' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'mars', name: 'Mars' },
    { id: 'light', name: 'Light' },
    { id: 'snowed-in', name: 'Snowed In' },
    { id: 'no-exceptions', name: 'No Exceptions' },
  ] as const;
  type ThemeId = (typeof themes)[number]['id'];

  const { isDark } = useData();

  // ^ Null until mounted: server markup can't depend on the visitor's scheme.
  const selected = ref<ThemeId | null>(null);
  const previous = ref<ThemeId | null>(null);
  // * Keys the incoming copy so its fade restarts.
  const generation = ref(0);
  let picked = false;

  function show(id: ThemeId) {
    if (id === selected.value) return;
    // ! The first call only resolves "auto": nothing to fade from.
    if (selected.value) {
      previous.value = selected.value;
      generation.value++;
    }
    selected.value = id;
  }

  function followSite() {
    if (!picked) show(isDark.value ? 'wilted-rose' : 'peached');
  }
  onMounted(followSite);
  watch(isDark, followSite);

  function pick(id: ThemeId) {
    picked = true;
    show(id);
  }

  const selectedName = computed(
    () => themes.find((theme) => theme.id === selected.value)?.name,
  );
</script>

<template>
  <div class="app-preview">
    <div class="app">
      <div class="window">
        <clientWindow
          v-if="previous"
          :key="`from-${generation}`"
          class="outgoing"
          :theme="previous"
          aria-hidden="true"
        />
        <clientWindow
          :key="generation"
          :class="{ incoming: previous }"
          :theme="selected ?? 'auto'"
          @animationend="previous = null"
        />
      </div>
    </div>

    <div class="picker">
      <span
        id="app-theme-label"
        class="picker-label"
        >Theme</span
      >
      <div
        class="swatches"
        role="radiogroup"
        aria-labelledby="app-theme-label"
      >
        <label
          v-for="theme in themes"
          :key="theme.id"
          class="swatch"
          :data-client-theme="theme.id"
          :title="theme.name"
        >
          <input
            type="radio"
            name="app-theme"
            :value="theme.id"
            :checked="selected === theme.id"
            :aria-label="theme.name"
            @change="pick(theme.id)"
          />
          <span class="chip"></span>
        </label>
      </div>
      <span class="picker-name">{{ selectedName }}</span>
      <span class="picker-note">
        Every theme here ships with Horizon. You can also
        <a :href="withBase('/docs/guides/custom-css')">write your own CSS</a>.
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .app-preview {
    --frame-border: rgba(68, 33, 74, 0.2);
    --frame-shadow: 0 30px 60px -30px rgba(68, 33, 74, 0.5);
  }

  .dark .app-preview {
    --frame-border: rgba(255, 255, 255, 0.14);
    --frame-shadow: 0 30px 60px -24px rgba(0, 0, 0, 0.8);
  }

  .app {
    overflow: hidden;
    border: 1px solid var(--frame-border);
    border-radius: 12px;
    box-shadow: var(--frame-shadow);
  }

  .window {
    position: relative;
  }

  // ^ Whole copies crossfade: fading each colour leaves text unreadable midway.
  .outgoing {
    position: absolute;
    inset: 0;
  }

  .incoming {
    position: relative;
    animation: client-in 0.16s ease-out both;
  }

  @keyframes client-in {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .incoming {
      animation: none;
    }
  }

  // ! Oversized so text stays readable on phones; the right side is cropped.
  @media (max-width: 640px) {
    .window {
      width: 190%;
    }
  }

  .picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-top: 24px;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }

  .picker-label {
    font-weight: 600;
    color: var(--vp-c-text-1);
  }

  .picker-name {
    min-width: 7em;
  }

  .picker-note {
    margin-left: auto;

    a {
      color: var(--vp-c-brand-1);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .swatch {
    position: relative;
    display: grid;
    cursor: pointer;

    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }
  }

  .chip {
    width: 32px;
    height: 32px;
    border: 1px solid var(--frame-border);
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--hc-base) 50%,
      var(--hc-active) 50%
    );
  }

  .swatch input:checked + .chip {
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 3px;
  }

  .swatch input:focus-visible + .chip {
    outline: 2px solid var(--vp-c-text-1);
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .swatches {
      gap: 8px;
    }

    .chip {
      width: 30px;
      height: 30px;
    }
  }
</style>
