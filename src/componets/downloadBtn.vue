<script setup lang="ts">
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {
    faWindows,
    faApple,
    faLinux,
  } from '@fortawesome/free-brands-svg-icons';
  import {
    faQuestionCircle,
    faDownload,
  } from '@fortawesome/free-solid-svg-icons';

  import { computed, toRef } from 'vue';
  import { useGithubRelease } from '../composables/useGithubRelease';

  const props = defineProps<{
    platform?: string;
    arch?: string;
    version?: string | null;
  }>();

  const { downloadVersion, assetUrl } = useGithubRelease(
    toRef(props, 'version'),
  );

  const osDetails = computed(() => {
    switch (props.platform) {
      case 'win':
        return { name: 'Windows', platform: 'win', icon: faWindows };
      case 'mac':
        return { name: 'Mac OS', platform: 'mac', icon: faApple };
      case 'linux':
        return { name: 'Linux', platform: 'linux', icon: faLinux };
      default:
        return {
          name: 'Unknown OS',
          platform: 'unknown',
          icon: faQuestionCircle,
        };
    }
  });

  const resolvedArch = computed(() => {
    if (props.arch) return props.arch;
    if (osDetails.value.platform === 'mac') return 'universal';
    if (osDetails.value.platform === 'linux') return 'x86_64';
    return 'x64';
  });

  const fileExtension = computed(() => {
    if (osDetails.value.platform === 'win') return 'exe';
    if (osDetails.value.platform === 'mac') return 'dmg';
    if (osDetails.value.platform === 'linux') return 'AppImage';
    return 'exe';
  });

  const downloadUrl = computed(() => {
    if (!downloadVersion.value) return '';
    const suffix = `-${osDetails.value.platform}-${resolvedArch.value}.${fileExtension.value}`;
    return assetUrl(suffix);
  });

  const buttonLabel = computed(() => {
    if (osDetails.value.platform === 'linux') return 'Download AppImage';
    return `Download for ${osDetails.value.name}`;
  });
</script>

<template>
  <a
    v-if="downloadVersion"
    :href="downloadUrl"
    class="vp-download-btn"
  >
    <FontAwesomeIcon
      :icon="osDetails.icon"
      class="btn-os-icon"
    />
    <span class="btn-body">
      <span class="btn-label">{{ buttonLabel }}</span>
      <span class="btn-version">{{ downloadVersion }}</span>
    </span>
    <FontAwesomeIcon
      :icon="faDownload"
      class="btn-dl-icon"
    />
  </a>
  <span
    v-else
    class="vp-download-btn vp-download-btn--loading"
  >
    <FontAwesomeIcon
      :icon="osDetails.icon"
      class="btn-os-icon"
    />
    <span class="btn-label">Loading&hellip;</span>
  </span>
</template>

<style lang="scss" scoped>
  .vp-download-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 2rem;
    background-color: var(--vp-button-brand-bg);
    color: var(--vp-button-brand-text) !important;
    border: 1px solid var(--vp-button-brand-border);
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none !important;
    transition:
      background-color 0.2s,
      border-color 0.2s,
      box-shadow 0.2s,
      transform 0.15s;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(111, 75, 176, 0.28);

    &:hover {
      background-color: var(--vp-button-brand-hover-bg);
      border-color: var(--vp-button-brand-hover-border);
      color: var(--vp-button-brand-hover-text) !important;
      box-shadow: 0 6px 24px rgba(111, 75, 176, 0.48);
      transform: translateY(-2px);
    }

    &:active {
      background-color: var(--vp-button-brand-active-bg);
      border-color: var(--vp-button-brand-active-border);
      color: var(--vp-button-brand-active-text) !important;
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(111, 75, 176, 0.2);
    }

    &--loading {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .btn-os-icon {
    font-size: 1.4em;
    flex-shrink: 0;
  }

  .btn-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.25;
  }

  .btn-label {
    font-size: 1em;
  }

  .btn-version {
    font-size: 0.72em;
    font-weight: 400;
    opacity: 0.7;
  }

  .btn-dl-icon {
    font-size: 0.9em;
    opacity: 0.65;
    margin-left: 0.25rem;
    flex-shrink: 0;
    transition:
      transform 0.2s ease,
      opacity 0.15s;
  }

  .vp-download-btn:not(.vp-download-btn--loading):hover .btn-dl-icon {
    transform: translateY(3px);
    opacity: 1;
  }
</style>
