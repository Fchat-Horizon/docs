---
title: 'Download'
description: 'Download Horizon for Windows, macOS, and Linux.'
layout: doc
sidebar: false
aside: false
---

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import downloadButt from "./componets/downloadBtn.vue";
import allDownloads from "./componets/allDownloads.vue";

const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
const ver = ref<string | null>(urlParams?.get("ver") ?? null);
const platform = ref("unknown");
const arch = ref("x64");

const isLinux = computed(() => platform.value === "linux");

onMounted(() => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) {
    platform.value = "win";
  } else if (userAgent.includes("mac")) {
    platform.value = "mac";
  } else if (userAgent.includes("linux")) {
    platform.value = "linux";
  }

  if (platform.value === "mac") {
    arch.value = "universal";
  } else {
    arch.value = platform.value === "linux" ? "x86_64" : "x64";
    if (/(arm64|aarch64)/i.test(userAgent)) {
      arch.value = "arm64";
    }
  }
});
</script>

<div class="download-page">
  <div class="download-hero">
    <h1 class="download-title">Download <span class="dl-brand">Horizon</span></h1>
    <p class="download-subtitle">
      <span v-if="ver">Version {{ ver }}</span>
      <span v-else>Free &amp; open source, always and forever!</span>
    </p>
    <downloadButt :version="ver" :platform="platform" :arch="arch" />
    <p v-if="isLinux" class="download-note">
      This will download the AppImage. For distro-packaged versions (.deb, .rpm, AUR, etc.), 
      see the <a href="docs/guides/install#linux">Linux install guide</a>, <b>or look below this for options!</b>
    </p>
  </div>

  <div class="download-divider"></div>

  <allDownloads :version="ver" :platform="platform" />

  <p class="download-footer">
    Need help? Check out the <a href="docs/guides/install">installation guide</a>.
  </p>
</div>

<style lang="scss">
$dl-gradient: linear-gradient(120deg, #6f4bb0 30%, #faae7b 100%);

.download-page {
  max-width: 740px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.download-hero {
  text-align: center;
  padding: 2.5rem 1rem 2.5rem;
}

.download-title {
  font-size: 2.8rem !important;
  font-weight: 700;
  margin-bottom: 0.5rem !important;
  line-height: 1.15;
}

.dl-brand {
  background: $dl-gradient;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline-block;
}

.download-subtitle {
  font-size: 1.05rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.75rem;
}

.download-note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.download-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--vp-c-divider) 30%, var(--vp-c-divider) 70%, transparent);
  margin: 0 0 0.5rem;
}

.download-footer {
  margin-top: 2.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);

  a {
    color: var(--vp-c-brand-1);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
