<script setup lang="ts">
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {
    faAndroid,
    faApple,
    faGithub,
  } from '@fortawesome/free-brands-svg-icons';
  import { faDownload } from '@fortawesome/free-solid-svg-icons';
  import { ref } from 'vue';
  import { useGithubRelease } from '../composables/useGithubRelease';

  // Pull the latest stable release from Solstice's own repo.
  const { downloadVersion, assetUrl } = useGithubRelease(ref(null), {
    repo: 'Fchat-Horizon/Solstice',
    includePrereleases: false,
    assetPrefix: 'solstice-',
  });
</script>

<template>
  <section
    id="solstice"
    class="solstice-card"
  >
    <div class="solstice-head">
      <div class="solstice-os-icons">
        <FontAwesomeIcon
          :icon="faAndroid"
          class="solstice-os-icon solstice-os-icon--android"
        />
        <FontAwesomeIcon
          :icon="faApple"
          class="solstice-os-icon solstice-os-icon--apple"
        />
      </div>
      <div class="solstice-headings">
        <h2 class="solstice-title">
          On the go? Try <span class="solstice-brand">Solstice</span>
        </h2>
        <p class="solstice-sub">
          Solstice is an independent fork of Horizon for
          <b>Android and iOS</b>, built with the Horizon team's blessing.
        </p>
      </div>
    </div>

    <div
      v-if="downloadVersion"
      class="solstice-dl-row"
    >
      <a
        :href="assetUrl('-solstice.apk')"
        class="solstice-dl-btn"
      >
        <FontAwesomeIcon
          :icon="faAndroid"
          class="btn-os-icon"
        />
        <span class="btn-body">
          <span class="btn-label">Android APK</span>
          <span class="btn-version">{{ downloadVersion }}</span>
        </span>
        <FontAwesomeIcon
          :icon="faDownload"
          class="btn-dl-icon"
        />
      </a>
      <a
        :href="assetUrl('.ipa')"
        class="solstice-dl-btn"
      >
        <FontAwesomeIcon
          :icon="faApple"
          class="btn-os-icon"
        />
        <span class="btn-body">
          <span class="btn-label">iOS IPA</span>
          <span class="btn-version">{{ downloadVersion }}</span>
        </span>
        <FontAwesomeIcon
          :icon="faDownload"
          class="btn-dl-icon"
        />
      </a>
    </div>
    <span
      v-else
      class="solstice-dl-btn solstice-dl-btn--loading"
    >
      <FontAwesomeIcon
        :icon="faDownload"
        class="btn-os-icon"
      />
      <span class="btn-label">Loading&hellip;</span>
    </span>

    <p class="solstice-note">
      On iOS the IPA installs through
      <a
        href="https://sidestore.io/"
        target="_blank"
        rel="noopener"
        >SideStore</a
      >, which re-signs the app on-device with your Apple ID (no paid developer
      account needed). You can also add the SideStore source from the repo for
      one-tap installs and automatic updates.
    </p>

    <p class="solstice-note">
      Solstice is maintained separately from Horizon, meaning the Horizon team
      isn't responsible for it. Please report any issues on the
      <a
        href="https://github.com/Fchat-Horizon/Solstice"
        target="_blank"
        rel="noopener"
        ><FontAwesomeIcon :icon="faGithub" /> Solstice repository</a
      >.
    </p>
  </section>
</template>

<style lang="scss" scoped>
  $solstice-gradient: linear-gradient(120deg, #3ddc84 10%, #6f4bb0 100%);

  .solstice-card {
    margin-top: 2.5rem;
    padding: 1.75rem 1.5rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
    text-align: left;
  }

  .solstice-head {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .solstice-os-icons {
    display: flex;
    gap: 0.55rem;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  .solstice-os-icon {
    font-size: 1.9rem;

    &--android {
      color: #3ddc84;
    }

    &--apple {
      color: var(--vp-c-text-1);
    }
  }

  .solstice-headings {
    flex: 1;
  }

  .solstice-title {
    font-size: 1.35rem !important;
    font-weight: 700;
    margin: 0 0 0.35rem !important;
    padding: 0 !important;
    border: none !important;
    line-height: 1.25;
  }

  .solstice-brand {
    background: $solstice-gradient;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  .solstice-sub {
    font-size: 0.95rem;
    color: var(--vp-c-text-2);
    margin: 0;
  }

  .solstice-dl-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .solstice-dl-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 1.6rem;
    background-color: var(--vp-button-brand-bg);
    color: var(--vp-button-brand-text) !important;
    border: 1px solid var(--vp-button-brand-border);
    border-radius: 10px;
    font-size: 1rem;
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
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(111, 75, 176, 0.2);
    }

    &--loading {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .btn-os-icon {
    font-size: 1.3em;
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

  .solstice-dl-btn:not(.solstice-dl-btn--loading):hover .btn-dl-icon {
    transform: translateY(3px);
    opacity: 1;
  }

  .solstice-note {
    margin-top: 1.1rem;
    margin-bottom: 0;
    font-size: 0.85rem;
    color: var(--vp-c-text-2);

    a {
      color: var(--vp-c-brand-1);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  @media (max-width: 640px) {
    .solstice-dl-row {
      flex-direction: column;
    }

    .solstice-dl-btn {
      width: 100%;
    }

    .solstice-dl-btn .btn-dl-icon {
      margin-left: auto;
    }
  }
</style>
