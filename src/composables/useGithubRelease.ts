import { ref, watch, onMounted, type Ref } from 'vue';

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  assets: ReleaseAsset[];
}

interface UseGithubReleaseOptions {
  repo?: string;
  // ^ /releases/latest skips prereleases, so beta-only projects need the list endpoint.
  includePrereleases?: boolean;
  // Prefix for reconstructing an asset URL when release metadata can't be fetched.
  assetPrefix?: string;
}

const DEFAULTS: Required<UseGithubReleaseOptions> = {
  repo: 'Fchat-Horizon/Horizon',
  includePrereleases: false,
  assetPrefix: 'F-Chat.Horizon-',
};

const cache = new Map<string, Promise<GithubRelease>>();

function buildApiUrl(
  repo: string,
  includePrereleases: boolean,
  version?: string | null,
): string {
  const base = `https://api.github.com/repos/${repo}/releases`;
  if (version) return `${base}/tags/${version}`;
  if (includePrereleases) return `${base}?per_page=1`;
  return `${base}/latest`;
}

async function fetchRelease(url: string): Promise<GithubRelease> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  const data = await response.json();
  // The list endpoint returns an array (newest first); unwrap it.
  return Array.isArray(data) ? data[0] : data;
}

export function useGithubRelease(
  version: Ref<string | null | undefined>,
  options: UseGithubReleaseOptions = {},
) {
  const { repo, includePrereleases, assetPrefix } = { ...DEFAULTS, ...options };
  const downloadVersion = ref<string | undefined>(undefined);
  const releaseAssets = ref<ReleaseAsset[]>([]);

  async function resolve() {
    const url = buildApiUrl(repo, includePrereleases, version.value);
    try {
      if (!cache.has(url)) {
        cache.set(url, fetchRelease(url));
      }
      const data = await cache.get(url)!;
      downloadVersion.value = data?.tag_name;
      releaseAssets.value = data?.assets ?? [];
    } catch {
      cache.delete(url);
      downloadVersion.value = undefined;
      releaseAssets.value = [];
    }
  }

  onMounted(resolve);
  watch(version, () => {
    const url = buildApiUrl(repo, includePrereleases, version.value);
    cache.delete(url);
    resolve();
  });

  function assetUrl(suffix: string): string {
    const asset = releaseAssets.value.find((a) => a.name.endsWith(suffix));
    if (asset) return asset.browser_download_url;
    if (!downloadVersion.value) return '#';
    const ver = downloadVersion.value.replace(/^v/, '');
    return `https://github.com/${repo}/releases/download/${downloadVersion.value}/${assetPrefix}${ver}${suffix}`;
  }

  return { downloadVersion, releaseAssets, assetUrl };
}
