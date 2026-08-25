<p align="center"><img src="assets/luam-mark.svg" alt="Luam" width="110"></p>

<h1 align="center">Luam</h1>

<p align="center">Typed Lua for Multi Theft Auto. Compiles to plain Lua 5.1.</p>

<p align="center">
    <a href="https://thigasdevelopment.github.io/luam/"><b>Manual</b></a> ·
    <a href="https://thigasdevelopment.github.io/luam/en/">English</a> ·
    <a href="https://thigasdevelopment.github.io/luam/pt-br/">Português (Brasil)</a>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@thigasdevelopment/luam"><img alt="npm" src="https://img.shields.io/npm/v/@thigasdevelopment/luam?color=cb3837&label=npm"></a>
    <img alt="Target" src="https://img.shields.io/badge/target-Lua%205.1-000080">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Multi%20Theft%20Auto-3ddc97">
    <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D20-5fa04e">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

Write `.luam` files with types, classes, enums and template strings. The
compiler checks them and emits readable **Lua 5.1** plus a generated `meta.xml` —
a resource your MTA server can start as-is.

It is *typed Lua*, not TypeScript. Blocks still end with `end`, inequality is
still `~=`, and comments use `#` and `#* ... *#`.

```lua
enum Target { LUA_51, MTA }

class Luam {
    version: string
    target: Target = Target.LUA_51
    files: number = 0

    constructor = function (version: string)
        self.version = version
    end

    compile = function (source: string): string
        self.files += 1

        return `Luam ${self.version} compiled ${source} to plain Lua 5.1`
    end
}

local luam = new Luam('0.15.6')

outputServerLog(luam:compile('src/server/main.luam'))
```

Annotations are erased at build time. `dxDrawText` in a server file, a typo in an
MTA function name, a `string` where a `number` belongs — all build errors, before
the server starts. A build with any error writes nothing.

---

## Install

