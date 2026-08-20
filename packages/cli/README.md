# Luam CLI

`luam` compiles a Luam project into an MTA resource. It owns everything the
compiler leaves out: source discovery, writing the resource to disk, syncing it
into an MTA server, and restarting it.

> **User documentation:**
> [CLI commands](https://thigasdevelopment.github.io/luam/en/tooling/cli) ·
> [.luam.manifest](https://thigasdevelopment.github.io/luam/en/tooling/luam-manifest) ·
> [Configuration fields](https://thigasdevelopment.github.io/luam/en/reference/configuration-fields)
> · [em português](https://thigasdevelopment.github.io/luam/pt-br/tooling/cli).
> This file is the package-level reference for contributors.

## Commands

| Command | Behavior |
| ------- | -------- |
| `luam init` | Scaffolds a new resource project. Needs no configuration. |
| `luam check` | Compiles and reports diagnostics. Writes nothing. |
| `luam build` | Compiles and writes the resource into `<outDir>/<name>`. |
| `luam dev` | Runs the ensure loop and streams server and relayed client resource logs. |
| `luam ensure` | Builds, syncs into the MTA server, restarts, and watches sources. |
| `luam server` | Runs an existing local MTA server in the foreground. |
| `luam trace` | Resolves generated Lua positions through a resource map without compiling. |

## Options

| Option | Meaning |
| ------ | ------- |
| `--cwd <path>` | Project directory that holds `.luam.manifest`. Defaults to the current directory. |
| `--manifest <path>` | Configuration file to load instead of `.luam.manifest`. |
| `--name <name>` | Resource name for `init`. Defaults to the project directory name. |
| `--force` | Let `init` overwrite files that already exist. |
| `--watch` / `--no-watch` | Keep `ensure` or `dev` watching, or run it once. Both watch by default. |
| `--start-server` | Let `dev` start and own the local MTA server process. |
| `--bundle` / `--no-bundle` | Select bundle or tree output for `build` and `ensure`. `dev` always uses tree. |
| `--no-map` | Disable source position map generation. |
| `--map <path>` | Resource map used by `trace`. |
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

`init` writes one file, `.luam.manifest`. There is no framework, no example tree, and
nothing to delete before writing your own code. The resource name comes from
`--name`, or from the project directory when that is a valid MTA resource name,
or from `luam-resource` as a last resort.

A `.luam.manifest` that already exists is kept and reported; pass `--force` to
overwrite it.

## Exit Codes

| Code | Meaning |
| ---- | ------- |
| `0` | The command succeeded. |
| `1` | The build reported diagnostics. |
| `2` | The command line or the configuration is invalid. |

## Configuration

`.luam.manifest` sits at the project root. Only `name` is required.

It is written in Luam, restricted to `local` declarations and assignments to
configuration fields. A value is a literal, a table, or those combined with
`and`, `or`, `not`, comparison, arithmetic, and concatenation — there are no
calls and no function values, so the compiler evaluates a manifest in process and
so does the language server. `mode` (`development` for `dev` and `ensure`,
`production` for `build`, otherwise the command name), `env` (a table of
`string?`), and the absolute `root` are in scope alongside the fields, which is
how one file covers every machine:

```luam
name = 'luam-demo'
outDir = mode == 'production' and 'build' or 'build-dev'
```

```luam
name = 'luam-demo'
author = 'Thigas'
version = '1.0.0'
description = 'A demo resource'

compilerOptions = {
    strict = true,
    oop = false,
    noUnusedLocals = false,
    noUnusedParameters = false,
    warningsAsErrors = false,
}

sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}

assets = {
    { from = 'assets/**/*', to = 'assets' },
}

dependencies = { 'scoreboard' }

engine = {
    minVersion = '1.6.0',
}

environment = {
    file = '.env',
    localFile = '.env.local',
}

outDir = 'build'
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }

output = {
    bundle = true,
    map = true,
    minify = true,
}

helpers = { 'threads' }
serverPath = 'C:/MTA Server'
resourcesDir = 'mods/deathmatch/resources'

development = {
    server = {
        executable = 'MTA Server.exe',
    },
    logs = {
        enabled = false,
        maxMessageLength = 4096,
        rateLimit = 30,
        rateWindowMs = 1000,
    },
}
```

| Field | Default | Meaning |
| ----- | ------- | ------- |
| `name` | required | Resource name. Names the output folder and the resource `ensure` syncs. It never reaches `meta.xml` — MTA reads the name from the folder. |
| `author`, `version`, `description` | unset | Optional `meta.xml` info attributes. |
| `compilerOptions` | see below | How the checker reads the project: `strict`, `oop`, `noUnusedLocals`, `noUnusedParameters`, `warningsAsErrors`. |
| `sources` | `src/<side>/**/*.luam` | Patterns per side. The matched side is the file's environment unless a directive overrides it. |
| `assets` | `{ }` | `{ from, to }` mappings. Everything a mapping names is copied and declared as `<file>`; nothing else is copied. |
| `dependencies` | `{ }` | Resources written as `<include resource="..." />`. |
| `engine.minVersion` | `'latest'` | Becomes `min_mta_version`. An explicit version keeps the build network-free. |
| `environment` | `.env`, `.env.local` | Which files declare and override the keys behind `env` and `process.env`. |
| `outDir` | `'build'` | Directory that receives `<outDir>/<name>`. |
| `loadOrder` | `{ }` | Source paths pinned ahead of their group in `meta.xml`. Order is meaningful, and an entry matching no file fails the build. |
| `output.bundle` | `true` | Default `build` layout. `ensure` still defaults to tree and `dev` always uses tree. |
| `output.map` | `true` | Generates position maps. Only `build` writes a map file. |
| `output.minify` | `true` | Writes each generated script on one line during `build`. `dev` and `ensure` never minify. |
| `helpers` | `{ }` | Runtime helpers to copy even when no language feature requires them. |
| `serverPath` | unset | MTA server root. `ensure` syncs the resource there. |
| `resourcesDir` | `'mods/deathmatch/resources'` | Resource directory relative to `serverPath`. |
| `development.logs` | disabled, safe limits | Development log capture and client relay limits. `dev` enables capture even when this section is omitted. |
| `development.server.executable` | unset | Executable relative to `serverPath`; default probing uses `MTA Server.exe` on Windows and `mta-server64`, then `mta-server`, on Linux. |

`outDir`, `resourcesDir`, and every `sources`, `assets`, and `loadOrder` entry
must stay inside their base directory. An absolute path or a `..` segment is
rejected. A pattern accepts `*`, `**`, and `?` only — regex, negation, and brace
expansion are rejected.

`oop`, `sourceDirs`, `assetDirs`, and `mta` were removed. Each one reports
`config-removed-field` and names its replacement.

`loadOrder` is an ordered list of source paths relative to the project root. Each
entry is emitted ahead of its group in `meta.xml` — a script as its compiled
`.lua` path, an asset as itself — so a file that must run before the rest can say
so. Order is meaningful for assets too, since a shader can depend on another. An
entry that names a file the project does not produce is a build error that names
the entry, so a rename cannot break the order silently.

`compilerOptions.oop` is off by default. With it on, the compiler writes `<oop>true</oop>` above
`<info>` and types the object form of the MTA API, so `player:getName()` returns
`string` and a typo is a build error. With it off, the same call is
`check-oop-disabled` and the message names the procedural function to use
instead. The emitted Lua is identical either way — the compiler never rewrites
an OOP call into its procedural form.

`helpers` names runtime helpers the compiler never injects on its own. `threads`
is opt-in; `env` is injected automatically when the project has a `.env`, so
listing it is only needed to ship the library without one. Listing an automatic
helper is harmless and listing an unknown name is an error.

`helperDir` was removed. Tree output writes helpers to `lib/<environment>` and
bundle output includes them in environment bundles. A server-only helper is
never downloaded by a client. A `.luam.manifest` that still names `helperDir` fails with
`config-unknown-field`; delete the line.

## Build Output

`build` produces the bundle layout by default and writes its map beside, not
inside, the resource:

```
build/
    <name>.luam-map.json           Build-specific source position map
    <name>/
        meta.xml                   Generated manifest
        .env                       Deployment values, generated once
        config.lua                 Copied verbatim from the project root
        assets/                    Copied verbatim, declared as <file>
        src/
            shared.lua             Present only for a non-empty environment
            server.lua
            client.lua
```

The bundle manifest lists `config.lua` and then each non-empty environment:

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

Runtime helpers precede modules inside each bundle. `config.lua`, `.env`, and
assets remain unbundled. `build --no-bundle` writes the mirrored module tree and
`lib/<environment>` helpers; this is also the default for `ensure` and the fixed
layout for `dev`. See the
[output layout reference](https://thigasdevelopment.github.io/luam/en/reference/output-layouts).

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
resource directly into the MTA server and then repeats that on every save. It
never writes to `<outDir>/<name>`.

### Setting it up

```luam
name = 'gamemode-race'
serverPath = 'C:/MTA Server'
```

```
luam ensure
```

`serverPath` is required by `ensure`:

| Configured | What `ensure` does |
| --- | --- |
| No `serverPath` | Reports a diagnostic without building or watching. |
| `serverPath` | Writes the resource into the server. Restart it yourself. |

`luam dev --start-server` is the form that also restarts: it owns the MTA
process and writes `refresh`, `stop <name>`, and `start <name>` to its console.

### What happens on each save

1. Rebuild. Only files whose source changed are parsed and checked again, and
   only files whose declarations changed invalidate the files that see them.
2. If anything is an error, report it and stop. No sync, no restart, and the
   previous resource stays on the server.
3. Write `<serverPath>/<resourcesDir>/<name>`, skipping identical files and
   deleting generated files the project no longer produces.
4. Restart the resource — only under `dev --start-server`, and only if the sync
   actually changed a file.

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

## Development Logs

`luam server` starts the configured installation in the foreground and attaches
the terminal. `luam dev --start-server` waits for the server startup marker in
`server.log`, then uses the owned console to run `refresh`, `stop <resource>`, and
`start <resource>` after a changed sync. It is the only path that restarts a
resource for you. `Ctrl+C` sends the MTA `shutdown` command and uses a bounded kill fallback; the
CLI never stops a process it did not start.

`luam dev` requires `serverPath` and reuses the complete `ensure` workflow. It
also follows `<serverPath>/mods/deathmatch/logs/server.log` from its current end,
handles truncation and rotation, and stops following when the command ends.

The synchronized resource receives two development-only helpers. The client
helper preserves the original return value and console output from
`outputDebugString`, then relays valid records through an MTA event. The server
helper validates types and length, limits each client to `rateLimit` records per
`rateWindowMs`, and writes a structured marker for the CLI. These helpers are
never selectable through `helpers`, never written by `build` or `ensure`, and
are removed by the next normal sync.

```luam
name = 'gamemode-race'
serverPath = 'C:/MTA Server'

development = {
    logs = {
        maxMessageLength = 2048,
        rateLimit = 20,
        rateWindowMs = 1000,
    },
}
```

The first release reads only the local MTA server log. It does not collect
remote logs, evaluate expressions, or observe runtime values. Native lines for
other named resources are ignored. Unattributed engine lines can appear as
plain server output because their origin cannot be classified reliably.
