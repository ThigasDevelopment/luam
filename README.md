<p align="center"><img src="assets/luam-mark.svg" alt="Luam" width="110"></p>

<h1 align="center">Luam</h1>

<p align="center">Typed Lua for Multi Theft Auto. Compiles to plain Lua 5.1.</p>

<p align="center">
    <a href="https://www.npmjs.com/package/luam"><img alt="npm" src="https://img.shields.io/npm/v/luam?color=cb3837&label=npm"></a>
    <img alt="Target" src="https://img.shields.io/badge/target-Lua%205.1-000080">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Multi%20Theft%20Auto-3ddc97">
    <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D20-5fa04e">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

**Luam** is a typed language for [Multi Theft Auto](https://multitheftauto.com/).
You write `.luam` files with type annotations, classes, enums and template
strings. The compiler checks them and emits readable **Lua 5.1** plus a generated
`meta.xml` — a resource your server can start as-is.

It is *typed Lua*, not TypeScript. Blocks still end with `end`, inequality is
still `~=`, comments are still `--`. Types are an addition, not a new syntax.

```lua
local health: number = 100

function heal(player: Player, amount: number): void
    health += amount

    outputChatBox(`${getPlayerName(player)} healed to ${health}`, player)
end
```

Annotations are erased at build time. `dxDrawText` in a server file, a typo in an
MTA function name, a `string` passed where a `number` belongs — all build errors,
before the server ever starts. A build with any error writes nothing.

---

## Install

You need [Node.js](https://nodejs.org/) 20 or newer and an
[MTA:SA](https://multitheftauto.com/) 1.5+ server. No Lua toolchain — the
compiler emits Lua text, it never runs it.

```bash
node --version   # must print v20.x or newer
```

### 1. Install the CLI

```bash
npm install --global luam
```

That gives you one command, `luam`. Check it:

```bash
luam --version
```

| Task | Command |
| --- | --- |
| Install | `npm install --global luam` |
| Update to the latest | `npm update --global luam` |
| Install a specific version | `npm install --global luam@0.1.0` |
| Uninstall | `npm uninstall --global luam` |
| Run once, without installing | `npx luam <command>` |

`npx luam build` works anywhere and caches the download, which is handy in CI or
on a machine you would rather not install into.

<details>
<summary><b><code>luam: command not found</code> after installing</b></summary>

npm put the binary in its global bin directory and that directory is not on your
`PATH`. Find it:

```bash
npm config get prefix
```

- **Windows** — add that folder itself to your user `PATH`
  (*Settings → System → About → Advanced system settings → Environment
  Variables*), then open a **new** terminal.
- **macOS / Linux** — add `<prefix>/bin` to your `PATH` in `~/.zshrc` or
  `~/.bashrc`, then run `source ~/.zshrc`.

Nothing to configure if you would rather not: `npx luam <command>` needs no
`PATH` entry at all.

</details>

<details>
<summary><b>Install from source instead</b></summary>

For contributing, or to run a change that is not released yet. Needs
[pnpm](https://pnpm.io/) 9+.

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm install:cli
```

`install:cli` bundles the compiler into one self-contained file, writes a
publishable manifest next to it, and runs `npm install --global` on the result.
It finishes by running `luam --version` and telling you what to fix if the npm
bin directory is not on your `PATH`.

</details>

### 2. Install the editor extension

The VS Code extension gives you types, completion and errors while you type —
from the same checker the CLI runs, so the editor and the build never disagree.
See [Editor support](#editor-support) below for how to install it.

---

## Quick start

**1. Scaffold.** `init` writes exactly one file, `luam.json`. No framework, no
example tree, nothing to delete.

```bash
mkdir my-resource && cd my-resource
luam init
```

**2. Write some Luam.** Create the source tree yourself — **the folder decides
the environment**: `src/server` is server-side, `src/client` is client-side,
`src/shared` is both.

```
my-resource/
├── luam.json
└── src/
    ├── shared/config.luam
    ├── server/main.luam
    └── client/hud.luam
```

```lua
-- src/shared/config.luam
function formatPlayerName(name: string): string
    return 'Player: ' .. name
end
```

```lua
-- src/server/main.luam
addEventHandler('onPlayerJoin', root, function()
    outputChatBox(formatPlayerName(getPlayerName(source)), root)
end)
```

```lua
-- src/client/hud.luam
local caption: string = `HUD ${RESOURCE_NAME:demo}`

addEventHandler('onClientRender', root, function()
    dxDrawText(caption, 10, 10)
end)
```

The compiler already knows `formatPlayerName` is shared, so the server file may
call it — and that `dxDrawText` from `main.luam` would be an error.

**3. Build.**

```bash
luam check   # diagnostics only, writes nothing
luam build   # writes build/my-resource
```

An error names the file, the line and the rule:

```
src/client/hud.luam:4:5 error check-environment-api: API "outputChatBox" is server-only and is not available in a "client" file.
```

**4. Run it.** Copy `build/my-resource` into
`<MTA Server>/mods/deathmatch/resources/`, then in the server console:

```
refresh
start my-resource
```

**5. Iterate.** Point `luam.json` at your server and let `ensure` build, sync and
restart on every save:

```json
{ "name": "my-resource", "serverPath": "C:/MTA Server" }
```

```bash
luam ensure
```

---

## The CLI

Four commands. Every one of them reads `luam.json` from the current directory,
or from `--cwd`.

### `luam init`

Scaffolds `luam.json` and stops. The resource name comes from `--name`, or from
the directory you are in.

```bash
luam init --name gamemode-race
```

An existing `luam.json` is kept and reported — pass `--force` to overwrite it.

### `luam check`

Compiles everything and prints diagnostics. **Writes nothing.** This is the
command to put in CI and in a pre-commit hook.

```bash
luam check
```

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
```

### `luam build`

Compiles and writes the resource into `<outDir>/<name>`.

```bash
luam build
```

```
Discovery: done in 1 ms.
Compile: 3 files in 12 ms.
Assembly: done in 0 ms.
Manifest: done in 1 ms.
Write: 7 files in 2 ms.
Build passed: 3 files, 0 errors, 0 warnings in 16 ms.
Wrote 7 files to "build/my-resource".
```

A build that reports any error writes nothing, so a resource that worked is
never replaced with partial output.

### `luam ensure`

The loop you leave running while you work. It builds, mirrors the resource into
your MTA server, restarts it, and repeats all of that on every save.

```bash
luam ensure
```

How much it does depends on what `luam.json` gives it:

| Configured | What `ensure` does |
| --- | --- |
| nothing | Builds into `<outDir>/<name>` and watches |
| `serverPath` | Also mirrors the resource into the server. You restart it |
| `serverPath` + `transport` | Also refreshes and restarts the resource for you |

To get the restart, add an `http` transport pointing at a resource on your server
that exports `refreshResources` and `restartResource`:

```json
{
    "name": "my-resource",
    "serverPath": "C:/MTA Server",
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

```bash
set LUAM_MTA_PASSWORD=...       # Windows
export LUAM_MTA_PASSWORD=...    # macOS / Linux
luam ensure
```

Use `passwordEnv`, which names an environment variable, rather than an inline
`password` — no log line or diagnostic ever prints the value. MTA's HTTP
interface has no TLS, so keep `host` on `127.0.0.1` and tunnel over SSH instead
of exposing the port.

Each save rebuilds only the files whose source changed and writes only the files
whose content changed. If the build reports an error, nothing is synced and the
running server keeps the last version that compiled. `Ctrl+C` ends the watch;
`--no-watch` runs the whole cycle exactly once, which is what an editor task or
a deploy script wants.

### Options and exit codes

| Option | Meaning |
| --- | --- |
| `--cwd <path>` | Project directory holding `luam.json`. Defaults to the current directory |
| `--config <path>` | Load this file instead of `luam.json` |
| `--name <name>` | Resource name for `init` |
| `--force` | Let `init` overwrite a file that exists |
| `--watch` / `--no-watch` | Keep `ensure` watching, or run it once. It watches by default |
| `--offline` | Skip the `min_mta_version` lookup. `LUAM_OFFLINE` does the same |
| `--no-color` | Plain output, no colour or emoji. `NO_COLOR` does the same |
| `-h`, `--help` | Print the usage text |
| `-v`, `--version` | Print the CLI version |

| Exit code | Meaning |
| --- | --- |
| `0` | The command succeeded |
| `1` | The build reported errors |
| `2` | The command line or the configuration is invalid |

Progress is painted on stderr and the report goes to stdout, so redirecting
stdout captures the report alone. Output drops all escape sequences when the
stream is not a terminal — a CI log stays readable.

### `luam.json`

Only `name` is required.

| Field | Default | Meaning |
| --- | --- | --- |
| `name` | required | Names the output folder and the resource `ensure` restarts. MTA reads the resource name from the folder, so it never reaches `meta.xml` |
| `author`, `version`, `description` | unset | `meta.xml` info attributes |
| `sourceDirs` | `["src"]` | Scanned for `.luam` and `.d.luam` files |
| `assetDirs` | `["assets"]` | Copied verbatim and declared `<file>`, so clients download them |
| `outDir` | `"build"` | Receives `<outDir>/<name>` |
| `loadOrder` | `[]` | Source paths pinned ahead of their group in `meta.xml`. An entry matching no file fails the build |
| `oop` | `false` | Enables the MTA OOP API (`player:getName()`) and writes `<oop>true</oop>` |
| `helpers` | `[]` | Runtime helpers to copy even when no feature requires them |
| `serverPath` | unset | MTA server root, for `ensure` |
| `resourcesDir` | `"mods/deathmatch/resources"` | Resource directory relative to `serverPath` |
| `transport` | `{ "kind": "none" }` | How `ensure` restarts the resource |

Paths must stay inside their base directory — an absolute path or a `..` segment
is rejected.

Every field, the transport in detail, `.env` handling and declaration files:
**[`packages/cli/README.md`](packages/cli/README.md)**.

---

## The language

```lua
local name: string = 'Thigas'
local player: Player? = nil          -- optional
local id: string | number = 1        -- union
local names: string[] = {}           -- array

type PlayerId = number               -- alias

enum GameState { LOBBY, PLAYING }    -- GameState.LOBBY is 0

interface Command {                  -- compile-only, never emitted
    name: string
    execute(player: Player): void
}

class VIPPlayer extends Player implements Command {
    level: number = 1

    constructor(name: string, level: number) {
        self:super(name)
        self.level = level
    }
}

local vip = new VIPPlayer('Thigas', 2)
```

| Feature | Notes |
| --- | --- |
| Type annotations | Optionals, unions, arrays, aliases, generics, function types — all erased |
| Classes | `extends`, `implements`, `constructor`, `self:super(...)`, `new`, checked statically |
| Interfaces | Verified by the checker, never reach the generated Lua |
| Enums | Zero-based, checked members, erased when unused |
| Template strings | `` `Hi ${name:Guest}` `` — scope-checked, with defaults |
| Compound assignment | `+=`, `-=`, `..=` |
| Object extensions | `items.count` → `table.size(items)`, `name.trim`, `ratio.clamp(a, b)` |
| Multi-return | `local x, y, z = getElementPosition(el)` — typed from the MTA catalog |
| `export` | Erased from the Lua, written into `meta.xml` as `<export function="f" />` |
| Native libraries | `sleep`, `Threads`, `Async` ship with the language, injected only when named |
| Strictness | `--!strict` (default), `--!nonstrict`, `--!nocheck` per file |

`class`, `interface`, `enum`, `new` and `export` are contextual keywords —
existing Lua that uses them as identifiers keeps compiling. Reach for
`--!nocheck` when porting existing Lua: rename to `.luam` and the build passes
while you annotate module by module.

### Environments

Every file is `server`, `client` or `shared` — from its folder, or from a `--!`
directive. That decides which MTA APIs resolve.

```lua
--!client

dxDrawText('hud', 10, 10)   -- ok
outputChatBox('hi', player) -- error: server API in a client file
```

`server` and `client` files may use `shared` declarations; `shared` may use only
`shared`; `server` and `client` never see each other. Events are scoped the same
way. A name the catalog does not know stays `any`, so a missing API never blocks
a build.

The catalog ships **1294 MTA declarations**, **203 events**, **57 element types**
and the Lua standard library, generated from the MTA wiki — plus the OOP surface
(**57 classes, 652 methods**) behind `"oop": true`.

---

## What you get out

```
build/my-resource/
├── meta.xml          generated: scripts typed by environment, helpers first
├── config.lua        copied verbatim, yours to edit
├── .env              written once, never overwritten
├── lib/shared/class.lua
└── src/
    ├── shared/config.lua
    ├── server/main.lua
    └── client/hud.lua
```

The output mirrors the tree you authored, changing only the extension, so a path
in an MTA error maps straight back to a source file. Runtime helpers land in
`lib/<environment>` and are copied **only when the generated code uses the
feature** — a resource with no classes never carries `class.lua`.

`meta.xml` uses one wildcard per environment, so adding a module leaves it byte
identical. `min_mta_version` is resolved from the latest MTA release and cached;
with no network and no cache it is omitted with a warning, and the build still
succeeds.

---

## Editor support

The **Luam** extension for VS Code starts a language server built on the same
frontend the CLI uses, so the editor and the build never disagree about a file.

| You get | Details |
| --- | --- |
| Syntax highlighting | `.luam` files, including type annotations and template strings |
| Diagnostics | On open and on every keystroke, cleared when you fix the file |
| Completion | Scope symbols, workspace globals, MTA APIs scoped to the file's environment, keywords |
| Member completion | `.` and `:` complete class fields and methods (inherited too), enum members, and native extensions |
| Hover | Declared or inferred type, function signature, and the environment of an MTA API |
| Navigation | Go to definition, find references, rename — across files for globals |

Completion is scoped exactly like the checker: `dxDrawText` never appears in a
server file, `kickPlayer` never appears in a client file.

### Installing it

The extension is not on the Marketplace yet, so install the `.vsix` by hand.

**From a release (easiest).** Download `luam-<version>.vsix` from the
[Releases page](https://github.com/ThigasDevelopment/luam/releases), then:

```bash
code --install-extension luam-0.1.0.vsix
```

Or in VS Code: **Extensions** → **⋯** menu → **Install from VSIX…** → pick the
file. Reload the window when it asks.

**From source.** Build the VSIX yourself:

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm --filter luam bundle
npx --yes @vscode/vsce package --no-dependencies --skip-license --out luam.vsix
code --install-extension luam.vsix
```

**To hack on the extension**, skip packaging and launch a development host
instead — it reloads on rebuild:

```bash
pnpm --filter luam bundle
code --extensionDevelopmentPath=packages/vscode
```

The extension activates when the workspace holds a `luam.json` or any `.luam`
file, so open your resource folder as the workspace root.

### Commands and settings

| Command | Shortcut | What it does |
| --- | --- | --- |
| **Luam: Ensure Resource** | `Ctrl+Alt+E` (`Cmd+Alt+E`) | Runs `luam ensure` in a terminal for the current project |
| **Luam: Restart Language Server** | — | Restarts the server when it gets confused |

| Setting | Default | Meaning |
| --- | --- | --- |
| `luam.cliPath` | `"luam"` | Command used to run the CLI. Point it at a bundle to test an unreleased build |
| `luam.ensureWatch` | `true` | Pass `--watch` when the ensure command runs |
| `luam.trace.server` | `"off"` | Trace the LSP traffic. Set to `"verbose"` when reporting a bug |

### Other editors

The language server is editor-agnostic. Bundle it and launch it with `--stdio`
from any LSP client:

```bash
pnpm --filter @luam/lsp bundle   # emits packages/lsp/dist/luam-lsp.mjs
node packages/lsp/dist/luam-lsp.mjs --stdio
```

---

## Known limitations

- **No type narrowing.** `if value ~= nil then` does not refine `string?`.
- **Declaration order matters for classes within a file.** `extends` and `new`
  resolve against classes declared earlier in the same file.
- **The MTA catalog can lag a release.** It comes from a pinned snapshot; a newer
  function stays `any` rather than erroring.
- **No static members, declared metamethods, or generic classes.**
- **The editor does not re-check an open file when another one changes.**
  Cross-module violations surface in `luam check`.
- **An export is named, never verified**, and cannot carry an attribute such as
  `http="true"`.

---

## Contributing

The repo is a pnpm workspace: `compiler`, `cli`, `lsp`, `vscode`, `runtime`,
`mta-types` and `template`.

```bash
pnpm install
pnpm typecheck    # strict TypeScript across every package
pnpm test         # 769 tests
pnpm build
```

Branch from `develop`, add a fixture and a snapshot for new language behaviour,
and run `pnpm typecheck && pnpm test` before opening a pull request. The house
style is TypeScript only, strict, no `any`, no comments inside code, 4-space
indentation, single quotes, kebab-case file names, path aliases instead of `../`
imports, no barrel files, and everything written in English.

Each package documents itself: [`cli`](packages/cli/README.md),
[`lsp`](packages/lsp/README.md), [`mta-types`](packages/mta-types/README.md),
[`vscode`](packages/vscode/README.md) and
[`template`](packages/template/README.md). Released milestones and their changes
are in the [changelog](CHANGELOG.md).

---

## Acknowledgments

[Multi Theft Auto](https://multitheftauto.com/) — the execution platform.
[Luau](https://luau-lang.org/) — the annotation syntax that keeps Lua looking
like Lua. **lua-class** and **mta-threads** — the runtimes behind `class.lua` and
`threads.lua`.

## License

[MIT](LICENSE) © Thigas

---

<p align="center"><sub>Write typed Lua. Ship plain Lua 5.1.</sub></p>
