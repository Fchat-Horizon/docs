---
title: 'Stats'
description: 'Horizon download and release statistics, updated hourly.'
aside: false
---

<script setup lang="ts">
import { useLiveStats } from "./composables/useLiveStats";
import { formatDateTime } from "./componets/chartUtils";
import statsOverview from "./componets/statsOverview.vue";
import downloadsChart from "./componets/downloadsChart.vue";
import starHistoryChart from "./componets/starHistoryChart.vue";

const stats = useLiveStats();
</script>

# Stats

<template v-if="stats">

We count downloads from Horizon's GitHub releases and skip the files the auto-updater checks. Our [API](https://api.horizn.moe) takes a snapshot every hour, and this page shows the one from {{ formatDateTime(stats.snapshotDate) }}.

<statsOverview :stats="stats" />

## Downloads

<downloadsChart :stats="stats" />

## GitHub stars

<starHistoryChart :stats="stats" />

</template>
<p v-else>You've encountered a bug, and the stats aren't available. Please contact us!</p>
