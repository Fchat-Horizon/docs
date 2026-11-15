<script setup lang="ts">
  import { h, useId } from 'vue';
  import { withBase } from 'vitepress';
  import {
    faAsterisk,
    faBan,
    faBars,
    faBell,
    faBold,
    faChevronDown,
    faChevronUp,
    faCircle,
    faCircleUser,
    faClockRotateLeft,
    faEnvelope,
    faEye,
    faEyeDropper,
    faEyeSlash,
    faFileLines,
    faFilter,
    faGear,
    faItalic,
    faLink,
    faListCheck,
    faMagnifyingGlass,
    faPlay,
    faPlus,
    faQuestion,
    faRectangleAd,
    faRightFromBracket,
    faStar,
    faStrikethrough,
    faSubscript,
    faSuperscript,
    faThumbtack,
    faTriangleExclamation,
    faUnderline,
    faUpDown,
    faUser,
    faUserGear,
    faUsers,
    faXmark,
  } from 'fa7-free-solid';
  import {
    faCircle as faCircleRegular,
    faEye as faEyeRegular,
    faFaceSmile as faFaceSmileRegular,
    faUser as faUserRegular,
  } from 'fa7-free-regular';
  import './clientThemes.css';

  defineProps<{ theme: string }>();

  // ! Positions are measured from the real client at 1152x720. SVG text
  // doesn't wrap, so keep edited lines short.

  const uid = useId();

  type NameColor = 'none' | 'female' | 'green' | 'pink' | 'red' | 'yellow';
  type Status = 'online' | 'looking' | 'away' | 'busy';

  interface Character {
    color: NameColor;
    status: Status;
    // * Tile colour, then letter colour.
    tile?: [string, string];
  }

  const me = 'The Horizon Dev';
  const meLines = ['The Horizon', 'Dev'];

  const characters: Record<string, Character> = {
    'Larry The Rock': {
      color: 'none',
      status: 'online',
      tile: ['#6f7480', '#e9ebef'],
    },
    'Coolest Girl Ever': {
      color: 'green',
      status: 'looking',
      tile: ['#2f6b4a', '#d9f5e3'],
    },
    Sponge: { color: 'yellow', status: 'away', tile: ['#b59a1c', '#fff6c9'] },
    'Still a Guy': {
      color: 'pink',
      status: 'online',
      tile: ['#7a3b63', '#fbdcec'],
    },
    [me]: { color: 'female', status: 'online' },
    'Ultra Wolf Lord': {
      color: 'red',
      status: 'busy',
      tile: ['#7a2a2a', '#ffd9d9'],
    },
  };
  const members = Object.keys(characters);

  const privateMessages = ['Larry The Rock'];
  const channels = ['Horizon', 'Helpdesk', 'Fantasy', 'Sci-fi'];
  const activeChannel = 'Horizon';
  // ! Measured width of the channel title; update it if the channel is renamed.
  const titleWidth = 75.35;

  interface Part {
    text: string;
    strong?: boolean;
  }
  const messages: { from: string; time: string; parts: Part[] }[] = [
    { from: 'Larry The Rock', time: '15:18', parts: [{ text: 'Hey friend!' }] },
    {
      from: me,
      time: '15:18',
      parts: [{ text: "What's up? How've you been?" }],
    },
    {
      from: 'Larry The Rock',
      time: '15:19',
      parts: [{ text: "Look at us! We're so colorful!" }],
    },
    {
      from: 'Coolest Girl Ever',
      time: '15:19',
      parts: [
        {
          text: "Now I don't have to set my gender just to be a certain color! ",
        },
        { text: 'Wow!', strong: true },
      ],
    },
    {
      from: 'Still a Guy',
      time: '15:20',
      parts: [{ text: "That's pretty cool." }],
    },
    { from: 'Ultra Wolf Lord', time: '15:20', parts: [{ text: 'w-what?' }] },
  ];

  let nextRow = 96;
  const rows = messages.map((message) => {
    const own = message.from === me;
    const row = { ...message, own, y: nextRow };
    nextRow += own ? 47 : 46;
    return row;
  });

  // * Font Awesome 7, as the client ships; the rest of this site uses 6.
  const clientIcons = {
    asterisk: faAsterisk,
    ban: faBan,
    bars: faBars,
    bell: faBell,
    bold: faBold,
    chevronDown: faChevronDown,
    chevronUp: faChevronUp,
    circle: faCircle,
    circleUser: faCircleUser,
    clockRotateLeft: faClockRotateLeft,
    envelope: faEnvelope,
    eye: faEye,
    eyeDropper: faEyeDropper,
    eyeSlash: faEyeSlash,
    fileLines: faFileLines,
    filter: faFilter,
    gear: faGear,
    italic: faItalic,
    link: faLink,
    listCheck: faListCheck,
    magnifyingGlass: faMagnifyingGlass,
    play: faPlay,
    plus: faPlus,
    question: faQuestion,
    rectangleAd: faRectangleAd,
    rightFromBracket: faRightFromBracket,
    star: faStar,
    strikethrough: faStrikethrough,
    subscript: faSubscript,
    superscript: faSuperscript,
    thumbtack: faThumbtack,
    triangleExclamation: faTriangleExclamation,
    underline: faUnderline,
    upDown: faUpDown,
    user: faUser,
    userGear: faUserGear,
    users: faUsers,
    xmark: faXmark,
    circleRegular: faCircleRegular,
    eyeRegular: faEyeRegular,
    faceSmileRegular: faFaceSmileRegular,
    userRegular: faUserRegular,
  };
  type ClientIcon = keyof typeof clientIcons;

  const statusIcons: Record<Status, ClientIcon> = {
    online: 'userRegular',
    looking: 'eye',
    away: 'circleRegular',
    busy: 'gear',
  };

  const sidebarActions: ClientIcon[] = [
    'magnifyingGlass',
    'rectangleAd',
    'userGear',
    'rightFromBracket',
  ];

  const toolbar: ClientIcon[] = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'eyeDropper',
    'superscript',
    'subscript',
    'link',
    'user',
    'circleUser',
    'faceSmileRegular',
    'eyeSlash',
    'ban',
    'question',
    'eyeRegular',
  ];

  const token = (name: string) => `var(--hc-${name})`;
  const nameFill = (who: string) => token(`name-${characters[who].color}`);
  const logo = withBase('/assets/images/icon.png');

  function box(
    x: number,
    y: number,
    w: number,
    h: number,
    tl = 0,
    tr = tl,
    br = tl,
    bl = tr,
  ): string {
    return (
      `M${x + tl},${y}H${x + w - tr}a${tr},${tr} 0 0 1 ${tr},${tr}` +
      `V${y + h - br}a${br},${br} 0 0 1 ${-br},${br}` +
      `H${x + bl}a${bl},${bl} 0 0 1 ${-bl},${-bl}` +
      `V${y + tl}a${tl},${tl} 0 0 1 ${tl},${-tl}z`
    );
  }

  // ^ A ring, not a filled box, so a translucent fill underneath stays visible.
  function ring(
    x: number,
    y: number,
    w: number,
    h: number,
    tl = 0,
    tr = tl,
    br = tl,
    bl = tr,
  ): string {
    const inner = (r: number) => Math.max(r - 1, 0);
    return (
      box(x, y, w, h, tl, tr, br, bl) +
      box(
        x + 1,
        y + 1,
        w - 2,
        h - 2,
        inner(tl),
        inner(tr),
        inner(br),
        inner(bl),
      )
    );
  }

  // ^ Icon-font metrics: glyph as tall as the font size, centred in a 1.25em box.
  const Icon = (props: {
    name: ClientIcon;
    x: number;
    y: number;
    size: number;
    tone: string;
    fill?: string;
    turn?: number;
  }) => {
    const [iconWidth, , , , d] = clientIcons[props.name].icon;
    const width = (iconWidth / 512) * props.size;
    const boxWidth = props.size * 1.25;
    const glyph = h(
      'svg',
      {
        x: props.x + (boxWidth - width) / 2,
        y: props.y,
        width,
        height: props.size,
        viewBox: `0 0 ${iconWidth} 512`,
      },
      [h('path', { d, fill: props.fill ?? token(props.tone) })],
    );
    if (!props.turn) return glyph;
    const cx = props.x + boxWidth / 2;
    const cy = props.y + props.size / 2;
    return h('g', { transform: `rotate(${props.turn} ${cx} ${cy})` }, [glyph]);
  };
  Icon.props = ['name', 'x', 'y', 'size', 'tone', 'fill', 'turn'];

  const Avatar = (props: {
    who: string;
    x: number;
    y: number;
    size: number;
    round?: number;
  }) => {
    const { tile } = characters[props.who];
    const { x, y, size } = props;
    if (!tile)
      return h('image', { href: logo, x, y, width: size, height: size });
    const r = props.round ?? 0;
    return h('g', [
      h('path', { d: box(x, y, size, size, r, 0, 0, r), fill: tile[0] }),
      h(
        'text',
        {
          x: x + size / 2,
          y: y + size * 0.665,
          'text-anchor': 'middle',
          'font-size': size * 0.46,
          'font-weight': 700,
          fill: tile[1],
        },
        props.who[0],
      ),
    ]);
  };
  Avatar.props = ['who', 'x', 'y', 'size', 'round'];

  // ^ A render function: template whitespace would leak into the text run.
  const MessageText = (props: { row: (typeof rows)[number] }) => {
    const { row } = props;
    return h('g', { style: 'white-space: pre' }, [
      h('text', { x: 270.5, y: row.y + 17.97 }, [
        h('tspan', { 'font-weight': 600, fill: nameFill(row.from) }, row.from),
        h(
          'tspan',
          {
            dx: 6,
            dy: -0.49,
            'font-size': 9.8,
            'font-weight': 600,
            fill: token('time-text'),
            'fill-opacity': 0.8,
          },
          row.time,
        ),
      ]),
      h(
        'text',
        { x: 270, y: row.y + 38.97, fill: token('text') },
        row.parts.map((part) =>
          h(
            'tspan',
            part.strong ? { 'font-weight': 700, 'font-style': 'italic' } : {},
            part.text,
          ),
        ),
      ),
    ]);
  };
  MessageText.props = ['row'];
