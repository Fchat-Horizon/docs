---
title: "Download"
description: "Download Horizon"
layout: home
---

<script setup lang="ts">
import downloadButt from './componets/downloadBtn.vue';

let ver: string | null = null;

if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  ver = urlParams.get('ver');
}
</script>

<div class="download-container">
  
# Download

Download {{ ver || 'the latest release ' }} of **Horizon**.

<downloadButt :version="ver"/>

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
}
</style>
