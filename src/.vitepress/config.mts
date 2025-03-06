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
    logo: '/assets/images/icon.png',
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Home", link: "/" },
          { text: "Docs Home", link: "/docs" },
          { text: "Changelog", link: "/changelog" },
          { text: "Contact", link: "/contact" },

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
  head: [['link', { rel: 'icon', href: '/assets/images/icon.ico' }]]
});
