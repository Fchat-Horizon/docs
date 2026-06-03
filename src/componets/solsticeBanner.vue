<script setup lang="ts">
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { faAndroid } from '@fortawesome/free-brands-svg-icons';
  import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
</script>

<template>
  <section class="solstice-banner">
    <div class="solstice-banner-inner">
      <FontAwesomeIcon
        :icon="faAndroid"
        class="solstice-banner-icon"
      />
      <div class="solstice-banner-text">
        <p class="solstice-banner-title">
          Horizon, now on <span class="solstice-banner-brand">Android</span>
          <span class="solstice-banner-badge">Beta</span>
        </p>
        <p class="solstice-banner-sub">
          Meet <b>Solstice</b>, our community fork for mobile. Take F-Chat with
          you!
        </p>
      </div>
      <a
        href="/download#solstice"
        class="solstice-banner-btn"
      >
        Try Solstice
        <FontAwesomeIcon
          :icon="faArrowRight"
          class="solstice-banner-arrow"
        />
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  $solstice-gradient: linear-gradient(120deg, #3ddc84 10%, #6f4bb0 100%);

  .solstice-banner {
    max-width: 1152px;
    margin: 1rem auto 0;
    padding: 0 1.5rem;
  }

  .solstice-banner-inner {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.4rem 1.6rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 14px;
    background: var(--vp-c-bg-soft);
  }

  .solstice-banner-icon {
    font-size: 2.4rem;
    color: #3ddc84;
    flex-shrink: 0;
  }

  .solstice-banner-text {
    flex: 1;
    min-width: 0;
  }

  .solstice-banner-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 0.2rem;
    line-height: 1.25;
  }

  .solstice-banner-brand {
    background: $solstice-gradient;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  .solstice-banner-badge {
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.5rem;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.15rem 0.5rem;
    border-radius: 1em;
    color: #fff;
    background: #6f4bb0;
    -webkit-text-fill-color: #fff;
  }

  .solstice-banner-sub {
    font-size: 0.92rem;
    color: var(--vp-c-text-2);
    margin: 0;
  }

  .solstice-banner-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    padding: 0.6rem 1.3rem;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none !important;
    color: var(--vp-button-brand-text) !important;
    background-color: var(--vp-button-brand-bg);
    border: 1px solid var(--vp-button-brand-border);
    transition:
      background-color 0.2s,
      box-shadow 0.2s,
      transform 0.15s;

    &:hover {
      background-color: var(--vp-button-brand-hover-bg);
      border-color: var(--vp-button-brand-hover-border);
      box-shadow: 0 6px 20px rgba(111, 75, 176, 0.4);
      transform: translateY(-2px);
    }
  }

  .solstice-banner-arrow {
    font-size: 0.85em;
    transition: transform 0.2s ease;
  }

  .solstice-banner-btn:hover .solstice-banner-arrow {
    transform: translateX(3px);
  }

  @media (max-width: 640px) {
    .solstice-banner-inner {
      flex-direction: column;
      text-align: center;
    }

    .solstice-banner-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
