# Project layout

## What you author

```
my-resource/
├── .luam.manifest          project manifest, the only file luam init writes
├── .env               deployment keys and their defaults, committed
├── .env.local         local overrides, never committed
├── config.lua         plain Lua the resource author owns, copied verbatim
├── assets/            copied verbatim and declared so clients download them
└── src/
    ├── shared/        runs on the server and on every client
    ├── server/        runs on the server only
    └── client/        runs on every client only
```

Only `.luam.manifest` and at least one source file are required. Everything else is
optional and appears in the output only when it exists.

### The folder decides the environment

`src/server`, `src/client` and `src/shared` are not a convention — the compiler
reads them. A file's environment decides which MTA APIs and which events resolve,
and which globals from other files it can see. A `#!server`, `#!client` or
`#!shared` directive on the first line overrides the folder.

See [Environments](/en/mta/environments) for the full rule.

### File extensions

| Extension | Meaning |
| --- | --- |
| `.luam` | Source. Checked, compiled, and written as `.lua`. |
| `.d.luam` | [Declaration file](/en/language/declaration-files). Checked, describes types for Lua the compiler does not own, emits nothing. |
| anything an `assets` mapping names | Copied and declared as `<file>`, so clients download it. |

A file no `sources` pattern and no `assets` mapping names is not part of the
build. Nothing is copied by accident.

### One file next to the manifest

There is one exception, and it is the project root. A `.luam` file directly
beside `.luam.manifest` is compiled even when no `sources` pattern names it, so
the smallest resource is two files:

```
my-resource/
├── .luam.manifest
└── index.luam
```

A root file has no folder to read its side from, so its `#!` directive decides,
and it runs `shared` when it declares none. Nothing else changes: a `.luam` file
in a subdirectory no pattern names is still not built, and the build says so with
`config-unmatched-source`.

The exception stops at the root. One directory, the one holding the manifest, is
the only place read without a pattern — a file put there was put there on
purpose.

## What a build writes

```
build/
├── my-resource.luam-map.json
└── my-resource/
    ├── meta.xml
    ├── config.lua
    ├── env.lua
    ├── assets/
    └── src/
        ├── shared.lua
        ├── server.lua
        └── client.lua
```

`build` uses production bundles by default. `config.lua`, `env.lua`, and assets stay
outside the bundles, and the map stays outside the resource. `ensure` uses a
mirrored tree by default and `dev` always uses it. See
[Output layouts and source maps](/en/reference/output-layouts) for both complete
trees, manifests, and overrides.

## Naming and path rules

- `outDir`, `resourcesDir`, and every `sources`, `assets`, and `loadOrder`
  entry must stay inside their base directory. An absolute path or a `..`
  segment is rejected with `config-escaping-path`.
- Two sources that would produce the same output path fail the build with
  `project-duplicate-output`. Rename one of them.
- `name` in `.luam.manifest` names the output folder and the resource `ensure`
  restarts. It never reaches `meta.xml` — MTA reads a resource's name from its
  folder.

## Several resources in one folder

A resource directory is one project. Put several beside each other and add a
[`.luam.server`](/en/reference/server-file) at the root, and the folder becomes a
**workspace** — one MTA installation named once, shared by all of them:

```
resources/
  .luam.server            names the MTA installation
  gamemode-race/
    .luam.manifest
    src/
  scoreboard/
    .luam.manifest
    src/
  notes/                  not a resource: no manifest
```

A workspace's resources are its **direct children that hold a
`.luam.manifest`** — one level, never recursive, so a build output tree or a
vendored copy cannot join by accident and `node_modules` is never walked.

The root itself needs no manifest of its own. `luam dev`, `luam server` and
`luam ensure <resource>` all run there; inside a single resource directory every
command behaves as it does on its own.

## What the CLI writes beside the project

`build` caches the latest MTA release it looked up in `.luam/mta-version.json`, so
a later build with no network still succeeds. That is the only thing the CLI
writes outside `outDir`, and it is generated — ignore `.luam/` in version control.

There is no settings snapshot. The language server reads `.luam.manifest`
directly, so a change to `compiler` takes effect as soon as the file is
saved.

## Configuring the layout

Every directory above is a default you can change in
[`.luam.manifest`](/en/tooling/luam-manifest):

```luam
name = 'my-resource'

sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}

assets = {
    { from = 'assets/**/*', to = 'assets' },
}

outDir = 'build'
```
