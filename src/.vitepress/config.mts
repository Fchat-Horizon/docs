import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Horizon",
  description: "Horizon Docs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs" },
      { text: "Changelog", link: "/changelog" },
    ],
    logo: "/assets/images/icon.png",
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Home", link: "/" },
          { text: "Installing Horizon", link: "/docs/guides/install" },
          { text: "Docs Home", link: "/docs" },
          { text: "Changelog", link: "/changelog" },
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

    socialLinks: [
      { icon: "github", link: "https://github.com/Fchat-Horizon/Horizon" },
    ],
  },
  head: [["link", { rel: "icon", href: "/assets/images/icon.ico" }]],
});
