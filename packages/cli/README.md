# Luam CLI

`luam` compiles a Luam project into an MTA resource. It owns everything the
compiler leaves out: source discovery, writing the resource to disk, syncing it
into an MTA server, and restarting it.

## Commands

| Command | Behavior |
| ------- | -------- |
| `luam init` | Scaffolds a new resource project. Needs no configuration. |
| `luam check` | Compiles and reports diagnostics. Writes nothing. |
| `luam build` | Compiles and writes the resource into `<outDir>/<name>`. |
| `luam ensure` | Builds, syncs into the MTA server, restarts, and watches sources. |

## Options

| Option | Meaning |
| ------ | ------- |
| `--cwd <path>` | Project directory that holds `luam.json`. Defaults to the current directory. |
| `--config <path>` | Configuration file to load instead of `luam.json`. |
| `--name <name>` | Resource name for `init`. Defaults to the project directory name. |
| `--force` | Let `init` overwrite files that already exist. |
| `--watch` / `--no-watch` | Keep `ensure` watching, or run it once. `ensure` watches by default. |
| `--no-color` | Print plain output with no colour and no emoji. |
| `-h`, `--help` | Print the usage text. |
| `-v`, `--version` | Print the CLI version. |

## Scaffolding

```
mkdir gamemode-race
cd gamemode-race
luam init
luam build
```

`init` writes one file, `luam.json`. There is no framework, no example tree, and
nothing to delete before writing your own code. The resource name comes from
`--name`, or from the project directory when that is a valid MTA resource name,
or from `luam-resource` as a last resort.

A `luam.json` that already exists is kept and reported; pass `--force` to
overwrite it.

## Exit Codes

| Code | Meaning |
| ---- | ------- |
| `0` | The command succeeded. |
| `1` | The build reported diagnostics. |
| `2` | The command line or the configuration is invalid. |

## Configuration

`luam.json` sits at the project root. Only `name` is required.

```json
{
    "name": "luam-demo",
    "author": "Thigas",
    "version": "1.0.0",
    "description": "A demo resource",
    "sourceDirs": ["src"],
    "assetDirs": ["assets"],
    "outDir": "build",
    "loadOrder": ["src/server/index.luam", "assets/shaders/base.fx"],
    "oop": false,
    "helpers": ["threads"],
    "serverPath": "C:/MTA Server",
    "resourcesDir": "mods/deathmatch/resources",
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD"
    }
}
```

| Field | Default | Meaning |
| ----- | ------- | ------- |
| `name` | required | Resource name. Names the output folder and the resource `ensure` restarts. It never reaches `meta.xml` — MTA reads the name from the folder. |
| `author`, `version`, `description` | unset | Optional `meta.xml` info attributes. |
| `sourceDirs` | `["src"]` | Directories scanned for `.luam` and `.d.luam` files. Non-source files here are copied but not declared. |
| `assetDirs` | `["assets"]` | Directories copied verbatim and declared as `<file>` entries, so clients download them. |
| `outDir` | `"build"` | Directory that receives `<outDir>/<name>`. |
| `loadOrder` | `[]` | Source paths pinned ahead of their group in `meta.xml`. Order is meaningful, and an entry matching no file fails the build. |
| `oop` | `false` | Enables the MTA OOP API. Writes `<oop>true</oop>` and lets the checker resolve `player:getName()`. |
| `helpers` | `[]` | Runtime helpers to copy even when no language feature requires them. |
| `serverPath` | unset | MTA server root. `ensure` syncs the resource there. |
| `resourcesDir` | `"mods/deathmatch/resources"` | Resource directory relative to `serverPath`. |
| `transport` | `{ "kind": "none" }` | How `ensure` restarts the resource. |

`outDir`, `resourcesDir`, and every `sourceDirs`, `assetDirs`, and `loadOrder`
entry must stay inside their base directory. An absolute path or a `..` segment
is rejected.

`loadOrder` is an ordered list of source paths relative to the project root. Each
entry is emitted ahead of its group in `meta.xml` — a script as its compiled
`.lua` path, an asset as itself — so a file that must run before the rest can say
so. Order is meaningful for assets too, since a shader can depend on another. An
entry that names a file the project does not produce is a build error that names
the entry, so a rename cannot break the order silently.

`oop` is off by default. With it on, the compiler writes `<oop>true</oop>` above
`<info>` and types the object form of the MTA API, so `player:getName()` returns
`string` and a typo is a build error. With it off, the same call is
`check-oop-disabled` and the message names the procedural function to use
instead. The emitted Lua is identical either way — the compiler never rewrites
an OOP call into its procedural form.

