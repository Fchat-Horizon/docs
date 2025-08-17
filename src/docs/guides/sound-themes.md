# Sound Theme Creation Guide

> [!NOTE]  
> This page is about a feature slated for release in an upcoming release. Though you can test it right now by enabling beta updates in the settings, it might change by the time the update gets properly released and this page might not be fully accurate anymore.

## Overview

Sound themes allow you to customize the audio experience in F-Chat Horizon without modifying the source code. This guide will walk you through creating your own sound theme.

## Quick Start

1. Create a new folder with your theme name
2. Add a `sound.json` configuration file
3. Create a `sounds/` directory with your audio files
4. Package as a zip/7z archive for submission

## File Structure

Your sound theme should follow this structure:

```
your-theme-name/
├── sound.json
└── sounds/
    ├── attention.ogg
    ├── chat.ogg
    ├── login.ogg
    ├── logout.ogg
    ├── modalert.ogg
    ├── newnote.ogg
    ├── silence.ogg
    └── system.ogg
```

## Configuration File (sound.json)

The `sound.json` file defines your theme's metadata and sound mappings.

### Basic Template

```json
{
  "name": "Your Theme Name",
  "version": "1.0.0",
  "description": "A brief description of your theme",
  "author": "Your Name",
  "sounds": {
    "attention": "sounds/attention",
    "chat": "sounds/chat",
    "login": "sounds/login",
    "logout": "sounds/logout",
    "modalert": "sounds/modalert",
    "newnote": "sounds/newnote",
    "silence": "sounds/silence",
    "system": "sounds/system"
  },
  "formats": {
    "preferred": "ogg",
    "fallback": ["mpeg", "wav"]
  }
}
```

### Configuration Fields

#### Metadata

- **name**: The display name shown in the settings UI
- **version**: Theme version (start at "1.0.0")
- **description**: Brief description of your theme
- **author**: Your name or username

#### Sound Mappings

The `sounds` object maps each sound event to an audio file (without extension):

- **attention**: Played for attention-grabbing events
- **chat**: Played when receiving chat messages
- **login**: Played when successfully logging in
- **logout**: Played when logging out
- **modalert**: Played for moderator alerts
- **newnote**: Played when receiving new notes/messages
- **silence**: A silent audio file (used to mute certain events)
- **system**: Played for system messages

#### Audio Formats

- **preferred**: The main audio format to use
- **fallback**: Array of backup formats in order of preference

## Audio Requirements

### Supported Formats

- **OGG Vorbis** (recommended for best compatibility)
- **MPEG** (mp3 files, widely supported)
- **WAV** (uncompressed)

### File Naming

- Files should match the keys in your `sounds` configuration
- Don't include the file extension in the JSON (e.g., use `"attention"` not `"attention.ogg"`)
- The client will automatically look for files with your preferred and fallback extensions

## Advanced Features

### Custom Sound Mappings

You can map sounds to different files or reuse the same file for multiple events:

```json
{
  "sounds": {
    "attention": "sounds/notification",
    "chat": "sounds/notification",
    "login": "sounds/success",
    "logout": "sounds/success",
    "modalert": "sounds/alert",
    "newnote": "sounds/mail",
    "silence": "sounds/silence",
    "system": "sounds/beep"
  }
}
```

### Multiple Format Support

If you want to provide multiple formats, include them in your `sounds/` directory:

```
sounds/
├── attention.ogg
├── attention.mp3
├── attention.wav
├── chat.ogg
├── chat.mp3
└── ...
```

### Minimal Fallback Setup

If you only want to provide one format, set an empty fallback array:

```json
{
  "formats": {
    "preferred": "ogg",
    "fallback": []
  }
}
```

## Sound Theme Folder Location

Sound themes need to be placed in the correct directory within your F-Chat Horizon installation. The location varies depending on your operating system:

### Full Path Structure

The sound themes are located at:

```
<installdir>/resources/app.asar.unpacked/sound-themes/
```

### Installation Directory by OS

**Windows:**

- Usually: `C:\Program Files\Horizon\`
- Full path: `C:\Program Files\Horizon\resources\app.asar.unpacked\sound-themes\`

**macOS:**

- Usually: `/Applications/Horizon/`
- Full path: `/Applications/Horizon/resources/app.asar.unpacked/sound-themes/`

**Linux:**

- Usually: `/opt/Horizon/` or `/usr/local/bin/Horizon/`
- Full path: `/opt/Horizon/resources/app.asar.unpacked/sound-themes/`

### Finding Your Installation

If you're unsure where F-Chat Horizon is installed:

1. **Windows**: Check Program Files or Program Files (x86)
2. **macOS**: Look in Applications folder
3. **Linux**: Check `/opt/`, `/usr/local/bin/`. Running `which horizon-electron` might point towards it, as well

## Testing Your Theme

1. Place your theme folder in the sound themes directory (see [Sound Theme Folder Location](#sound-theme-folder-location) above for the exact path)
2. Restart the application
3. Go to `Settings → Notifications → Sound Theme` and select your theme
4. Test different events to ensure all sounds work correctly (Will eventually add buttons to easily test.)

## Submitting themes

### Packaging

- Create a zip or 7z archive containing your theme folder
- The archive should contain the theme folder with `sound.json` and `sounds/` directory
- Name your archive clearly (e.g., `my-awesome-theme.zip`)

### Before Submitting

- [ ] Test all sounds in the application
- [ ] Ensure all required sound files are present
- [ ] Verify your `sound.json` syntax is valid

### Submission

Submit your packaged theme archive in the #sound-theme-submissions channel.

### Happy theming!
