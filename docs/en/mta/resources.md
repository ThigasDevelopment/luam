# Resources and meta.xml

A build produces a complete MTA resource. Nothing else is required before
`refresh` and `start`.

## What is written

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

This is the default bundle layout. Empty environments are omitted. `ensure`
defaults to a mirrored tree and `dev` always uses one. See
[Output layouts and source maps](/en/reference/output-layouts) for both shapes.

The resource **name** comes from `.luam.manifest` and names the folder. It never
reaches `meta.xml`, because MTA reads a resource's name from its directory.

## The generated manifest

In the bundle layout, `meta.xml` lists `config.lua` and then one script per
non-empty environment in shared, server, client order.

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

A server entry carries neither `type` nor `cache`, since both equal the MTA
default; every client and shared entry carries `cache="false"`. Tree output lists
helpers, `config.lua`, pinned `loadOrder` entries, and source groups instead.

`<export>` entries come from [`export` functions](/en/language/exports), and
`<file>` entries from `assetDirs`.

## Runtime helpers

Helpers are included **only when generated code uses the feature**. Bundle output
places them before modules inside the environment bundle. Tree output writes
them under `lib/<environment>/`, outside the source tree:

| Helper | Copied when |
| --- | --- |
| `class.lua` | The resource declares a class or an enum. |
| `string.lua` | A template string or a string extension is used. |
| `table.lua` | A table extension is used. |
| `math.lua` | A number extension such as `clamp` is used. |
| `threads.lua` | `sleep` or `Threads` is named. Also selectable through `helpers`. |
| `async.lua` | `Async` is named. |
| `dotenv.lua`, `env.lua` | The project has a `.env`. Server-only. |

A resource with no classes never carries `class.lua`, and a server-only helper is
never downloaded by a client.

## `min_mta_version`

The build resolves the latest published MTA release and caches it in
`.luam/mta-version.json`. With no network it uses the cache; with neither it
warns, leaves the element out, and still produces a complete resource. `--offline`
or the `LUAM_OFFLINE` environment variable skips the lookup deliberately.

This is the only network call in a build, and it is never required for one to
succeed.

## Load order

`loadOrder` pins source paths ahead of their group:

```luam
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }
```

A script is placed before other modules in its environment, and an asset before
other assets. Order is meaningful for assets too, since a shader can depend on another. An entry
matching no file fails the build with `project-load-order-missing`, so a rename
cannot break the order silently.

## Incremental writes and pruning

Files whose content did not change are left alone, so a sync moves only what
actually changed. Assets are compared byte for byte, so a binary file is not
rewritten.

Pruning removes what the build no longer produces: `.lua` files, `meta.xml`, and
anything under a configured source directory, a configured asset directory, or
`lib/`. A file the build never wrote is left in place, and `.env` is never
touched.

**A build that reports any error writes nothing**, so a previously working
resource is never replaced with partial output.

## Installing it

```
refresh
start my-resource
```

Copy `build/my-resource` into `<MTA Server>/mods/deathmatch/resources/`, or let
[`luam ensure`](/en/guide/daily-development) mirror it for you on every save.
