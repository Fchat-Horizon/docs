---
title: Exporter & Importer
outline: deep
---

# Exporter & Importer

Horizon includes a built-in exporter/importer for backing up and restoring your client data. It allows you to easily back up and restore the following:
- General settings (global app config)
- Character settings (per-character config)
- Chat logs
- Message drafts
- Pinned conversations
- Pinned EIcons
- Recent conversations/channels
- Hidden users

You can choose which characters and which data types to include. The exported ZIP uses a folder structure like the following:
```
settings
characters/<character>/settings/[...]
characters/<character>/logs/[...]
characters/<character>/drafts.txt
```

## Exporting

1. Open the hamburger menu, go to `Horizon → Export Horizon Data`
2. Select which data types to include:
   - General settings
   - Character settings
   - Chat logs
   - Message drafts
   - Pinned conversations
   - Pinned EIcons
   - Recent conversations/channels
   - Hidden users
3. Select which characters to include (you can use "Select All" or choose individually)
4. Click the export button
5. The export is saved as `horizon-export-YYYY-MM-DDTHH-MM-SS.zip` in your Downloads folder (or a location you choose)

> [!WARNING]
> While this doesn't include your password, these backups do include all your logs and your username. This can obviously be used to deanonymize you, so avoid sharing these logs with anyone... Duh.

## Importing

### Importing from an export
1. Open the hamburger menu, go to `Horizon → Export Horizon Data`
2. Scroll to the bottom section titled "Import from export"
3. Click "Select Export" to choose your `horizon-export-YYYY-MM-DDTHH-MM-SS.zip` file
4. Once selected, choose which data to import (general settings, character settings, logs, drafts, pinned conversations, pinned EIcons, recents, and hidden users)
5. Select which characters to include
6. Choose whether to "overwrite" or "merge" with existing data
7. Click "Restore export" to complete the import

### Importing from the original client
Horizon will automatically prompt you to import your data when you first launch it, if it detects compatible Vanilla client data. However, to do it manually:

1. Open the hamburger menu, go to `Horizon → Export Horizon Data`
2. Select the "Import from Vanilla" tab
3. (Optional) If Horizon can't find your Vanilla data automatically, click "Browse…" to manually select the folder
4. Choose which data to import:
   - App-wide settings
   - Character settings
   - Pinned eicons
   - Character logs
5. Check "Overwrite existing Horizon data when conflicts occur" if you want to replace existing data, otherwise new data will be merged
6. Select which characters to include
7. Click "Import selected data" to complete the import

## Overwrite vs Merge

- If you choose "overwrite", files in your data directory will be replaced by the imported files.
- If you choose "merge", only missing files are added; existing files are preserved.
- Drafts files are only overwritten if the existing file is not empty.

## Vanilla F-Chat Import

- Horizon can import data from the official F-Chat client (As well as Rising / {maybe} Frolic).
- You can select the vanilla data directory manually, or Horizon will try to find it automatically.
- Supported imports: character logs, character settings, pinned EIcons, general settings.
- You can select which characters and data types to import, and whether to overwrite or merge.

## CLI Tools

- Both export and import can be run from the command line for advanced users.
- CLI supports all the same options as the GUI, plus dry-run mode to preview changes.
- See the Horizon repo for CLI usage details.

## Troubleshooting

- If import fails, check that the ZIP is a valid Horizon export and not corrupted.
- Import is disabled while signed into any character.
- For vanilla imports, make sure the data directory is correct and readable.
  - Note, you should be able to point to an external data folder, not just the one in the horizon-electron folder.
- If you continue to have issues, [please reach out!](../contact)

---

> [!NOTE]
> This feature is new and may receive further improvements. Feedback and bug reports are welcome!


