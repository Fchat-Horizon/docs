const API = 'https://api.horizn.moe';

const DAY_MS = 86_400_000;

export type Platform = 'windows' | 'linux' | 'mac';
export type PlatformCounts = Record<Platform, number>;

export interface ReleaseStat {
  tag: string;
  publishedAt: string;
  prerelease: boolean;
  total: number;
  byPlatform: PlatformCounts;
  daysAsLatest: number;
  isCurrent: boolean;
}

export interface DailyDownloads {
  date: string;
  total: number;
  byPlatform: PlatformCounts;
}

export interface ReleaseLaunch {
  tag: string;
  publishedAt: string;
  prerelease: boolean;
  complete: boolean;
  points: { hours: number; downloads: number }[];
}

export interface StatsData {
  snapshotDate: string;
  downloads: number;
  byPlatform: PlatformCounts;
  stars: number;
  contributors: number;
  releases: ReleaseStat[];
  daily: DailyDownloads[];
  launches: ReleaseLaunch[];
  starHistory: { date: string; stars: number }[];
}

interface ApiSummary {
  takenAt: string;
  downloads: number;
  byPlatform: PlatformCounts;
  stars: number;
  contributors: number;
}

interface ApiRelease {
  tag: string;
  publishedAt: string;
  prerelease: boolean;
  downloads: number;
  byPlatform: PlatformCounts;
}

interface ApiDay {
  date: string;
  downloads: number;
  byPlatform: PlatformCounts;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`${API}${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

const platformCounts = (counts: PlatformCounts): PlatformCounts => ({
  windows: counts.windows,
  linux: counts.linux,
  mac: counts.mac,
});

function buildReleases(releases: ApiRelease[], takenAt: string): ReleaseStat[] {
  const snapshotMs = Date.parse(takenAt);
  return releases.map((release, i) => {
    // ^ A stable release stays "latest" until the next stable one; a
    // prerelease is replaced by whatever ships next, stable or not.
    const successor = releases
      .slice(i + 1)
      .find((next) => release.prerelease || !next.prerelease);
    const start = Date.parse(release.publishedAt);
    const end = successor ? Date.parse(successor.publishedAt) : snapshotMs;
    return {
      tag: release.tag,
      publishedAt: release.publishedAt,
      prerelease: release.prerelease,
      total: release.downloads,
      byPlatform: platformCounts(release.byPlatform),
      daysAsLatest: (end - start) / DAY_MS,
      isCurrent: !successor,
    };
  });
}

export async function fetchStats(): Promise<StatsData> {
  const [summary, releases, daily, launches, starHistory] = await Promise.all([
    get<ApiSummary>('/stats/summary'),
    get<ApiRelease[]>('/stats/releases'),
    get<ApiDay[]>('/stats/daily'),
    get<ReleaseLaunch[]>('/stats/launches'),
    get<{ date: string; stars: number }[]>('/stats/stars'),
  ]);

  return {
    snapshotDate: summary.takenAt,
    downloads: summary.downloads,
    byPlatform: platformCounts(summary.byPlatform),
    stars: summary.stars,
    contributors: summary.contributors,
    releases: buildReleases(releases, summary.takenAt),
    daily: daily.map((d) => ({
      date: d.date,
      total: d.downloads,
      byPlatform: platformCounts(d.byPlatform),
    })),
    launches,
    starHistory,
  };
}
