<script setup lang="ts">
  import {
    faWindows,
    faApple,
    faLinux,
  } from '@fortawesome/free-brands-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { faDownload } from '@fortawesome/free-solid-svg-icons';
  import { ref, onMounted, watch, toRef } from 'vue';
  import { useGithubRelease } from '../composables/useGithubRelease';

  const props = defineProps<{
    version?: string | null;
    platform?: string;
  }>();

  const { downloadVersion, assetUrl } = useGithubRelease(
    toRef(props, 'version'),
  );
  const activeTab = ref<'win' | 'mac' | 'linux'>('win');

  onMounted(() => {
    if (
      props.platform === 'win' ||
      props.platform === 'mac' ||
      props.platform === 'linux'
    ) {
      activeTab.value = props.platform;
    }
  });
  watch(
    () => props.platform,
    (p) => {
      if (p === 'win' || p === 'mac' || p === 'linux') activeTab.value = p;
    },
  );
</script>

<template>
  <div
    v-if="downloadVersion"
    class="all-downloads"
  >
    <div class="all-downloads-header">
      <p class="all-downloads-title">All platforms</p>
      <span class="version-chip">{{ downloadVersion }}</span>
    </div>
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'win' }]"
        @click="activeTab = 'win'"
      >
        <FontAwesomeIcon :icon="faWindows" /> Windows
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'mac' }]"
        @click="activeTab = 'mac'"
      >
        <FontAwesomeIcon :icon="faApple" /> macOS
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'linux' }]"
        @click="activeTab = 'linux'"
      >
        <FontAwesomeIcon :icon="faLinux" /> Linux
      </button>
    </div>
    <div class="tab-content">
      <div
        v-if="activeTab === 'win'"
        class="formats"
      >
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.exe</span>
          <div class="arch-links">
            <a :href="assetUrl('-win-x64.exe')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
            <a :href="assetUrl('-win-arm64.exe')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
          </div>
        </div>
      </div>
      <div
        v-else-if="activeTab === 'mac'"
        class="formats"
      >
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.dmg</span>
          <div class="arch-links">
            <a :href="assetUrl('-mac-universal.dmg')"
              ><FontAwesomeIcon :icon="faDownload" /> Universal</a
            >
            <a :href="assetUrl('-mac-arm64.dmg')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
            <a :href="assetUrl('-mac-x64.dmg')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
          </div>
        </div>
      </div>
      <div
        v-else
        class="formats formats--linux"
      >
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.AppImage</span>
          <div class="arch-links">
            <a :href="assetUrl('-linux-x86_64.AppImage')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
            <a :href="assetUrl('-linux-arm64.AppImage')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
          </div>
        </div>
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.deb</span>
          <div class="arch-links">
            <a :href="assetUrl('-linux-amd64.deb')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
            <a :href="assetUrl('-linux-arm64.deb')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
          </div>
        </div>
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.rpm</span>
          <div class="arch-links">
            <a :href="assetUrl('-linux-x86_64.rpm')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
            <a :href="assetUrl('-linux-aarch64.rpm')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
          </div>
        </div>
        <div class="format-row multi-arch-row">
          <span class="fmt-badge">.tar.gz</span>
          <div class="arch-links">
            <a :href="assetUrl('-linux-x64.tar.gz')"
              ><FontAwesomeIcon :icon="faDownload" /> x64</a
            >
            <a :href="assetUrl('-linux-arm64.tar.gz')"
              ><FontAwesomeIcon :icon="faDownload" /> arm64</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .all-downloads {
    margin-top: 1.5rem;
  }

  .all-downloads-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }

  .all-downloads-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--vp-c-text-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  .version-chip {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.1rem 0.5rem;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 1em;
    color: var(--vp-c-text-2);
    font-family: var(--vp-font-family-mono);
  }

  .tab-bar {
    display: inline-flex;
    gap: 0.25rem;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 0.25rem;
    margin-bottom: 1rem;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      color: var(--vp-c-text-1);
      background: var(--vp-c-bg-mute);
    }

    &.active {
      background: var(--vp-c-bg);
      color: var(--vp-c-text-1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  .tab-content {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    background: var(--vp-c-bg-soft);
  }

  .formats {
    display: flex;
    flex-direction: column;
  }

  .format-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    text-decoration: none;
    color: var(--vp-c-text-1);
    border-bottom: 1px solid var(--vp-c-divider);

    &:last-child {
      border-bottom: none;
    }
  }

  .fmt-badge {
    font-size: 0.8rem;
    font-weight: 500;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    padding: 0.1rem 0.45rem;
  }

  .multi-arch-row {
    justify-content: space-between;
    cursor: default;

    .fmt-badge {
      min-width: 5.5rem;
    }
  }

  .arch-links {
    display: flex;
    gap: 0.5rem;

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--vp-c-brand-1);
      text-decoration: none;
      padding: 0.22rem 0.6rem;
      border-radius: 5px;
      border: 1px solid var(--vp-c-brand-1);
      transition:
        background 0.15s,
        color 0.15s;

      &:hover {
        background: var(--vp-c-brand-1);
        color: #fff;
      }
    }
  }
</style>
