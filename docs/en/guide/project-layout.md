# Project layout

## What you author

```
my-resource/
├── luam.json          project manifest, the only file luam init writes
├── .env               deployment keys and their defaults, committed
├── .env.local         local overrides, never committed
├── config.lua         plain Lua the resource author owns, copied verbatim
├── assets/            copied verbatim and declared so clients download them
└── src/
    ├── shared/        runs on the server and on every client
    ├── server/        runs on the server only
    └── client/        runs on every client only
```

Only `luam.json` and at least one source file are required. Everything else is
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
| anything else under `sourceDirs` | Copied, but not declared in `meta.xml`. |
| anything under `assetDirs` | Copied and declared as `<file>`, so clients download it. |

## What a build writes

```
build/
├── my-resource.luam-map.json
└── my-resource/
    ├── meta.xml
    ├── config.lua
    ├── .env
    ├── assets/
    └── src/
        ├── shared.lua
        ├── server.lua
        └── client.lua
```

`build` uses production bundles by default. `config.lua`, `.env`, and assets stay
outside the bundles, and the map stays outside the resource. `ensure` uses a
mirrored tree by default and `dev` always uses it. See
[Output layouts and source maps](/en/reference/output-layouts) for both complete
trees, manifests, and overrides.

## Naming and path rules

- `outDir`, `resourcesDir`, and every `sourceDirs`, `assetDirs` and `loadOrder`
  entry must stay inside their base directory. An absolute path or a `..`
  segment is rejected with `config-escaping-path`.
- Two sources that would produce the same output path fail the build with
  `project-duplicate-output`. Rename one of them.
- `name` in `luam.json` names the output folder and the resource `ensure`
  restarts. It never reaches `meta.xml` — MTA reads a resource's name from its
  folder.

## Configuring the layout

Every directory above is a default you can change in
[`luam.json`](/en/tooling/luam-json):

```json
{
    "name": "my-resource",
    "sourceDirs": ["src"],
    "assetDirs": ["assets"],
    "outDir": "build"
}
```
