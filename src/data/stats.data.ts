import { defineLoader } from 'vitepress';
import { fetchStats, type StatsData } from './stats';

declare const data: StatsData | null;
export { data };

export default defineLoader({
  async load(): Promise<StatsData | null> {
    try {
      return await fetchStats();
    } catch (err) {
      // * Offline local dev renders without stats; CI must fail.
      if (!process.env.CI) {
        console.warn(`Stats unavailable: ${(err as Error).message}`);
        return null;
      }
      throw err;
    }
  },
});
