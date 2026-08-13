# Guide

This section takes you from an empty folder to a resource running on an MTA
server, and then to the loop you leave running while you work.

| Page | What it covers |
| --- | --- |
| [Installation](/en/guide/installation) | Node.js, the `luam` CLI, and the editor extension. |
| [Quick start](/en/guide/quick-start) | Scaffold, write, check, build, and start a resource. |
| [Project layout](/en/guide/project-layout) | The source tree, what the folder names mean, and what a build writes. |
| [Daily development](/en/guide/daily-development) | `luam ensure`, `luam dev`, incremental rebuilds, and logs. |
| [Troubleshooting](/en/guide/troubleshooting) | The failures a new project hits, and how to read a diagnostic. |

## Before you begin

You need two things: [Node.js](https://nodejs.org/) 20 or newer, and an
[MTA:SA](https://multitheftauto.com/) 1.5+ server you can restart.

You do **not** need a Lua toolchain. The compiler emits Lua text; it never runs
Lua, and it never bundles a Lua interpreter.

```bash
node --version
```

If that prints anything below `v20`, upgrade before continuing.

## What you will end up with

A project directory that holds your `.luam` sources and one `.luam.manifest`, and a
build directory that holds a complete MTA resource:

```
my-resource/
├── .luam.manifest
├── src/
│   ├── shared/
│   ├── server/
│   └── client/
└── build/my-resource/     ← copy this into your MTA server
```

Nothing else is scaffolded. `luam init` writes `.luam.manifest` and stops, so there is
no framework and no example tree to delete before your first line of code.