`helpers` names runtime helpers the compiler never injects on its own. `threads`
is opt-in; `env` is injected automatically when the project has a `.env`, so
listing it is only needed to ship the library without one. Listing an automatic
helper is harmless and listing an unknown name is an error.

`helperDir` was removed. Helpers are written to `lib/<environment>`, outside the
source tree, so a server-only helper is never downloaded by a client and no file
is declared twice. A `luam.json` that still names `helperDir` fails with
`config-unknown-field`; delete the line.

## Transport

`ensure` restarts the resource through a transport. `none` skips the restart and
only syncs files. `http` calls the MTA HTTP interface:

```
POST http://<host>:<port>/<resource>/call/<function>
```

The call carries HTTP basic authentication and a JSON array of arguments.
`refreshFunction` (default `refreshResources`) is called first, then
`restartFunction` (default `restartResource`) with the resource name. Both must
be exported by the `resource` named in the configuration.

Prefer `passwordEnv`, which names an environment variable, over `password`. A
plaintext `password` is accepted but reports a warning, and no diagnostic or log
line ever prints the password.

`resource`, `refreshFunction`, `restartFunction`, and `host` become part of that
URL, so they are validated before any request is sent. A value containing `/`,
`?`, `#`, or `..` is `config-invalid-url-segment` and the configuration fails to
load.

MTA's HTTP interface offers no TLS, so basic authentication travels in the
clear. A `host` that is not a loopback address reports
`config-remote-plaintext-transport`, a warning. Tunnel the port over SSH and
point `host` at `127.0.0.1` instead of exposing the interface.

## Build Output

The generated resource mirrors the tree you authored. `src/server/main.luam`
becomes `src/server/main.lua`, so a path in an MTA error maps to a source file by
changing one extension:

```
build/<name>/
    meta.xml                       Generated manifest
    .env                           Deployment values, generated once
    config.lua                     Copied verbatim from the project root
    lib/
        shared/class.lua           Runtime helpers, outside the source tree
        server/env.lua             Server-only helper, never downloaded by a client
    assets/                        Copied verbatim, declared as <file>
    src/
        shared/config.lua
        server/main.lua
        client/hud.lua
```

`meta.xml` lists helpers first, then `config.lua`, then your `loadOrder` entries,
then one wildcard per environment in shared, server, client order:

