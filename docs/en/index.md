---
layout: home
title: Luam manual
titleTemplate: Typed Lua for Multi Theft Auto
hero:
    name: Luam
    text: Typed Lua for Multi Theft Auto
    tagline: Write .luam with types, classes and template strings. Ship plain Lua 5.1 and a generated meta.xml your server can start as-is.
    image:
        src: /luam-mark.svg
        alt: Luam
    actions:
        - theme: brand
          text: Quick start
          link: /en/guide/quick-start
        - theme: alt
          text: Install
          link: /en/guide/installation
        - theme: alt
          text: Language reference
          link: /en/reference/keywords
features:
    - title: Errors before the server starts
      details: A server-only API in a client file, a typo in an MTA function name, a string where a number belongs — all build errors. A build with any error writes nothing.
      link: /en/mta/environments
      linkText: Environments
    - title: Typed Lua, not TypeScript
      details: Blocks still end with end, inequality is still ~=. Annotations, classes, enums and interfaces are erased at build time.
      link: /en/language/
      linkText: The language
    - title: One resource, ready to start
      details: Production builds emit one readable Lua bundle per non-empty environment and a separate source map for resolving MTA errors.
      link: /en/reference/output-layouts
      linkText: Output layouts
    - title: The editor never disagrees
      details: The language server runs the same checker the CLI runs, so completion, hover and diagnostics match the build exactly.
      link: /en/tooling/editors
      linkText: Editors
---

## What Luam is

Luam is a typed language for [Multi Theft Auto](https://multitheftauto.com/). You
write `.luam` files, the compiler checks them, and it emits readable **Lua 5.1**
plus a generated `meta.xml` — an MTA resource your server can start without any
further step.

```luam
local health: number = 100

function heal(player: Player, amount: number): void
    health += amount

    outputChatBox(`${getPlayerName(player)} healed`, player)
end
```

It is *typed Lua*, not TypeScript. Comments use `#` and `#* ... *#` so they never
collide with the `--` decrement operator, and every type annotation disappears
from the generated Lua.

## Where to start

| You want to | Read |
| --- | --- |
| Install the toolchain | [Installation](/en/guide/installation) |
| Build your first resource | [Quick start](/en/guide/quick-start) |
| Understand the type system | [Types](/en/language/types) |
| Know which MTA API a file may call | [Environments](/en/mta/environments) |
| Configure a project | [.luam.manifest](/en/tooling/luam-manifest) |
| Copy a working example | [Recipes](/en/recipes/) |
| Look up a keyword or a diagnostic | [Reference](/en/reference/) |
