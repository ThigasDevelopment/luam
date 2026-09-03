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
    ├── env.lua
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
`<file>` entries from the `assets` mappings. `<include>` entries come from
`dependencies`.

## Runtime helpers

Helpers are included **only when generated code uses the feature**. Bundle output
places them before modules inside the environment bundle. Tree output writes
them flat under `lib/`, outside the source tree:

| Helper | Copied when |
| --- | --- |
| `class.lua` | The resource declares a class or an enum. |
| `string.lua` | A template string or a string extension is used. |
| `table.lua` | A table extension is used. |
| `math.lua` | A number extension such as `clamp` is used. |
| `promise.lua` | An `async function` is declared, or `Promise`, `delay` or `sleep` is named. Also selectable through `helpers`. |
| `threads.lua` | `Threads` is named. Requires `promise.lua`. |
| `async.lua` | `Async` is named. Requires `threads.lua`. |

A resource with no classes never carries `class.lua`, and a server-only helper is
never downloaded by a client. Deployment values are not a helper: a project with
a `.env` gets a generated `env.lua` at the resource root instead.

### The promise runtime

`promise.lua` declares `Promise`, `delay` and `sleep`. An
[async function](/en/language/functions#async-functions) compiles onto it, and
these members are available to hand-written code as well:

| Member | What it does |
| --- | --- |
| `new Promise(executor)` | Creates a promise from an executor that receives `resolve` and `reject`. An error thrown inside the executor rejects the promise. |
| `Promise.resolve(...)` / `Promise.reject(...)` | A promise that is already settled. `resolve` returns a promise passed to it unchanged. |
| `Promise.all(list)` / `Promise.race(list)` | Wait for every promise, or mirror the first one to settle. |
| `Promise.settle(promise)` | Waits and reports: `true` and the values, or `false` and the reason. Valid inside an async function. |
| `promise:next(onFulfilled, onRejected)` | Runs a callback when the promise resolves, without suspending the caller. Chainable. |
| `promise:catch(onRejected)` | Runs a callback when the promise rejects. Chainable. |
| `delay(milliseconds)` | A promise that resolves after a wait, clamped to MTA's 50ms timer floor. |
| `sleep(milliseconds)` | Suspends the running coroutine. Valid inside an async function and inside a `Threads` job; anywhere else it raises. |

### A promise or a pool

Reach for a **promise** when the work *waits* — a database round trip, a remote
call, an event answered on another tick. Reach for a **pool** when the work is
*long* — a loop over ten thousand rows that must not hold a frame.

The reason is the frame budget. Slicing with `await delay(0)` costs one timer
per slice and lands on the 50ms floor, roughly 20 slices a second. A pool resumes
jobs from one shared pulse under a frame budget of 150 at `normal` and 500 at
`high` — one to two orders of magnitude more slices for the same wall clock.

Both libraries run on that one scheduler and one pulse timer, so nothing is lost
by mixing them: `await` behaves the same inside a pool job, and `pool:add(fn)`
returns the job id first and a promise that settles when the job finishes second.

```luam
local pool = new Threads('concurrent', 'normal')

async function slice(): void
    local id, done = pool:add(function ()
        for index = 1, 10000 do
            sleep(0)
        end
    end)

    await done

    outputDebugString('job ' .. tostring(id) .. ' finished')
end
```

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
`lib/`. A file the build never wrote is left in place, and `env.lua` is never
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
