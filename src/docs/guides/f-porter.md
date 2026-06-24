---
title: Importing from the F-Chat web client
outline: deep
description: Use the F-Porter userscript to export your logs and per-character settings from the F-Chat web client into a Horizon-importable backup.
---

# Importing from the F-Chat web client

If your chat history lives in the **official F-Chat web client** (the one you use in your browser at [f-list.net](https://www.f-list.net/chat3/)), Horizon can't read it directly. The web client keeps your logs inside the browser's own storage, not in files on disk like the desktop clients do.

**F-Porter** is a small userscript that bridges that gap. It reads your logs and per-character settings straight out of the browser and packages them into a `horizon-export-*.zip`, the exact same format Horizon's [Exporter & Importer](../exporter-importer.md) produces. Once you have that ZIP, importing into Horizon is fairly trivial.

> [!INFO]
> F-Porter only exports **logs** and **per-character settings**. It does not export global app settings, drafts, pinned conversations, pinned EIcons, recents, or hidden users. Those work differently in the web client and aren't carried over.

## What you'll need

- The browser you actually used the F-Chat web client in. Your logs are stored per-browser, so run F-Porter in the same browser (and profile) where your history lives.
- A userscript manager extension. Any of these work:
  - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari)
  - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Edge, Firefox)
  - Greasemonkey (Firefox)
- A Horizon install to import into. See [Installing Horizon](install) if you don't have it yet.

## Installing the script

1. Install one of the userscript managers above and enable it.
2. Click to install F-Porter: **[Install F-Porter](https://horizn.moe/f-porter.user.js)**. Your userscript manager will catch the `.user.js` file and show an install prompt.
3. Confirm the install in that popup.

That's it. Because the script is served from this site, your userscript manager will also pull future updates from the same link automatically.

The script only runs on F-List chat pages (`/chat3/*` and `/chat/*`), so it won't touch any other site.

## Exporting your data

1. Open the [F-Chat web client](https://www.f-list.net/chat3/) and log in.

   > [!TIP]
   > Each character you want to export must have been logged in **at least once** in this browser, otherwise there's no stored data to read.

2. Look for the blue **Export Logs** button in the bottom-right corner of the page.
3. Click it. A dialog lists every character F-Porter found. Tick the ones you want (all are selected by default) and click **Export**.
4. A progress bar shows reading and compression. When it finishes, your browser downloads `horizon-export-YYYY-MM-DDTHH-MM-SS.zip`.

A toast in the corner reports how many messages, conversations, and settings files were exported. If anything failed, it'll say so, and the details are in the browser console (F12 → Console, filtered to `[F-Porter]`).

> [!WARNING]
> This ZIP contains all of your exported chat logs and your character names in plain text. It can be used to deanonymize you, so treat it like the logs themselves and don't share it around.

## Importing into Horizon

The ZIP is already in Horizon's native export format, so you import it the normal way:

1. Open the **menu** (the `☰` icon in the top-left) and go to `Horizon → Manage Data`
   - (On Mac, you'll need to click the `Horizon` app menu instead)
2. Open the **Import** taband click **Select Export**.
3. Pick your `horizon-export-*.zip`.
4. Choose which characters and data types to bring in, and whether to **overwrite** or **merge** with existing data.
5. Click **Restore export**.

For the full rundown of the import options, see the [Exporter & Importer](../exporter-importer.md) guide.

> [!INFO]
> Import is disabled while you're signed into a character in Horizon. Log out first if the import options are greyed out.

## How it works

For the curious: the F-Chat web client stores each character's logs in an IndexedDB database named `logs-<character>`, and per-character settings as `localStorage` keys like `<character>.settings.<name>`. F-Porter reads both, re-encodes the logs into Horizon's binary log + `.idx` index format, and zips everything up under:

```
characters/<character>/logs/<conversation>
characters/<character>/logs/<conversation>.idx
characters/<character>/settings/<name>
```

This is the same layout Horizon's own exporter uses.

## Troubleshooting

- **No Export Logs button.** Make sure the userscript manager is enabled and the script is active for `f-list.net`. Refresh the page after installing.
- **"No characters found."** You need to have logged into at least one character in this browser before. Log in once, then try again.
- **A character is missing from the list.** It was probably never logged in on this browser or profile, or you used a different browser for it. Run F-Porter there instead.
- **Some conversations failed.** Open the console (F12) and look for `[F-Porter]` messages for the conversations that errored. The rest of the export still completes.
- **The import is greyed out in Horizon.** Log out of your character first; import is blocked while signed in.

Still stuck? Please [Reach out](../../contact).
