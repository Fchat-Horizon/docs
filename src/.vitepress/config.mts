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
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Home", link: "/docs" },
          { text: "Changelog", link: "/changelog"}
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Overview", link: "/docs/features-overview" },
        ],
      }
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  base: "/Website/"
});
