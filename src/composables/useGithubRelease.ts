import { ref, watch, onMounted, type Ref } from 'vue';

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

const cache = new Map<
  string,
  Promise<{ tag_name: string; assets: ReleaseAsset[] }>
>();

function buildApiUrl(version?: string | null): string {
  return version
    ? `https://api.github.com/repos/Fchat-Horizon/Horizon/releases/tags/${version}`
    : `https://api.github.com/repos/Fchat-Horizon/Horizon/releases/latest`;
}

async function fetchRelease(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json();
}

export function useGithubRelease(version: Ref<string | null | undefined>) {
  const downloadVersion = ref<string | undefined>(undefined);
  const releaseAssets = ref<ReleaseAsset[]>([]);

  async function resolve() {
    const url = buildApiUrl(version.value);
    try {
      if (!cache.has(url)) {
        cache.set(url, fetchRelease(url));
      }
      const data = await cache.get(url)!;
      downloadVersion.value = data.tag_name;
      releaseAssets.value = data.assets ?? [];
    } catch {
      cache.delete(url);
      downloadVersion.value = undefined;
      releaseAssets.value = [];
    }
  }

  onMounted(resolve);
  watch(version, () => {
    const url = buildApiUrl(version.value);
    cache.delete(url);
    resolve();
  });

  function assetUrl(suffix: string): string {
    const asset = releaseAssets.value.find((a) => a.name.endsWith(suffix));
    if (asset) return asset.browser_download_url;
    if (!downloadVersion.value) return '#';
    const ver = downloadVersion.value.replace(/^v/, '');
    return `https://github.com/Fchat-Horizon/Horizon/releases/download/${downloadVersion.value}/F-Chat.Horizon-${ver}${suffix}`;
  }

  return { downloadVersion, releaseAssets, assetUrl };
}
