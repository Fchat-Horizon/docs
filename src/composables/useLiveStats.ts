import { onMounted, shallowRef } from 'vue';
import { fetchStats, type StatsData } from '../data/stats';
import { data } from '../data/stats.data';

let latest: Promise<StatsData> | undefined;

// ^ Pages render with the stats baked in at build time, so they work without
// the API, then swap in its latest hourly snapshot once it arrives. A failed
// fetch leaves the built data in place.
export function useLiveStats() {
  const stats = shallowRef<StatsData | null>(data);

  onMounted(async () => {
    latest ??= fetchStats();
    try {
      const fresh = await latest;
      const current = stats.value?.snapshotDate;
      if (!current || Date.parse(fresh.snapshotDate) > Date.parse(current))
        stats.value = fresh;
    } catch {
      latest = undefined;
    }
  });

  return stats;
}
