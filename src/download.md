---
title: "Download"
description: "Download Horizon"
layout: home
---

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import downloadButt from "./componets/downloadBtn.vue";

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

<div class="download-container">
  
# Download

Download {{ ver || "the latest release" }} of **Horizon**.

<downloadButt :version="ver" :platform="platform" :arch="arch" />

<p v-if="isLinux" class="alt-packages">
  Using Linux? This download is the AppImage. For distro packages and other
  install options, see the
  <a href="docs/guides/install#linux">alternate package methods</a>.
</p>

Need help installing? Check out the [installation guide](docs/guides/install).

Looking for a specific version or platform? Check out our [GitHub releases](https://github.com/Fchat-Horizon/Horizon/releases).

</div>

<style lang="scss">
.download-container {
    padding: 2rem;
    background: linear-gradient(135deg, #f9fafc, #e4ebf5);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 2rem auto;
    max-width: 800px;
    text-align: center;
}

.download-container h1 {
    margin-bottom: 1rem;
    color: #333;
}

.alt-packages {
    margin-top: 1rem;
    font-size: 0.95rem;
}

 
.dark{ 
.download-container {
    padding: 2rem;
    background: linear-gradient(135deg, #292329, #907281);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 2rem auto;
    max-width: 800px;
    text-align: center;
}

.download-container h1 {
    margin-bottom: 1rem;
    color: #ffffff;
}

.alt-packages {
    margin-top: 1rem;
    font-size: 0.95rem;
    color: #f4e9ef;
}
}
</style>
