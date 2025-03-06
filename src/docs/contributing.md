---
outline: 2-3
---

# Contributing to Horizon
Before we begin, I'd like to thank you for taking interest in contributing! Horizon is a small-time side hobby, so any help is greatly appreciated.

That being said, *Horizon is an opinionated fork*, and as such we enforce strong code quality standards. You can read more about this on this page.

## Table of Contents <!-- omit in toc -->
- [Contributing to Horizon](#contributing-to-horizon)
  - [Where do I start?!](#where-do-i-start)
    - [Technology](#technology)
    - [Setting up your development enviroment](#setting-up-your-development-enviroment)
    - [Building](#building)
      - [Electron](#electron)
      - [Mobile](#mobile)
    - [Project layout](#project-layout)
      - [Branches](#branches)
      - [Tags](#tags)

## Where do I start?!

You wish to add a new feature to Horizon, or fix that one bug that's been pissing you off for months? Then this guide'll give you the rundown.

### Technology

Horizon is written primarily in *Vue*, *Typescript*, and *Javascript.* You'll need **[Node.js](https://nodejs.org/en/download)**, **[PNPM](https://pnpm.io/installation)**, and **[NVM](https://github.com/nvm-sh/nvm)** (or a similar node version manager, such as fnm). You might also want to consider using VScode to integrate with prettier.

You should use Node.js **v22.13.0**.

### Setting up your development enviroment

In short, you can run the following commands:

```sh
git clone https://github.com/Fchat-Horizon/Horizon.git
cd Horizon 
pnpm install
```

### Building

#### Electron

Run the following commands,

**For development:**
```
cd electron
pnpm build
pnpm start
```

**For distribution:**
```
cd electron
pnpm build:dist
node pack.js
```

#### Mobile

Mobile builds are currently unsupported, but if you're up to the challange, *maybe you can fix it?*

Look at the `mobile` directory for more info. For `android`, we recommend you use android studio to make your life more pleasent.

### Project layout

#### Branches

- **main**  
  This is the production-ready branch. All stable releases are tagged on this branch.

- **develop**  
  The main integration branch. New features and fixes are first merged into develop.

- **feature/\***  
  For new features, create a branch named `feature/your-feature-name` off of develop. Once finalized, open a PR to merge into develop.

- **hotfix/\***  
  For urgent fixes on production, create a branch named `hotfix/description` off of main, then merge back into both main and develop after the fix.

- **experimental/\*** (optional)  
  For experimental changes that may not be merged immediately, create branches with the prefix `experimental/`.

#### Tags

We follow a [semantic versioning](https://semver.org) format:
- **vX.Y.Z**  
  Represents a production-ready release. For example: `v1.0.0`
- **vX.Y.Z-DEV-X.Y**  
  Early, often unstable releases. Also known as *Canary* in **Rising**.
- **vX.Y.Z-BETA-X.Y**  
  A pre-release version that's intended for testing before the final release.
- **vX.Y.Z-rc-X.Y**  
  A release candidate version. This indicates a near-final release version. No new features should be added to RCs.