Needs [Node.js](https://nodejs.org/) 20+ and an [MTA:SA](https://multitheftauto.com/)
1.5+ server. No Lua toolchain.

```bash
npm install --global @thigasdevelopment/luam
luam --version
```

Then install the VS Code extension — it runs the same checker as the CLI:

```bash
luam setup      # detects your editors and asks before installing
luam doctor     # verifies CLI, editors and extension
```

> [Installation](https://thigasdevelopment.github.io/luam/en/guide/installation)
> · [Instalação](https://thigasdevelopment.github.io/luam/pt-br/guide/installation)
> — `PATH` troubleshooting, `npx`, install from source, manual `.vsix`.

---

## Quick start

**1. Scaffold.** `init` writes exactly one file, `.luam.manifest`.

```bash
mkdir my-resource && cd my-resource
luam init
```

**2. Write some Luam.** Create the source tree yourself — **the folder decides
the environment**: `src/server`, `src/client`, `src/shared`.

```
my-resource/
├── .luam.manifest
└── src/
    ├── shared/config.luam
    ├── server/main.luam
    └── client/hud.luam
```

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
`<MTA Server>/mods/deathmatch/resources/`, then `refresh` and
`start my-resource` in the server console.

**5. Iterate.** Point `.luam.manifest` at your server and let `dev` build, sync,
restart and stream logs on every save:

```luam
name = 'my-resource'
serverPath = 'C:/MTA Server'
```

```bash
luam dev
luam dev --start-server # also starts and owns the local MTA process
```

> [Quick start](https://thigasdevelopment.github.io/luam/en/guide/quick-start)
> · [Início rápido](https://thigasdevelopment.github.io/luam/pt-br/guide/quick-start)

---

## Commands

| Command | What it does |
| --- | --- |
| `luam init` | Scaffolds `.luam.manifest` and stops |
| `luam check` | Compiles and prints diagnostics. Writes nothing — this is the CI command |
| `luam build` | Writes the bundled resource into `<outDir>/<name>`, plus a source map |
| `luam dev` | Build, sync, restart and watch, while following the server log |
| `luam ensure` | Build, sync and restart on every save |
| `luam server` | Run an existing local MTA server in the foreground |
| `luam trace` | Resolves a production error position back to the authored file |
| `luam setup` | Installs the editor extension |
| `luam doctor` | Reports CLI, Node.js, detected editors and extension status |

Exit codes: `0` success, `1` build errors, `2` invalid command line or
configuration. Progress goes to stderr and the report to stdout.

> [CLI commands](https://thigasdevelopment.github.io/luam/en/tooling/cli)
> · [Comandos da CLI](https://thigasdevelopment.github.io/luam/pt-br/tooling/cli)
> — every option and exit-code details.

---

## The language

| Feature | Notes |
| --- | --- |
| Type annotations | Optionals, unions, arrays, aliases, generics, `fun(string): void` — all erased |
| Classes | `extends`, `implements`, `constructor`, `super(...)`, `new` |
| Decorators | `@Getter` and `@Setter` generate typed accessors |
| Interfaces | Verified by the checker, never reach the generated Lua |
| Enums | Zero-based, checked members, erased when unused |
| Template strings | `` `Hi ${name:Guest}` `` — scope-checked, with defaults |
| Operators | `+=`, `-=`, `*=`, `/=`, `..=`, and `score++` / `score--` as statements |
| Comments | `# line` and `#* block *#`; length without a space is `#items` |
| Object extensions | `items.count`, `name.trim`, `ratio.clamp(a, b)` |
| Multi-return | `local x, y, z = getElementPosition(el)` — typed from the MTA catalog |
| `export` | Erased from the Lua, written into `meta.xml` |
| Native libraries | `sleep` plus `Threads`, `Async` and `Dotenv`, injected only when named |
| MTA OOP classes | `Player.getRandom()`, `File.exists(path)`, callable constructors |
| Deployment values | `.env` keys typed as `env.SERVER_NAME`, server-only |
| Strictness | `#!strict` (default), `#!nonstrict`, `#!nocheck` per file |

`class`, `constructor`, `declare`, `enum`, `export`, `extends`, `implements`,
`interface`, `new` and `type` are **reserved** on top of the Lua 5.1 keywords.
Property names still work (`config.type`), and `type(value)` keeps working.
Porting existing Lua? Rename to `.luam`, add `#!nocheck`, and annotate module by
module.

### Environments

Every file is `server`, `client` or `shared` — from its folder, or from a `#!`
directive. That decides which MTA APIs resolve: `dxDrawText` in a client file is
fine, `outputChatBox` in the same file is a build error.

`server` and `client` may use `shared` declarations; `shared` may use only
`shared`; `server` and `client` never see each other. A name the catalog does
not know stays `any`, so a missing API never blocks a build.

> [The language](https://thigasdevelopment.github.io/luam/en/language/)
> · [A linguagem](https://thigasdevelopment.github.io/luam/pt-br/language/)
> — every feature, with the emitted Lua and the errors it catches.

---

## Output

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

`build` ships at most one bundle per non-empty environment; `config.lua`, `.env`
and assets stay at their own paths, and the map stays outside the resource.
`ensure` defaults to a mirrored tree and `dev` always uses one.

> [Output layouts and source maps](https://thigasdevelopment.github.io/luam/en/reference/output-layouts)

---

## Configuration

`.luam.manifest` — only `name` is required.

```luam
name = 'my-resource'
serverPath = 'C:/MTA Server'
```

Optional fields cover `meta.xml` info, `compiler`, `sources`, `assets`,
`dependencies`, `engine.minVersion`, `environment`, `outDir`, `loadOrder`,
`output`, `helpers`, `resourcesDir`, `development.logs` and
`development.server.executable`.

> [.luam.manifest](https://thigasdevelopment.github.io/luam/en/tooling/luam-manifest)
> and [Configuration fields](https://thigasdevelopment.github.io/luam/en/reference/configuration-fields)
> · [.luam.manifest](https://thigasdevelopment.github.io/luam/pt-br/tooling/luam-manifest)

---

## Editor support

The **Luam** VS Code extension runs a language server built on the same frontend
as the CLI, so the editor and the build never disagree: syntax highlighting,
diagnostics on every keystroke, scoped completion, hover types, go to
definition, find references and rename.

Supported and auto-installed by `luam setup`: VS Code, VS Code Insiders, Cursor,
VSCodium and Windsurf. The language server itself is editor-agnostic and speaks
`--stdio` to any LSP client.

> [Editors](https://thigasdevelopment.github.io/luam/en/tooling/editors)
> · [Editores](https://thigasdevelopment.github.io/luam/pt-br/tooling/editors)
> — compatibility matrix, manual `.vsix` install, commands and settings.

---

## Known limitations

- **Narrowing reaches names, not fields.** `if value ~= nil then` refines a local;
  `self.value` keeps its declared type however you test it.
- **A class is a type everywhere, a value from its declaration** — `extends` may
  name a parent written further down, a top-level `new` may not.
- **The MTA catalog can lag a release** — a newer function stays `any`.
- **No static members, declared metamethods, or generic classes.**
- **The editor re-checks by declaration** — a declaration change re-analyzes every
  file that can see it, an edit inside a function body only its own file.
- **An export is named, never verified** against the side that calls it.
- **Type annotations are erased**, so validate anything a client can send.

> [Limitations](https://thigasdevelopment.github.io/luam/en/reference/limitations)
> · [Limitações](https://thigasdevelopment.github.io/luam/pt-br/reference/limitations)
> — each one labelled planned, design boundary, upstream or platform constraint,
> with the workaround. The decisions behind the boundaries are recorded in
> [`docs/adr`](docs/adr).

---

## Contributing

The repo is a pnpm workspace: `compiler`, `cli`, `lsp`, `vscode`, `runtime`,
`mta-types` and `template`.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Branch from `develop`, add a fixture and a snapshot for new language behaviour,
and run `pnpm typecheck && pnpm test` before opening a pull request. House style:
TypeScript only, strict, no `any`, no comments inside code, 4-space indentation,
single quotes, kebab-case file names, path aliases instead of `../` imports, no
barrel files, everything in English.

The manual lives in [`docs/`](docs/) — `pnpm docs:dev` to preview,
`pnpm docs:verify` before pushing. English is the source locale and pt-BR is
translated from it; CI fails when a page is missing from one.

Per-package docs: [`cli`](packages/cli/README.md), [`lsp`](packages/lsp/README.md),
[`mta-types`](packages/mta-types/README.md), [`vscode`](packages/vscode/README.md),
[`template`](packages/template/README.md). Releases are in the
[changelog](CHANGELOG.md).

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