</script>

<template>
  <div
    class="client-window"
    :data-client-theme="theme"
  >
    <svg
      class="client"
      viewBox="0 0 1152 720"
      role="img"
      :aria-label="`The Horizon client, showing a conversation in the ${activeChannel} channel`"
    >
      <defs>
        <clipPath :id="`${uid}-sidebar`">
          <rect
            x="0"
            y="39"
            width="153"
            height="681"
          />
        </clipPath>
        <clipPath :id="`${uid}-name`">
          <rect
            x="80"
            y="39"
            width="126"
            height="60"
          />
        </clipPath>
        <clipPath :id="`${uid}-tab`">
          <rect
            x="200"
            y="2"
            width="137"
            height="31"
          />
        </clipPath>
        <clipPath :id="`${uid}-messages`">
          <rect
            x="216"
            y="96"
            width="720"
            height="519"
          />
        </clipPath>
        <clipPath :id="`${uid}-members`">
          <rect
            x="942"
            y="78"
            width="204"
            height="592"
          />
        </clipPath>
      </defs>
      <g class="strip">
        <rect
          width="1152"
          height="34"
          :fill="token('strip-fill')"
        />
        <rect
          y="33"
          width="1152"
          height="1"
          :fill="token('strip-border')"
        />
        <text
          x="10"
          y="25.66"
          class="s24 w5"
          :fill="token('title')"
        >
          Horizon
        </text>
        <Icon
          name="bars"
          :x="128.41"
          :y="8.4"
          :size="16"
          tone="hamburger"
        />
        <rect
          x="166.41"
          y="1"
          width="203.8"
          height="33"
          :fill="token('tab-bg')"
        />
        <path
          d="M166.41,34V1H370.21V34H369.21V2H167.41V34z"
          :fill="token('tab-border')"
        />
        <rect
          x="167.41"
          y="33"
          width="201.8"
          height="1"
          :fill="token('tab-border-bottom')"
        />
        <Avatar
          :who="me"
          :x="172.41"
          :y="3.4"
          :size="28"
        />
        <text
          x="203.41"
          y="23.5"
          class="s16 w5"
          :clip-path="`url(#${uid}-tab)`"
          :fill="token('tab-text')"
        >
          {{ me }}
        </text>
        <Icon
          name="xmark"
          :x="339.21"
          :y="9.4"
          :size="16"
          tone="tab-close"
        />
        <Icon
          name="plus"
          :x="381.21"
          :y="9.4"
          :size="16"
          tone="tab-add"
        />
        <Icon
          name="gear"
          :x="1020.5"
          :y="9.4"
          :size="14"
          tone="gear"
        />
        <g
          fill="none"
          stroke-width="1"
          :stroke="token('controls')"
        >
          <path d="M1067,16.5h10" />
          <rect
            x="1099.5"
            y="11.5"
            width="9"
            height="9"
          />
          <path d="M1131.5,11.5l9,9M1140.5,11.5l-9,9" />
        </g>
      </g>
      <g class="sidebar">
        <rect
          x="0"
          y="39"
          width="211"
          height="681"
          :fill="token('sidebar')"
        />
        <rect
          x="210"
          y="39"
          width="1"
          height="681"
          :fill="token('sidebar-border')"
        />
        <rect
          x="10"
          y="196"
          width="200"
          height="1"
          :fill="token('divider')"
        />
        <Avatar
          :who="me"
          :x="10"
          :y="39"
          :size="60"
        />
        <text
          class="s20 w6"
          :clip-path="`url(#${uid}-name)`"
          :fill="token('me-name')"
        >
          <tspan
            v-for="(line, i) in meLines"
            :key="line"
            x="80"
            :y="59.38 + i * 26.4"
          >
            {{ line }}
          </tspan>
        </text>
        <Icon
          name="userRegular"
          :x="80"
          :y="95.3"
          :size="14"
          tone="me-status"
        />
        <text
          x="101.13"
          y="107.77"
          :fill="token('me-status')"
        >
          Online
        </text>
        <Icon
          v-for="(name, i) in sidebarActions"
          :key="name"
          :name="name"
          :x="22.5 + i * 50"
          :y="128.8"
          :size="20"
          tone="side-icon"
        />
        <Icon
          name="bell"
          :x="47.5"
          :y="163.8"
          :size="20"
          tone="side-icon"
        />
        <Icon
          name="envelope"
          :x="147.5"
          :y="163.8"
          :size="20"
          tone="side-icon"
        />

        <path
          :d="box(10, 205.8, 192, 31, 4)"
          :fill="token('item')"
        />
        <text
          x="15"
          y="226.77"
          :fill="token('item-text')"
        >
          Console
        </text>

        <text
          x="15"
          y="265.02"
          class="w6"
          :fill="token('head')"
        >
          PMs
        </text>
        <Icon
          name="clockRotateLeft"
          :x="152"
          :y="252.3"
          :size="14"
          tone="head"
        />
        <Icon
          name="upDown"
          :x="179.5"
          :y="252.3"
          :size="14"
          tone="head"
        />
        <g
          v-for="(who, i) in privateMessages"
          :key="who"
          :transform="`translate(0 ${i * 44})`"
        >
          <path
            :d="box(10, 272.05, 192, 42, 4)"
            :fill="token('item')"
          />
          <Avatar
            :who="who"
            :x="11"
            :y="273.05"
            :size="40"
            :round="4"
          />
          <text
            x="56"
            y="289.31"
            :clip-path="`url(#${uid}-sidebar)`"
            :fill="token('item-text')"
          >
            {{ who }}
          </text>
          <Icon
            name="circle"
            :x="56"
            :y="298.78"
            :size="11.9"
            tone="online"
          />
          <Icon
            name="thumbtack"
            :x="153.8"
            :y="296.7"
            :size="16"
            tone="item-icon"
          />
          <Icon
            name="xmark"
            :x="178.5"
            :y="296.7"
            :size="16"
            tone="item-icon"
          />
        </g>

        <g :transform="`translate(0 ${(privateMessages.length - 1) * 44})`">
          <text
            x="15"
            y="342.27"
            class="w6"
            :fill="token('head')"
          >
            Channels
          </text>
          <Icon
            name="listCheck"
            :x="124.5"
            :y="329.55"
            :size="14"
            tone="head"
          />
          <Icon
            name="clockRotateLeft"
            :x="152"
            :y="329.55"
            :size="14"
            tone="head"
          />
          <Icon
            name="plus"
            :x="179.5"
            :y="329.8"
            :size="14"
            tone="head"
          />
          <g
            v-for="(channel, i) in channels"
            :key="channel"
            :transform="`translate(0 ${i * 33})`"
          >
            <path
              :d="box(12, 351.3, 188, 31, 4)"
              :fill="token(channel === activeChannel ? 'active' : 'item')"
            />
            <text
              x="17"
              y="372.27"
              :clip-path="`url(#${uid}-sidebar)`"
              :fill="
                token(channel === activeChannel ? 'active-text' : 'item-text')
              "
            >
              {{ channel }}
            </text>
            <Icon
              name="thumbtack"
              :x="151.8"
              :y="358.8"
              :size="16"
              :tone="channel === activeChannel ? 'active-icon' : 'item-icon'"
            />
            <Icon
              name="xmark"
              :x="176.5"
              :y="358.8"
              :size="16"
              :tone="channel === activeChannel ? 'active-icon' : 'item-icon'"
            />
          </g>
        </g>
      </g>
      <g class="header">
        <Icon
          name="star"
          :x="216"
          :y="47.5"
          :size="14"
          tone="star"
        />
        <text
          x="238.7"
          y="59.88"
          class="s20 w5"
          :fill="token('chan-title')"
        >
          {{ activeChannel }}
        </text>
        <g
          :fill="token('link')"
          :transform="`translate(${titleWidth - 75.35} 0)`"
        >
          <Icon
            name="chevronDown"
            :x="325.24"
            :y="45.5"
            :size="14"
            tone="link"
          />
          <text
            x="345.74"
            y="57.97"
          >
            Description
          </text>
          <Icon
            name="fileLines"
            :x="433.08"
            :y="45.5"
            :size="14"
            tone="link"
          />
          <text
            x="453.58"
            y="57.97"
          >
            Logs
          </text>
          <Icon
            name="gear"
            :x="496.7"
            :y="45.5"
            :size="14"
            tone="link"
          />
          <text
            x="517.2"
            y="57.97"
          >
            Tab Settings
          </text>
        </g>
        <Icon
          name="triangleExclamation"
          :x="222"
          :y="72.5"
          :size="14"
          tone="link"
        />
        <text
          x="242.5"
          y="84.97"
          :fill="token('link')"
        >
          Alert Staff
        </text>

        <path
          :d="box(688.67, 52.5, 82.33, 27, 6)"
          :fill="token('btn')"
        />
        <path
          :d="ring(688.67, 52.5, 82.33, 27, 6)"
          fill-rule="evenodd"
          :fill="token('btn-border')"
        />
        <Icon
          name="asterisk"
          :x="697.67"
          :y="60"
          :size="12.6"
          tone="btn-text"
        />
        <text
          x="719.88"
          y="71.47"
          :fill="token('btn-text')"
        >
          View
        </text>
        <path
          d="M753.8,63.1h8.4l-4.2,4.2z"
          :fill="token('btn-text')"
        />

        <path
          :d="box(775.92, 52.5, 103.1, 27, 6, 0, 0, 6)"
          :fill="token('btn')"
        />
        <path
          :d="ring(775.92, 52.5, 103.1, 27, 6, 0, 0, 6)"
          fill-rule="evenodd"
          :fill="token('btn-border')"
        />
        <path
          :d="box(878.02, 52.5, 26, 27, 0, 6, 6, 0)"
          :fill="token('btn')"
        />
        <path
          :d="ring(878.02, 52.5, 26, 27, 0, 6, 6, 0)"
          fill-rule="evenodd"
          :fill="token('btn-border')"
        />
        <Icon
          name="play"
          :x="784.92"
          :y="60"
          :size="12.6"
          tone="btn-text"
        />
        <text
          x="810.66"
          y="71.47"
          :fill="token('btn-text')"
        >
          Start Ads
        </text>
        <path
          d="M886.8,63.1h8.4l-4.2,4.2z"
          :fill="token('btn-text')"
        />
      </g>
      <g class="messages">
        <rect
          x="216"
          y="95"
          width="720"
          height="1"
          :fill="token('msgs-border')"
        />
        <g :clip-path="`url(#${uid}-messages)`">
          <g
            v-for="(row, i) in rows"
            :key="i"
          >
            <template v-if="row.own">
              <rect
                x="216"
                :y="row.y"
                width="720"
                height="47"
                :fill="token('own')"
              />
              <rect
                x="216"
                :y="row.y"
                width="2"
                height="47"
                :fill="token('own-left')"
              />
              <rect
                x="216"
                :y="row.y + 45"
                width="720"
                height="2"
                :fill="token('own-border')"
              />
            </template>
            <Avatar
              :who="row.from"
              :x="222"
              :y="row.y + 3"
              :size="40"
            />
            <MessageText :row="row" />
          </g>
        </g>
      </g>
      <g class="editor">
        <Avatar
          :who="me"
          :x="216"
          :y="620"
          :size="30"
        />
        <rect
          x="245"
          y="620"
          :width="toolbar.length * 34.5 + 1"
          height="30"
          :fill="token('tool')"
        />
        <rect
          x="245"
          y="620"
          :width="toolbar.length * 34.5 + 1"
          height="1"
          :fill="token('tool-border')"
        />
        <rect
          v-for="i in toolbar.length + 1"
          :key="i"
          :x="245 + (i - 1) * 34.5"
          y="620"
          width="1"
          height="30"
          :fill="token('tool-border')"
        />
        <Icon
          v-for="(name, i) in toolbar"
          :key="name"
          :name="name"
          :x="254 + i * 34.5"
          :y="628.5"
          :size="14"
          tone="tool-icon"
        />
        <text
          x="778.79"
          y="640.47"
          :fill="token('count')"
        >
          0 / 4096
        </text>
        <path
          :d="box(836.32, 620.7, 50.41, 27, 6)"
          :fill="token('pill')"
        />
        <text
          x="846.32"
          y="639.67"
          :fill="token('pill-text')"
        >
          Chat
        </text>
        <text
          x="896.73"
          y="639.67"
          :fill="token('pill-off')"
        >
          Ads
        </text>
        <path
          :d="box(216, 650, 720, 60, 0, 6, 6, 6)"
          :fill="token('input')"
        />
        <path
          :d="ring(216, 650, 720, 60, 0, 6, 6, 6)"
          fill-rule="evenodd"
          :fill="token('input-border')"
        />
      </g>
      <g class="panel">
        <rect
          x="941"
          y="39"
          width="211"
          height="681"
          :fill="token('panel')"
        />
        <rect
          x="941"
          y="39"
          width="1"
          height="681"
          :fill="token('panel-border')"
        />
        <path
          :d="box(913, 39, 29, 45, 0, 0, 6, 6)"
          :fill="token('expander')"
        />
        <path
          :d="ring(913, 39, 29, 45, 0, 0, 6, 6)"
          fill-rule="evenodd"
          :fill="token('expander-border')"
        />
        <Icon
          name="users"
          :x="918.75"
          :y="45.75"
          :size="14"
          tone="expander-icon"
        />
        <Icon
          name="chevronUp"
          :x="918.75"
          :y="63.25"
          :size="14"
          :turn="90"
          tone="expander-icon"
        />

        <rect
          x="942"
          y="77"
          width="100"
          height="1"
          :fill="token('tab2-line')"
        />
        <text
          x="966.8"
          y="63.97"
          class="w5"
          :fill="token('tab2-off')"
        >
          Friends
        </text>
        <path
          :d="box(1042, 39, 100, 39, 11.2, 11.2, 0, 0)"
          :fill="token('tab2-bg')"
        />
        <path
          d="M1042,78V50.2a11.2,11.2 0 0 1 11.2,-11.2H1130.8a11.2,11.2 0 0 1 11.2,11.2V78h-1V50.2a10.2,10.2 0 0 0 -10.2,-10.2H1053.2a10.2,10.2 0 0 0 -10.2,10.2V78z"
          :fill="token('tab2-border')"
        />
        <text
          x="1060.2"
          y="63.97"
          class="w5"
          :fill="token('tab2-text')"
        >
          Members
        </text>
        <text
          x="947"
          y="100.26"
          class="s17 w5"
          :fill="token('members')"
        >
          {{ members.length }} Members
        </text>
        <g :clip-path="`url(#${uid}-members)`">
          <g
            v-for="(who, i) in members"
            :key="who"
          >
            <Icon
              :name="statusIcons[characters[who].status]"
              :x="952"
              :y="107.5 + i * 21"
              :size="14"
              tone=""
              :fill="nameFill(who)"
            />
            <text
              x="969.5"
              :y="119.96 + i * 21"
              class="w6"
              :fill="nameFill(who)"
            >
              {{ who }}
            </text>
          </g>
        </g>

        <path
          :d="box(947, 675, 140.94, 35, 6, 0, 0, 6)"
          :fill="token('filter')"
        />
        <path
          :d="ring(947, 675, 140.94, 35, 6, 0, 0, 6)"
          fill-rule="evenodd"
          :fill="token('filter-border')"
        />
        <text
          x="960"
          y="697.44"
          :fill="token('item-text')"
        >
          Type to filter...
        </text>
        <path
          :d="box(1086.94, 675, 55.06, 35, 0, 6, 6, 0)"
          :fill="token('filter-btn')"
        />
        <path
          :d="ring(1086.94, 675, 55.06, 35, 0, 6, 6, 0)"
          fill-rule="evenodd"
          :fill="token('filter-btn-border')"
        />
        <Icon
          name="filter"
          :x="1099.94"
          :y="685.5"
          :size="14"
          tone="filter-icon"
        />
        <path
          d="M1120.8,694.2h8.4l-4.2,-4.2z"
          :fill="token('filter-icon')"
        />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
  .client-window {
    // ! Tab strip and chat are separate pages, each with its own background box.
    background:
      var(--hc-strip-bg) top / 100% 4.7222% no-repeat,
      var(--hc-chat-bg) bottom / 100% 95.2778% no-repeat;
  }

  .client {
    display: block;
    width: 100%;
    height: auto;
    // * The client's own font stack.
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      'Helvetica Neue',
      Arial,
      'Noto Sans',
      'Liberation Sans',
      sans-serif;
    font-size: 14px;
    cursor: default;
    user-select: none;
  }

  .s16 {
    font-size: 16px;
  }

  .s17 {
    font-size: 17px;
  }

  .s20 {
    font-size: 20px;
  }

  .s24 {
    font-size: 24px;
  }

  .w5 {
    font-weight: 500;
  }

  .w6 {
    font-weight: 600;
  }
</style>