```xml
<script src="lib/shared/class.lua" type="shared" cache="false" />
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

Adding a module to an environment that already has one leaves `meta.xml`
unchanged. A server entry carries neither `type` nor `cache`, because both equal
the MTA default; every client and shared entry carries `cache="false"`.

`min_mta_version` is resolved from the latest published MTA release and cached in
`.luam/mta-version.json`. When the network is unavailable the build uses the
cached value; with no cache it warns, leaves the element out, and still produces
a complete resource. `--offline` skips the lookup, as does setting
`LUAM_OFFLINE`.

Files whose content did not change are left alone, so `ensure` syncs only what
actually changed. Assets are compared byte for byte, so a binary file is not
rewritten.

Pruning removes what the build no longer produces: `.lua` files, `meta.xml`, and
anything under a configured source directory, a configured asset directory, or
`lib/`. It no longer reads the previous `meta.xml`, since an entry there is now a
pattern rather than a path. A file the build never wrote is left in place, and
`.env` is never touched.

A build that reports any error writes nothing, so a previously working resource
is never replaced with partial output.

## Resource Settings

A resource carries two settings files, and they have different owners.

`config.lua` at the project root belongs to the resource author. It is plain Lua
5.1, copied verbatim, never parsed by the compiler, and listed in `meta.xml` as a
shared script — which means clients download it. Anything a player may see
belongs here.

`.env` at the project root belongs to the deployment. It declares the keys and
safe defaults, and it is the source of truth for their types:

```env
# Server
SERVER_NAME="Luam Server"
MAX_PLAYERS=32
DEBUG=false
```

An unquoted number is a `number`, `true` and `false` are `boolean`, and quoting
forces a `string`.

| File | Versioned | Owner | Role |
| ---- | --------- | ----- | ---- |
| `.env` | yes | resource author | Declares the keys, the defaults, and the types. |
| `.env.local` | no | developer | Overrides values on one machine. Types still come from `.env`. |
| `<outDir>/<name>/.env` | no | server administrator | The deployed values. |

The naming is inverted from the Vite and Next convention: here `.env` is
committed and `.env.local` is ignored.

The first build writes `<outDir>/<name>/.env` from the declared keys, blanking
any key whose name looks sensitive — `password`, `secret`, `token`, `key`,
`credential`, `dsn`, or `private`. It is never overwritten afterwards, so an
administrator's edits survive every rebuild. Delete it to regenerate the
skeleton.

Values reach Luam through `process.env`, which the `env` runtime helper builds on
the server:

```lua
outputServerLog(tostring(process.env.SERVER_NAME))
```

`process` is declared `server`, so using it from a client or shared file is
`check-environment-api`. A key `.env` does not declare is
`check-unknown-record-key`, and the message lists the declared keys. `.env` never
receives a `<file>` entry, so it is never transmitted to a player.

## Declaration Files

A `.d.luam` file describes types for Lua the compiler does not own — `config.lua`,
a vendored library, a snippet copied from another resource. It is type checked,
contributes nothing to the generated resource, and takes its environment from its
path like any other source file.

```lua
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
```

`declare` binds a global to a type and is valid only inside a `.d.luam` file. A
declaration file holds declarations only; a call, an assignment, or a loop is
`check-declaration-file-statement`. Where a declaration and real source name the
same global, the declaration wins and the source is checked against it.

## The `ensure` Development Loop

`ensure` is the loop you leave running while you work. One command builds the
resource directly into the MTA server, restarts it, and then repeats that on
every save. It never writes to `<outDir>/<name>`.

### Setting it up

```json
{
    "name": "gamemode-race",
    "serverPath": "C:/MTA Server",
    "transport": {
        "kind": "http",
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD"
    }
}
```

```
set LUAM_MTA_PASSWORD=...
luam ensure
```

`serverPath` is required by `ensure`. The transport remains optional:

| Configured | What `ensure` does |
| --- | --- |
| No `serverPath` | Reports a diagnostic without building or watching. |
| `serverPath` only | Writes the resource into the server. Restart it yourself. |
| `serverPath` and transport | Also calls `refreshResources` and `restartResource` over the transport. |

The MTA side needs a resource — `luam-sync` above — that exports the two
functions and grants HTTP access to the configured user. Any resource works as
long as `resource`, `username`, and the password match the server's ACL.

### What happens on each save

1. Rebuild. Only files whose source changed are parsed and checked again, and
   only files whose declarations changed invalidate the files that see them.
2. If anything is an error, report it and stop. No sync, no restart, and the
   previous resource stays on the server.
3. Write `<serverPath>/<resourcesDir>/<name>`, skipping identical files and
   deleting generated files the project no longer produces.
4. Restart the resource, but only if the sync actually changed a file.

`ensure` never creates, updates, prunes, or deletes `<outDir>/<name>`. Use
`luam build` when you need a local generated resource.

### Reading the output

Each run is separated by a timestamped rule, and every phase reports what it did
and what it cost:

```
---------------------------------------- rebuild at 14:22:07
Discovery: done in 1 ms.
Compile: 42 files in 2 ms.
Assembly: done in 0 ms.
Manifest: done in 0 ms.
Build passed: 42 files, 41 reused, 0 errors, 0 warnings in 3 ms.
Sync: 18 files in 1 ms.
Synced 1 file to "C:/MTA Server/mods/deathmatch/resources/gamemode-race" (0 removed).
Restart: done in 24 ms.
Restarted "gamemode-race" through the "http" transport.
```

`reused` is the incremental cache at work: 41 of 42 files came back from cache
and only the file you saved was recompiled. It only appears once a rebuild has
something to reuse, so the first build never shows it.

If a rebuild reports errors instead:

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
Skipping sync and restart because the build reported errors.
```

The resource on the server is untouched, so the running game keeps the last
version that compiled.

### Colour, progress, and plain output

On a terminal the CLI paints a live line for the phase it is running, groups
diagnostics under their file with the offending source line and a caret, and
closes with a per-phase timing breakdown. A run that finishes in under roughly
150 ms — every warm rebuild — prints its finished report with no intermediate
frame, so nothing flickers.

Progress is painted on stderr and the report is printed on stdout, so
redirecting stdout captures the report alone.

Output falls back to the plain form above when the stream is not a terminal, so
a CI transcript and a redirected log carry no escape sequence and no carriage
return. Setting `NO_COLOR` to any non-empty value or passing `--no-color` turns
colour and emoji off as well; on a terminal the run still advances, in ASCII.

### Stopping

`Ctrl+C` ends the watch. Pass `--no-watch` to run the build, sync, and restart
exactly once, which is what you want from a script or an editor task.
