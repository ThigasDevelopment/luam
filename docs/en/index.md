---
layout: home
title: Luam manual
titleTemplate: Typed Lua for Multi Theft Auto
hero:
    name: Luam
    text: Typed Lua for Multi Theft Auto
    tagline: Write .luam with types and classes. Ship plain Lua 5.1 and a generated meta.xml your server starts as-is.
    actions:
        - theme: brand
          text: Quick start
          link: /en/guide/quick-start
        - theme: alt
          text: Install the CLI
          link: /en/guide/installation
---

## Try it

Nothing to install. The compiler and the language server both run in your
browser: completion, hover, go-to-definition, rename and diagnostics, from the
same code your editor runs.

<div class="luam-cta">
<a href="/en/playground">Open the playground</a>
<span>or <a href="/en/guide/installation">install the CLI</a> to build a real resource.</span>
</div>

## What the compiler refuses to ship

<div class="luam-split">
<div>

### Wrong side

`dxDrawText` in a server file is an error, not a runtime surprise. Every file
resolves to `server`, `client` or `shared`, and the MTA catalog is scoped to it.

</div>
<div>

### Wrong name

A typo in an MTA function is checked against the pinned catalog, so it fails at
`luam check` instead of returning `nil` at three in the morning.

</div>
<div>

### Wrong type

A `string` where a `number` belongs, a field that does not exist on a class, a
name misspelled inside `` `${...}` `` — all build errors.

</div>
</div>

A build with any error writes nothing at all, so a broken resource never reaches
the server directory.

## Still Lua

Blocks close with `end`. Inequality is `~=`. Comments use `#` so they never
collide with the `--` decrement operator. Annotations, classes, enums and
interfaces are erased at build time, and what lands in your resource is readable
Lua 5.1 you can debug directly on the server.

## Where to go next

<ul class="luam-next">
<li><a href="/en/guide/installation"><strong>Installation</strong><span>Install the CLI and the editor extension.</span></a></li>
<li><a href="/en/guide/quick-start"><strong>Quick start</strong><span>Build and run your first resource.</span></a></li>
<li><a href="/en/language/types"><strong>Types</strong><span>The type system, end to end.</span></a></li>
<li><a href="/en/mta/environments"><strong>Environments</strong><span>Which MTA API each file may call.</span></a></li>
<li><a href="/en/recipes/"><strong>Recipes</strong><span>Complete projects, verified on every build.</span></a></li>
<li><a href="/en/reference/"><strong>Reference</strong><span>Keywords, diagnostics, configuration fields.</span></a></li>
</ul>
