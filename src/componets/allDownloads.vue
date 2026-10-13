<script setup lang="ts">
  import {
    faWindows,
    faApple,
    faLinux,
  } from '@fortawesome/free-brands-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {
    faCheck,
    faChevronRight,
    faCopy,
    faDownload,
  } from '@fortawesome/free-solid-svg-icons';
  import { computed, ref, onMounted, watch, toRef } from 'vue';
  import {
    useGithubRelease,
    type ReleaseAsset,
  } from '../composables/useGithubRelease';

  type Platform = 'win' | 'mac' | 'linux';

  interface FormatOption {
    name: string;
    ext: string;
    description: string;
    guide?: string;
    // * Example terminal step after downloading; omitted where it's just "open the file"
    install?: (file: string) => string;
    files: { arch: string; suffix: string }[];
  }

  const props = defineProps<{
    version?: string | null;
    platform?: string;
  }>();

  const { downloadVersion, findAsset } = useGithubRelease(
    toRef(props, 'version'),
  );
  const activeTab = ref<Platform>('win');

  const FORMATS: Record<Platform, FormatOption[]> = {
    win: [
      {
        name: 'Installer',
        ext: '.exe',
        description: 'Installs Horizon for your user and keeps it up to date.',
        files: [
          { arch: 'x64', suffix: '-win-x64.exe' },
          { arch: 'arm64', suffix: '-win-arm64.exe' },
        ],
      },
      {
        name: 'Portable',
        ext: '.zip',
        description: 'Runs from any folder or USB stick. Updated by hand.',
        guide: 'docs/guides/install#portable',
        files: [
          { arch: 'x64', suffix: '-win-x64-portable.zip' },
          { arch: 'arm64', suffix: '-win-arm64-portable.zip' },
        ],
      },
    ],
    mac: [
      {
        name: 'Disk image',
        ext: '.dmg',
        description: 'Drag into Applications. Universal runs on any Mac.',
        files: [
          { arch: 'Universal', suffix: '-mac-universal.dmg' },
          { arch: 'arm64', suffix: '-mac-arm64.dmg' },
          { arch: 'x64', suffix: '-mac-x64.dmg' },
        ],
      },
    ],
    linux: [
      {
        name: 'AppImage',
        ext: '.AppImage',
        description:
          'Runs on most distros without installing, and updates itself.',
        install: (file) => `chmod +x ${file} && ./${file}`,
        files: [
          { arch: 'x64', suffix: '-linux-x86_64.AppImage' },
          { arch: 'arm64', suffix: '-linux-arm64.AppImage' },
        ],
      },
      {
        name: 'Debian / Ubuntu',
        ext: '.deb',
        description: 'Install with apt or dpkg.',
        install: (file) => `sudo apt install ./${file}`,
        files: [
          { arch: 'x64', suffix: '-linux-amd64.deb' },
          { arch: 'arm64', suffix: '-linux-arm64.deb' },
        ],
      },
      {
        name: 'Fedora / openSUSE',
        ext: '.rpm',
        description: 'Install with dnf, zypper or rpm.',
        install: (file) => `sudo dnf install ./${file}`,
        files: [
          { arch: 'x64', suffix: '-linux-x86_64.rpm' },
          { arch: 'arm64', suffix: '-linux-aarch64.rpm' },
        ],
      },
      {
        name: 'Archive',
        ext: '.tar.gz',
        description: 'The unpacked app, to run from any folder.',
        install: (file) => {
          const dir = file.replace(/\.tar\.gz$/, '');
          return `tar -xzf ${file} && ./${dir}/horizon-electron`;
        },
        files: [
          { arch: 'x64', suffix: '-linux-x64.tar.gz' },
          { arch: 'arm64', suffix: '-linux-arm64.tar.gz' },
        ],
      },
      {
        name: 'Portable',
        ext: '.tar.gz',
        description: 'The AppImage plus its own data folder, for USB sticks.',
        guide: 'docs/guides/install#portable',
        install: (file) => {
          const appImage = file.replace(/-portable\.tar\.gz$/, '.AppImage');
          return `tar -xzf ${file} && ./Horizon/${appImage}`;
        },
        files: [
          { arch: 'x64', suffix: '-linux-x86_64-portable.tar.gz' },
          { arch: 'arm64', suffix: '-linux-arm64-portable.tar.gz' },
        ],
      },
    ],
  };

  // ^ Driven by the release's actual assets, so formats missing from older
  // releases (like portable builds before 2.4.2) drop out instead of 404ing
  const rows = computed(() =>
    FORMATS[activeTab.value]
      .map((format) => ({
        ...format,
        key: `${activeTab.value}:${format.name}`,
        files: format.files
          .map((file) => ({ ...file, asset: findAsset(file.suffix) }))
          .filter(
            (file): file is typeof file & { asset: ReleaseAsset } =>
              file.asset !== undefined,
          ),
      }))
      .filter((format) => format.files.length > 0),
  );

  function formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function sha256(asset: ReleaseAsset): string | undefined {
    return asset.digest?.replace(/^sha256:/, '');
  }

  const VERIFY_COMMAND: Record<Platform, string> = {
    win: 'Get-FileHash <file>',
    mac: 'shasum -a 256 <file>',
    linux: 'sha256sum <file>',
  };

  const expanded = ref(new Set<string>());

  function toggle(key: string) {
    const next = new Set(expanded.value);
    if (!next.delete(key)) next.add(key);
    expanded.value = next;
  }

  const copied = ref<string | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    copied.value = text;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = null), 1500);
  }

  function isPlatform(p: string | undefined): p is Platform {
    return p === 'win' || p === 'mac' || p === 'linux';
  }

  onMounted(() => {
    if (isPlatform(props.platform)) activeTab.value = props.platform;
  });
  watch(
    () => props.platform,
    (p) => {
      if (isPlatform(p)) activeTab.value = p;
    },
  );
