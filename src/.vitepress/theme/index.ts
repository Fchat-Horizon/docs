// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import RisingBanner from './components/RisingBanner.vue';
import HeroStats from './components/HeroStats.vue';
import './style.scss';
import './charts.scss';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-top': () => h(RisingBanner),
      'home-hero-actions-after': () => h(HeroStats),
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
