---
description: Common questions about Horizon. What it is, how it differs from Rising and 3.0, and how to get started.
---

# Frequently Asked Questions

## I'm a Rising user and I can't connect anymore!

F-Chat Rising is no longer maintained, and its client can no longer connect to chat. This was done for many reasons, including security issues; you can learn more in [the official newspost.](https://www.f-list.net/newspost/432/) The good news is that Horizon is its direct, community-run continuation: it has [every feature Rising had](features-overview#rising-features) (minus "the one"), it keeps getting new features and bug fixes, and you can bring your existing logs and settings along.

To get going:

1. [Download Horizon](../download) for your platform.
2. [Install it](guides/install) following the guide for your OS.
3. [Move your logs and settings over](guides/moving-from-rising), you should be prompted to do this automatically.

Then log in with your usual F-List account and you're back in business. If you get stuck, [reach out](../contact) and we'll help you sort it out.

## What is Horizon?

Horizon is a fork of the now defunct F-Chat Rising, which itself was a fork of the official 3.0 standalone client. A “fork” basically just means that we use the same base source code, but made changes to it to suit our needs. At this point Horizon has had enough changes from both Rising and 3.0 that it’s considerably different already.
Our goal is for Horizon to be a community-driven project, rather than just a personal project that others can occasionally contribute to.

## What’s a ‘third-party client’?

It’s an alternative client to the official 3.0/2.0/1.0 F-Chat clients, developed by (and for) members of the F-List community. It’s not an alternative to the whole F-List ecosystem— you’ll still be talking to and dealing with the same people, but you’ll be using a different program for it.

## Who is making Horizon?

**You!** And the rest of the community.

For a slightly less obtuse answer, we do have [a list](https://github.com/Fchat-Horizon/Horizon/blob/main/CONTRIBUTORS.md) of people who contributed code to the project on our GitHub. But everyone who has made a suggestion, bug report or just spread the word is part of the project in a way.

## What advantage/thing do I get as opposed to F-Chat 3.0?

The full list of additional features and quality of life changes is probably way too big for a short FAQ item like this, but here are some of our favourite additions to Horizon:

- Friendlier resource usage
- Automatically saving your message drafts in case of disconnects or crashes. Which also means you can write a post for someone who’s offline and send it when they come back online!
- High quality or animated profile pics.
- Custom name colours
- Way more themes than both vanilla and Rising. You can even go way in depth with customizing them by using your own custom CSS.
- Way better Linux support.
- [Every feature that came with Rising](features-overview#rising-features), along with improvements to said features and overall lower RAM usage.

## How do I use it? Which platforms are supported?

Right now we have versions for Windows, macOS and Linux. These are standalone apps that you’d need to install on your computer. Check out our installation guide [here](guides/install).

We are planning on making a version for Android, and maaaaaybe an iOS version too, but we can’t give an ETA for when this mobile version will be released.

## I’m using the official 3.0 standalone client. Can I keep my logs and settings?

**Yes!** You should be automatically prompted to import your logs and settings when you first sign in, but [this guide](guides/moving-from-rising) can walk you through the manual process as well.

## I’m using 3.0 in my web browser. Can I keep my logs and settings?

**Yes!** Please see the guide [here](guides/f-porter.md) for instructions on exporting your browser logs and importing them into Horizon.

## Why do custom name colors only show up after moving my mouse over someone?

The short answer: because it's complicated™, but we’re working on it.

The slightly less short answer is that the existing system from Rising that’s being used for caching profile data (so that we don’t have to barrage F-List’s servers) was not built for loading all those profiles at once, so it’d make the app really chug on lower end computers. We’re actively looking into rewriting this cache system, both to get it to run smoother and to let it more comfortably automatically load names.

## I have a really cool suggestion for a feature, or discovered an annoying bug!

You can submit these on our GitHub, Discord or directly reach out to us via email or F-List notes. You can find those [here](../contact).

## I want to contribute. How do I get started?

Firstly, thank you for wanting to lend a hand in directly developing Horizon. No matter if you’re just trying to fix a bug that has bothered you for ages, or you have a really cool feature that you want to share. All your contributions are very much appreciated.
If you’re looking for help in getting the dev environment set up, check out this page on our wiki.

If you’re looking for things to do, our GitHub issue tracker is the most comprehensive list of features/ bugs that need some attention. We also have a specific tag for issues we think require very little knowledge of the codebase and should be pretty easy to do for anyone who’s mildly familiar with programming.

If you require direct help while trying to work on something, our Discord is the easiest way to directly reach out to maintainers and contributors.

## How much RAM is required to run Horizon?

Around 1 GB if you’re using 3 characters at a time, but depending on your OS performance may vary. This number is something we’re working on and will get shaved down in the (hopefully nearby) future.
