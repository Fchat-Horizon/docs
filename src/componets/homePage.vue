<script setup lang="ts">
  /// <reference types="vite/client" />
  import { computed } from 'vue';
  import { withBase } from 'vitepress';
  import '@fontsource-variable/fredoka/wght.css';
  import appPreview from './appPreview.vue';
  import solsticeBanner from './solsticeBanner.vue';
  import { formatNumber } from './chartUtils';
  import { useLiveStats } from '../composables/useLiveStats';
  import quickJump from '../docs/images/quick-jump.png';
  import channelGroups from '../docs/images/channel_groups/grouped_pins.gif';
  import customColors from '../docs/images/animatedicon-customcolor.gif';
  import backups from '../docs/images/backup.png';
  import chatBox from '../docs/images/chat-box.webp';

  const stats = useLiveStats();

  const version = computed(() =>
    stats.value?.releases
      .filter((release) => !release.prerelease)
      .at(-1)
      ?.tag.replace(/^v/, ''),
  );

  // * Read off the Task Manager capture in /assets/images/memory-usage.png.
  // ! This is against rising! Not stock F-Chat... Sadly.
  const memory = [
    { app: 'F-Chat Rising', megabytes: 1096 },
    { app: 'Horizon', megabytes: 554 },
  ];
  const memoryPeak = Math.max(...memory.map((entry) => entry.megabytes));

  const features = [
    {
      title: 'A better chat box',
      text: 'The box you type in does more of the work.',
      points: [
        'Eicon picker: search for an eicon and keep your favourites close.',
        'Color picker: press Ctrl + D and pick a color without typing the tag.',
        'Preview: press Ctrl + Shift + P to see your BBCode before you send.',
      ],
      image: chatBox,
      alt: 'The chat box with its color picker open, and below it a post shown in preview',
      width: 544,
      height: 320,
      backdrop: '#181830',
    },
    {
      title: 'Group your pinned channels',
      text: 'Sort your pinned channels into groups and categorize them however you see fit.',
      link: { text: 'How channel groups work', href: '/docs/channel-groups' },
      image: channelGroups,
      alt: 'Pinned channels being sorted into named groups in the sidebar',
      width: 473,
      height: 425,
      backdrop: '#26253a',
    },
    {
      title: 'Your own name color and portrait',
      text: "Add a line to your character's bio to set a custom name color and a high quality or animated portrait.",
      link: {
        text: 'Set up your color and portrait',
        href: '/docs/guides/colors-and-avatars',
      },
      image: customColors,
      alt: 'Chat messages with names in custom colors, next to a character with a custom portrait',
      width: 550,
      height: 175,
      backdrop: '#181830',
    },
    {
      title: 'Backups that run themselves',
      text: 'Back up your logs when the app opens or closes, every few hours, or at set times of day. You choose which characters and what gets saved.',
      link: { text: 'Back up your data', href: '/docs/guides/backup' },
      image: backups,
      alt: 'The Auto Backup settings, with triggers for launch, close, interval and schedule',
      width: 645,
      height: 520,
      backdrop: '#181830',
    },
    {
      title: 'Jump anywhere with Ctrl + T',
      text: 'Quick Jump takes you to a channel, a conversation, a new PM, or one of your friends, all from the keyboard.',
      image: quickJump,
      alt: 'The Quick Jump search, listing channels, the console, a private conversation and a friend',
      width: 492,
      height: 377,
      backdrop: '#181830',
    },
  ];

  const smallStuff = [
    {
      title: 'Message drafts.',
      text: 'A connection hitch or a crash no longer eats the post you were writing.',
    },
    {
      title: 'Automatic sign-in.',
      text: 'One checkbox, plus a character select that copes with a big list.',
    },
    {
      title: 'Synced eicon collages.',
      text: 'Eicons in the same message load together, so they never misalign.',
    },
    {
      title: 'A built-in updater.',
      text: 'New versions arrive inside the app, automatically if you like.',
    },
    {
      title: 'At home on Linux and Mac.',
      text: 'Distro packages beyond the AppImage, and native on M-series Macs.',
    },
    {
      title: 'Friend notifications.',
      text: 'Hear when friends sign in, or when someone speaks in a favourite room.',
    },
    {
      title: 'System theme sync.',
      text: "Follow your computer's light and dark mode.",
    },
    {
      title: 'Everything from Rising.',
      text: "All of it is included too (except the one we don't talk about).",
    },
  ];

  const footerLinks = [
    { text: 'Download', href: '/download' },
    { text: 'Docs', href: '/docs/' },
    { text: 'FAQ', href: '/docs/faq' },
    { text: 'Changelog', href: '/changelog' },
    { text: 'Stats', href: '/stats' },
    { text: 'Contact', href: '/contact' },
  ];
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="sky">
        <div class="container sky-inner">
          <div class="hero-copy">
            <h1>Look to the Horizon</h1>
            <p class="lede">
              Horizon is the best F-Chat client. No exceptions.
            </p>
            <div class="actions">
              <a
                class="button"
                :href="withBase('/download')"
                >Download Horizon</a
              >
              <a
                class="text-link"
                :href="withBase('/docs/features-overview')"
                >See the features</a
              >
            </div>
            <p class="release">
              <template v-if="version">Version {{ version }} for</template>
              <template v-else>For</template>
              Windows, macOS and Linux. Free and open source.
            </p>
          </div>
          <div class="hero-glow"></div>
          <img
            class="hero-sun"
            :src="withBase('/assets/images/icon-square.webp')"
            alt=""
            width="640"
            height="640"
          />
        </div>
      </div>
      <div class="container stage">
        <appPreview />
      </div>
    </section>

    <section class="container section">
      <h2>More than bugfixes</h2>
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature"
      >
        <div class="copy">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
          <ul
            v-if="feature.points"
            class="points"
          >
            <li
              v-for="point in feature.points"
              :key="point"
            >
              {{ point }}
            </li>
          </ul>
          <a
            v-if="feature.link"
            class="text-link"
            :href="withBase(feature.link.href)"
            >{{ feature.link.text }}</a
          >
        </div>
        <div
          class="shot"
          :style="{ background: feature.backdrop }"
        >
          <img
            :src="feature.image"
            :alt="feature.alt"
            :width="feature.width"
            :height="feature.height"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="container section split">
      <div class="copy">
        <h2>About half the memory of Rising</h2>
        <p>
          Horizon continues F-Chat Rising, with better performance and many of
          its bugs fixed. Here are the two in Task Manager, both running at
          once.
        </p>
      </div>
      <dl class="bars">
        <div
          v-for="entry in memory"
          :key="entry.app"
          :class="['bar-row', { ours: entry.app === 'Horizon' }]"
        >
          <dt>{{ entry.app }}</dt>
          <dd>
            <span
              class="bar"
              :style="{ width: `${(entry.megabytes / memoryPeak) * 100}%` }"
            ></span>
            <span class="bar-value"
              >{{ formatNumber(entry.megabytes) }} MB</span
            >
          </dd>
        </div>
      </dl>
    </section>

    <section class="container section">
      <h2>And the small stuff</h2>
      <ul class="small-stuff">
        <li
          v-for="item in smallStuff"
          :key="item.title"
        >
          <strong>{{ item.title }}</strong>
          {{ item.text }}
        </li>
      </ul>
      <a
        class="text-link"
        :href="withBase('/docs/quality-of-life')"
        >All the quality of life changes</a
      >
    </section>

    <section class="container section split">
      <div class="copy">
        <h2>
          Made for and by the <span class="nowrap">F-List</span> community
        </h2>
        <p>
          Even if you don't know how to code, you can still be of great help by
          giving your thoughts or reporting bugs.
        </p>
      </div>
      <div class="copy">
        <p v-if="stats">
          {{ formatNumber(stats.downloads) }} downloads,
          {{ formatNumber(stats.stars) }} GitHub stars and
          {{ formatNumber(stats.contributors) }} contributors so far.
        </p>
        <ul class="community-links">
          <li v-if="stats">
            <a
              class="text-link"
              :href="withBase('/stats')"
              >See the stats</a
            >
          </li>
          <li>
            <a
              class="text-link"
              href="https://discord.gg/JYuxqNVNtP"
              target="_blank"
              rel="noopener"
              >Join the Discord</a
            >
          </li>
          <li>
            <a
              class="text-link"
              href="https://github.com/Fchat-Horizon/Horizon"
              target="_blank"
              rel="noopener"
              >Browse the code on GitHub</a
            >
          </li>
          <li>
            <a
              class="text-link"
              :href="withBase('/contact')"
              >Get in touch</a
            >
          </li>
        </ul>
      </div>
    </section>

    <section class="container section">
      <solsticeBanner />
    </section>

    <footer class="footer">
      <div class="container footer-inner">
        <p class="footer-brand">
          <img
            :src="withBase('/assets/images/icon.png')"
            alt=""
            width="28"
            height="28"
          />
          <span>
            <strong>Horizon</strong>
            Free &amp; open source, always and forever!
          </span>
        </p>
        <ul class="footer-links">
          <li
            v-for="link in footerLinks"
            :key="link.href"
          >
            <a :href="withBase(link.href)">{{ link.text }}</a>
          </li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
  .horizon-home .VPHome {
    margin-bottom: 0;
  }
