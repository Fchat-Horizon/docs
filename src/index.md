---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  text: "Look to the <span class=\"pretty-name\">Horizon</span>"
  tagline: "Horizon is the <a href=\"/docs/quality-of-life.html\"><span class=\"love\">best</span></a> F-Chat client. No exceptions."
  image:
    src: /assets/images/icon.ico
    alt: Logo
  actions:
    - theme: brand
      text: Download the app
      link: /download
    - theme: brand
      text: Features
      link: /docs/features-overview
    - theme: alt
      text: Docs and Wiki
      link: /docs
    - theme: alt
      text: Changelog
      link: /changelog

features:
  - icon:
      src: "/assets/images/quick-jump.png"
      alt: "Extra features"
      height: 100%
      width: 100%
    title: Extra features
    details: Enjoy cool new features, like custom character colors, or the conversation quick switcher. Everything from F-Chat Rising is included too (except the one we don't talk about)! And all of it can be tailored to your liking.
    link: /docs/features-overview
    linkText: Read more
  - icon:
      src: "/assets/images/qol.png"
      alt: "Quality of life changes"
      height: 100%
      width: 100%
    title: Quality of life changes
    details: Keeping your message drafts after disconnecting, update checks, extra keyboard shortcuts, and lot and lots of minor little inconsistencies fixed.
    link: /docs/quality-of-life
    linkText: Read more
  - icon:
      src: "/assets/images/memory-usage.png"
      alt: "Memory ussage"
      width: 100%
      height: 100%
    title: Performant and polished
    details: Increased performance, and with many fixed bugs compared to Rising.
  - icon:
      src: "/assets/images/community.png"
      alt: "Community-driven"
      width: 100%
      height: 100%
    title: Community-driven
    details: Horizon is made for and by the F-List community first and foremost. Even if you don't know how to code, you can still be of great help by giving your thoughts or reporting bugs.
    link: /contact
    linkText: Get in touch
  - icon:
      src: "/assets/images/theme.png"
      alt: "A fresh coat of paint"
      width: 100%
      height: 100%
    title: A fresh coat of paint
    details: As of version 1.33.0, we've redone a lot of the visual elements to look nice and consistent with each other. 
  - icon: 
      src: "/assets/images/theming.png"
      alt: "Brand new themes"
      width: 100%
      height: 100%
    title: In the colors you like!
    details: Brand new themes, and constantly adding more. You'll never get bored of how the client looks, guaranteed

  

---

<style lang="scss">
$pretty-gradient: linear-gradient(120deg, #6f4bb0 30%, #faae7b 100%);
$love-gradient: linear-gradient(120deg, #ff8fb3 20%, #ff476f 60%, #c7172f 100%);
$pretty-shadow: rgba(250,174,123,0.35);
$love-shadow-1: rgba(255,79,120,0.28);
$love-shadow-2: rgba(199,23,47,0.12);
$love-shadow-hover-1: rgba(255,79,120,0.45);
$love-shadow-hover-2: rgba(199,23,47,0.18);

@mixin gradient-text($gradient) {
  background: $gradient;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline-block;
}

.pretty-name {
  // simple gradient text and subtle glow
  @include gradient-text($pretty-gradient);
  text-shadow: 0 0 6px $pretty-shadow;
}

.love {
  @include gradient-text($love-gradient);
  background-size: 200% 100%;
  text-shadow: 0 0 6px $love-shadow-1, 0 0 14px $love-shadow-2;

  // Hover/focus color shift and subtle lift
  &, a {
    transition: text-shadow 180ms ease, background-position 360ms ease;
  }

  &:hover,
  &:focus,
  a:hover,
  a:focus {
    text-shadow: 0 0 8px $love-shadow-hover-1, 0 0 18px $love-shadow-hover-2;
    background-position: 100% 0;
  }

  @media (prefers-reduced-motion: reduce) {
    &, a {
      transition: none;
      background-position: 50% 0;
    }
  }
}
</style>