import { defineConfig } from "vitepress";
import fs from "fs";
import path from "path";

function getChangelogSidebarItems() {
  const changelogDir = path.resolve(__dirname, "../docs/changelogs");
  if (!fs.existsSync(changelogDir)) return [];

  return fs
    .readdirSync(changelogDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const name = file.replace(/\.md$/, "");
      // Optionally, make the text more readable:
      const text = name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return {
        text,
        link: `/docs/changelogs/${name}`,
      };
    }).reverse();
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Horizon",
  description: "Horizon Docs",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    editLink: {
      pattern: 'https://github.com/Fchat-Horizon/docs/edit/main/src/:path',
      text: 'Edit on GitHub'
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs/" },
      { text: "Changelogs",items: getChangelogSidebarItems()},
    ],
    logo: "/assets/images/icon.png",
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Docs Home", link: "/docs/" },
          { text: "Installing Horizon", link: "/docs/guides/install" },
          {
            text: "Changelogs",
            link: "/changelog",
            collapsed: true,
            items: getChangelogSidebarItems(),
          },
          { text: "Contact", link: "/contact" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Overview", link: "/docs/features-overview" },
          {
            text: "Custom name colors and avatars",
            link: "/docs/guides/colors-and-avatars",
          },
          {
            text: "Quality of life changes",
            link: "/docs/quality-of-life",
          },
          {
            text: "Rising Features",
            link: "/docs/rising",
          },
        ],
      },
      {
        text: "Wiki",
        items: [
          {
            text: "Moving logs from Rising",
            link: "/docs/guides/moving-from-rising",
          },
          { text: "Backing up your data", link: "/docs/guides/backup" },
        ],
      },
      {
        text: "Development",
        items: [{ text: "Contributing", link: "/docs/contributing" }],
      },
    ],
    lastUpdated: {
      formatOptions: {
        dateStyle: "long",
        timeStyle: "short",
      },
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Fchat-Horizon/Horizon" },
      { icon: "discord", link: "https://discord.gg/JYuxqNVNtP" },
    ],
  },
  head: [["link", { rel: "icon", href: "/assets/images/icon.ico" }]],
});