</style>

<style lang="scss" scoped>
  .home {
    --home-font-display: 'Fredoka Variable', var(--vp-font-family-base);
    --gutter: 24px;
    --sun-size: 132px;
    --sun-right: 24px;
    --stage-overlap: 40px;
    --sky-glow-near: rgba(238, 190, 110, 0.45);
    --sky-glow-far: rgba(212, 92, 83, 0.16);

    color: var(--vp-c-text-1);
  }

  .dark .home {
    --sky-glow-near: rgba(238, 190, 110, 0.2);
    --sky-glow-far: rgba(182, 63, 83, 0.14);
  }

  .container {
    max-width: calc(1152px + 2 * var(--gutter));
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  h1,
  h2,
  h3 {
    font-family: var(--home-font-display);
    font-weight: 600;
  }

  h1 {
    font-size: clamp(44px, 7.4vw, 76px);
    line-height: 1;
    letter-spacing: -0.015em;
  }

  h2 {
    font-size: clamp(30px, 4vw, 40px);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  h3 {
    font-size: 24px;
    line-height: 1.2;
  }

  .copy {
    max-width: 34em;
    font-size: 17px;
    line-height: 1.6;
    color: var(--vp-c-text-2);

    h2,
    h3 {
      color: var(--vp-c-text-1);
    }

    p {
      margin-top: 14px;
    }

    > .text-link {
      display: inline-block;
      margin-top: 14px;
    }
  }

  .text-link {
    font-weight: 600;
    color: var(--vp-c-brand-1);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 4px;

    &:hover {
      color: var(--vp-c-brand-2);
    }
  }

  a:focus-visible {
    border-radius: 4px;
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 3px;
  }

  // ! Sideways only: the glow must fade out vertically, never hit an edge.
  .hero {
    overflow-x: clip;
  }

  .hero-glow {
    position: absolute;
    right: calc(var(--sun-right) - var(--sun-size));
    bottom: calc(var(--stage-overlap) + 20px - var(--sun-size));
    width: calc(var(--sun-size) * 3);
    height: calc(var(--sun-size) * 3);
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      var(--sky-glow-near),
      var(--sky-glow-far) 45%,
      transparent
    );
    pointer-events: none;
  }

  .sky-inner {
    position: relative;
    // * Room for the logo under the copy on narrow screens.
    padding-top: 40px;
    padding-bottom: calc(var(--stage-overlap) + var(--sun-size) + 36px);
  }

  .lede {
    margin-top: 16px;
    font-size: clamp(18px, 2.2vw, 22px);
    line-height: 1.4;
    color: var(--vp-c-text-2);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 24px;
    margin-top: 28px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 26px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    color: var(--vp-button-brand-text);
    background: var(--vp-button-brand-bg);
    transition: background-color 0.2s;

    &:hover {
      background: var(--vp-button-brand-hover-bg);
    }
  }

  .release {
    margin-top: 16px;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }

  .hero-sun {
    position: absolute;
    border-radius: 50%;
    right: var(--sun-right);
    bottom: calc(var(--stage-overlap) + 20px);
    width: var(--sun-size);
    height: var(--sun-size);
    animation: sunrise 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  @keyframes sunrise {
    from {
      transform: translateY(45%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-sun {
      animation: none;
    }
  }

  .stage {
    position: relative;
    margin-top: calc(var(--stage-overlap) * -1);
  }

  .section {
    padding-top: 80px;
  }

  .split {
    display: grid;
    gap: 32px;
  }

  .bars {
    display: grid;
    gap: 20px;
    align-content: center;
  }

  .bar-row {
    dt {
      font-weight: 600;
    }

    dd {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0 0;
    }
  }

  .bar {
    height: 28px;
    border-radius: 14px;
    background: var(--vp-c-default-3);
  }

  .bar-row.ours .bar {
    background: linear-gradient(
      90deg,
      #eebe6e,
      #ed9660 35%,
      #d45c53 70%,
      #b63f53
    );
  }

  .bar-value {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    color: var(--vp-c-text-2);
  }

  .bar-row.ours .bar-value {
    font-weight: 600;
    color: var(--vp-c-text-1);
  }

  .points {
    margin-top: 12px;
    padding-left: 1.2em;
    list-style: disc;

    li + li {
      margin-top: 6px;
    }
  }

  .feature {
    display: grid;
    gap: 24px;
    margin-top: 48px;
  }

  .shot {
    display: grid;
    place-items: center;
    padding: 24px;
    border-radius: 12px;

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
  }

  .small-stuff {
    display: grid;
    gap: 20px 48px;
    margin: 32px 0 28px;
    font-size: 16px;
    line-height: 1.55;
    color: var(--vp-c-text-2);

    strong {
      font-weight: 600;
      color: var(--vp-c-text-1);
    }
  }

  .nowrap {
    white-space: nowrap;
  }

  .community-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 28px;
    margin-top: 20px;
  }

  // * The banner brings its own page gutters; here the container supplies them.
  :deep(.solstice-banner) {
    max-width: none;
    margin: 0;
    padding: 0;
  }

  .footer {
    margin-top: 96px;
    padding: 28px 0 36px;
    border-top: 1px solid var(--vp-c-divider);
    font-size: 14px;
    color: var(--vp-c-text-2);
  }

  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px 32px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;

    strong {
      margin-right: 6px;
      font-family: var(--home-font-display);
      font-size: 17px;
      font-weight: 600;
      color: var(--vp-c-text-1);
    }
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;

    a:hover {
      color: var(--vp-c-brand-1);
    }
  }

  @media (min-width: 640px) {
    .home {
      --gutter: 48px;
      --sun-size: 180px;
      --sun-right: 72px;
    }

    .small-stuff {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 960px) {
    .home {
      --gutter: 64px;
      --sun-size: clamp(200px, 21vw, 260px);
      --sun-right: 9%;
      --stage-overlap: 48px;
    }

    .sky-inner {
      padding-top: 56px;
      padding-bottom: calc(var(--stage-overlap) + 48px);
    }

    .section {
      padding-top: 120px;
    }

    .split {
      grid-template-columns: 5fr 7fr;
      gap: 64px;
      align-items: center;
    }

    .feature {
      grid-template-columns: 5fr 7fr;
      gap: 64px;
      align-items: center;
      margin-top: 72px;

      &:nth-of-type(even) .copy {
        order: 1;
      }

      &:nth-of-type(even) {
        grid-template-columns: 7fr 5fr;
      }
    }

    .shot {
      padding: 40px;
    }
  }
</style>
