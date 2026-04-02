import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';

function getChangelogSidebarItems() {
  const changelogDir = path.resolve(__dirname, '../docs/changelogs');
  if (!fs.existsSync(changelogDir)) return [];

  return fs
    .readdirSync(changelogDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const name = file.replace(/\.md$/, '');
      const text = name
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return {
        text,
        link: `/docs/changelogs/${name}`,
      };
    })
    .reverse();
}

function getNavChangelogItems() {
  const allItems = getChangelogSidebarItems();
  const recentItems = allItems.slice(0, 7);

  return [
    ...recentItems,
    {
      text: 'Older versions',
      link: '/changelog',
    },
  ];
}

const siteUrl = 'https://fchat-horizon.github.io/docs';
const siteTitle = 'Horizon';
const siteDescription =
  'Horizon is a community-driven F-Chat client. Features, guides, changelogs, and more.';
const ogImage = `${siteUrl}/assets/images/icon.png`;
const srcDir = path.resolve(__dirname, '..');

function getReadingTime(filePath: string): number | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const text = raw
      .replace(/^---[\s\S]*?---/, '')
      .replace(/!?\[.*?\]\(.*?\)/g, '')
      .replace(/[#*>`~\-|]/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return null;
  }
}

function getChangelogStats(filePath: string): string | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const items = raw.match(/^- /gm);
    if (!items?.length) return null;
    return `${items.length} change${items.length === 1 ? '' : 's'}`;
  } catch {
    return null;
  }
}

function getSectionLabel(relativePath: string): string | null {
  if (relativePath.startsWith('docs/changelogs/')) return 'Changelog';
  if (relativePath.startsWith('docs/guides/')) return 'Guide';
  if (relativePath === 'docs/faq.md') return 'FAQ';
  if (relativePath === 'docs/contributing.md') return 'Development';
  if (relativePath.startsWith('docs/')) return 'Docs';
  return null;
}

export default defineConfig({
  title: 'Horizon',
  description: 'Horizon Docs',
  lastUpdated: true,

  transformPageData(pageData) {
    const pageTitle = pageData.frontmatter.title
      ? `${pageData.frontmatter.title} | ${siteTitle}`
      : pageData.title
        ? `${pageData.title} | ${siteTitle}`
        : siteTitle;

    const filePath = path.resolve(srcDir, pageData.relativePath);
    const section = getSectionLabel(pageData.relativePath);
    const isChangelog = pageData.relativePath.startsWith('docs/changelogs/');

    let baseDesc =
      pageData.frontmatter.description ||
      pageData.description ||
      siteDescription;
    const extras: string[] = [];

    if (section) extras.push(section);

    const skipReadingTime =
      pageData.relativePath === 'index.md' ||
      pageData.relativePath === 'download.md' ||
      pageData.relativePath === 'contact.md' ||
      pageData.relativePath === 'changelog.md';

    if (isChangelog) {
      const stats = getChangelogStats(filePath);
      if (stats) extras.push(stats);
    } else if (!skipReadingTime) {
      const mins = getReadingTime(filePath);
      if (mins) extras.push(`${mins} min read`);
    }

    const suffix = extras.length ? ` (${extras.join(' · ')})` : '';
    const pageDescription = baseDesc + suffix;
    const pageUrl = `${siteUrl}/${pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '.html')}`;

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteTitle }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: ogImage }],
    );
  },

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/Fchat-Horizon/docs/edit/main/src/:path',
      text: 'Edit on GitHub',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/' },
      { text: 'FAQ', link: '/docs/faq' },
      { text: 'Changelogs', items: getNavChangelogItems() },
    ],
    logo: '/assets/images/icon.png',
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Docs Home', link: '/docs/' },
          { text: 'Frequently Asked Questions', link: '/docs/faq' },
          { text: 'Installing Horizon', link: '/docs/guides/install' },
          {
            text: 'Changelogs',
            link: '/changelog',
            collapsed: true,
            items: getChangelogSidebarItems(),
          },
          { text: 'Contact', link: '/contact' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Overview', link: '/docs/features-overview' },
          {
            text: 'Quality of life changes',
            link: '/docs/quality-of-life',
          },
          {
            text: 'Rising Features',
            link: '/docs/rising',
          },
        ],
      },
      {
        text: 'Wiki',
        items: [
          {
            text: 'Moving logs from Rising',
            link: '/docs/guides/moving-from-rising',
          },
          { text: 'Backing up your data', link: '/docs/guides/backup' },
          {
            text: 'Exporter & Importer',
            link: '/docs/exporter-importer',
          },
          {
            text: 'Custom name colors and avatars',
            link: '/docs/guides/colors-and-avatars',
          },
          { text: 'Creating sound themes', link: '/docs/guides/sound-themes' },
          { text: 'Custom user styles', link: '/docs/guides/custom-css' },
        ],
      },
      {
        text: 'Development',
        items: [{ text: 'Contributing', link: '/docs/contributing' }],
      },
    ],
    lastUpdated: {
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'short',
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Fchat-Horizon/Horizon' },
      { icon: 'discord', link: 'https://discord.gg/JYuxqNVNtP' },
    ],
  },
  head: [
    ['link', { rel: 'icon', href: '/assets/images/icon.ico' }],
    ['meta', { name: 'theme-color', content: '#6f4bb0' }],
  ],
});
