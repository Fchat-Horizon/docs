// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.scss';
import './charts.scss';

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