</script>

<template>
  <div
    v-if="downloadVersion"
    class="all-downloads"
  >
    <div class="all-downloads-header">
      <p class="all-downloads-title">All platforms</p>
      <span class="version-chip">{{ downloadVersion }}</span>
    </div>
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'win' }]"
        @click="activeTab = 'win'"
      >
        <FontAwesomeIcon :icon="faWindows" /> Windows
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'mac' }]"
        @click="activeTab = 'mac'"
      >
        <FontAwesomeIcon :icon="faApple" /> macOS
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'linux' }]"
        @click="activeTab = 'linux'"
      >
        <FontAwesomeIcon :icon="faLinux" /> Linux
      </button>
    </div>
    <div class="tab-content">
      <div
        v-for="row in rows"
        :key="row.key"
        class="format-row"
      >
        <div class="format-main">
          <div class="format-info">
            <div class="format-heading">
              <span class="format-name">{{ row.name }}</span>
              <span class="fmt-badge">{{ row.ext }}</span>
            </div>
            <p class="format-desc">
              {{ row.description }}
              <a
                v-if="row.guide"
                :href="row.guide"
                >How it works</a
              >
              <button
                class="details-toggle"
                :aria-expanded="expanded.has(row.key)"
                @click="toggle(row.key)"
              >
                Details
                <FontAwesomeIcon
                  :icon="faChevronRight"
                  class="details-chevron"
                />
              </button>
            </p>
          </div>
          <div class="arch-links">
            <a
              v-for="file in row.files"
              :key="file.arch"
              :href="file.asset.browser_download_url"
              ><FontAwesomeIcon :icon="faDownload" /> {{ file.arch }}</a
            >
          </div>
        </div>
        <div
          v-if="expanded.has(row.key)"
          class="format-details"
        >
          <dl
            v-for="file in row.files"
            :key="file.arch"
            class="file-meta"
          >
            <dt>{{ file.arch }}</dt>
            <dd>
              <span class="file-name">{{ file.asset.name }}</span>
              <span class="file-size">{{ formatSize(file.asset.size) }}</span>
            </dd>
            <dd
              v-if="sha256(file.asset)"
              class="file-hash"
            >
              <code>{{ sha256(file.asset) }}</code>
              <button
                class="copy-btn"
                :title="
                  copied === sha256(file.asset) ? 'Copied' : 'Copy SHA-256'
                "
                @click="copy(sha256(file.asset)!)"
              >
                <FontAwesomeIcon
                  :icon="copied === sha256(file.asset) ? faCheck : faCopy"
                />
              </button>
            </dd>
            <dd
              v-if="row.install"
              class="file-command"
            >
              <code>{{ row.install(file.asset.name) }}</code>
              <button
                class="copy-btn"
                :title="
                  copied === row.install(file.asset.name)
                    ? 'Copied'
                    : 'Copy command'
                "
                @click="copy(row.install(file.asset.name))"
              >
                <FontAwesomeIcon
                  :icon="
                    copied === row.install(file.asset.name) ? faCheck : faCopy
                  "
                />
              </button>
            </dd>
          </dl>
          <p class="command-hint">
            Check your download's SHA-256 with
            <code>{{ VERIFY_COMMAND[activeTab] }}</code>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .all-downloads {
    margin-top: 1.5rem;
  }

  .all-downloads-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }

  .all-downloads-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--vp-c-text-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  .version-chip {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.1rem 0.5rem;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 1em;
    color: var(--vp-c-text-2);
    font-family: var(--vp-font-family-mono);
  }

  .tab-bar {
    display: inline-flex;
    gap: 0.25rem;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 0.25rem;
    margin-bottom: 1rem;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      color: var(--vp-c-text-1);
      background: var(--vp-c-bg-mute);
    }

    &.active {
      background: var(--vp-c-bg);
      color: var(--vp-c-text-1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  .tab-content {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    background: var(--vp-c-bg-soft);
  }

  .format-row {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--vp-c-divider);

    &:last-child {
      border-bottom: none;
    }
  }

  .format-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .format-info {
    flex: 1 1 18rem;
    min-width: 0;
  }

  .format-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .format-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--vp-c-text-1);
  }

  .fmt-badge {
    font-size: 0.72rem;
    font-weight: 500;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-text-3);
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    padding: 0 0.4rem;
  }

  .format-desc {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--vp-c-text-2);

    a {
      color: var(--vp-c-brand-1);
      text-decoration: none;
      white-space: nowrap;

      &:hover {
        text-decoration: underline;
      }
    }

    a + .details-toggle {
      margin-left: 0.35rem;
    }
  }

  .arch-links {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--vp-c-brand-1);
      text-decoration: none;
      padding: 0.22rem 0.6rem;
      border-radius: 5px;
      border: 1px solid var(--vp-c-brand-1);
      transition:
        background 0.15s,
        color 0.15s;

      &:hover {
        background: var(--vp-c-brand-1);
        color: #fff;
      }
    }
  }

  .details-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    font-size: 0.78rem;
    color: var(--vp-c-text-3);
    background: none;
    border: none;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: var(--vp-c-text-1);
    }

    .details-chevron {
      font-size: 0.55rem;
      transition: transform 0.15s;
    }

    &[aria-expanded='true'] .details-chevron {
      transform: rotate(90deg);
    }
  }

  .format-details {
    margin-top: 0.6rem;
  }

  .file-meta {
    display: grid;
    grid-template-columns: 5rem 1fr;
    column-gap: 0.75rem;
    row-gap: 0.15rem;
    margin: 0 0 0.4rem;
    padding: 0.55rem 0.7rem;
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    font-size: 0.75rem;
    line-height: 1.5;

    dt {
      grid-row: span 3;
      font-weight: 600;
      color: var(--vp-c-text-2);
    }

    dd {
      grid-column: 2;
      margin: 0;
      min-width: 0;
    }
  }

  .file-name {
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-text-1);
    word-break: break-all;
  }

  .file-size {
    margin-left: 0.5rem;
    color: var(--vp-c-text-3);
    white-space: nowrap;
  }

  .file-hash {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;

    code {
      font-size: 0.7rem;
      color: var(--vp-c-text-2);
      background: none;
      padding: 0;
      word-break: break-all;
    }
  }

  .copy-btn {
    flex-shrink: 0;
    padding: 0 0.2rem;
    color: var(--vp-c-text-3);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--vp-c-brand-1);
    }
  }

  .file-command {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;

    code {
      font-size: 0.7rem;
      color: var(--vp-c-text-1);
      background: none;
      padding: 0;
      word-break: break-all;

      &::before {
        content: '$ ';
        color: var(--vp-c-text-3);
      }
    }
  }

  .command-hint {
    margin: 0.45rem 0 0.1rem;
    font-size: 0.72rem;
    line-height: 1.5;

    code {
      font-size: 0.7rem;
    }
    color: var(--vp-c-text-3);
  }

  @media (max-width: 640px) {
    .format-row {
      padding: 0.75rem;
    }

    .arch-links {
      flex-wrap: wrap;
    }

    .file-meta {
      grid-template-columns: 1fr;

      dt {
        grid-row: auto;
      }

      dd {
        grid-column: 1;
      }
    }
  }
</style>
