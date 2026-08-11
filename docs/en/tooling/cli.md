# CLI commands

```bash
luam <command> [options]
```

Project commands read `luam.json` from the current directory, or from `--cwd`.
`setup`, `doctor` and `init` do not require an existing project.

| Command | What it does |
| --- | --- |
| [`init`](#luam-init) | Scaffolds `luam.json`. |
| [`check`](#luam-check) | Compiles and reports diagnostics. Writes nothing. |
| [`build`](#luam-build) | Compiles and writes the resource into `<outDir>/<name>`. |
| [`ensure`](#luam-ensure) | Builds, syncs into the MTA server, restarts, and watches. |
| [`dev`](#luam-dev) | The `ensure` loop plus a live server log stream. |
| [`trace`](#luam-trace) | Resolves generated Lua positions back to Luam source. |
| [`setup`](#luam-setup) | Detects editors and installs the extension, with consent. |
| [`doctor`](#luam-doctor) | Reports the CLI, Node.js, editors, and the extension. |

## `luam init`

```bash
luam init
luam init --name gamemode-race
```

Writes **one file**, `luam.json`, and stops. There is no framework, no example
tree, and nothing to delete before your first line of code.

The resource name comes from `--name`, or from the project directory when that is
a valid MTA resource name, or from `luam-resource` as a last resort. An existing
`luam.json` is kept and reported; `--force` overwrites it.

## `luam check`

```bash
luam check
```

Compiles everything and prints diagnostics. **Writes nothing.** This is the
command for CI and for a pre-commit hook.

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
```

## `luam build`

```bash
luam build
```

Compiles and writes the production bundle into `<outDir>/<name>`. The default
also writes `<outDir>/<name>.luam-map.json`; see
[Output layouts and source maps](/en/reference/output-layouts) for the exact
resource shape and overrides.

```
Discovery: done in 1 ms.
Compile: 3 files in 12 ms.
Assembly: done in 0 ms.
Manifest: done in 1 ms.
Write: 7 files in 2 ms.
Build passed: 3 files, 0 errors, 0 warnings in 16 ms.
Wrote 7 files to "build/my-resource".
```

A build that reports any error writes nothing, so a resource that worked is never
replaced with partial output.

## `luam ensure`

```bash
luam ensure
luam ensure --no-watch
```

Builds, mirrors the resource into your MTA server, restarts it, and repeats on
every save. Requires `serverPath`; the restart also requires a `transport`.
`ensure` never writes to `<outDir>/<name>` and uses the tree layout by default,
regardless of `output.bundle`. Pass `--bundle` for a bundled sync.

See [Daily development](/en/guide/daily-development) for the full loop.

## `luam dev`

```bash
luam dev
```

Runs the complete `ensure` workflow and follows
`<serverPath>/mods/deathmatch/logs/server.log` from its current end, handling
truncation and rotation.

```
[14:22:07][server][info] Resource started
[14:22:09][client][warn] Missing vehicle model
```

The development-only log helpers it adds are never written by `build` or
`ensure`, and are removed by the next normal sync. `dev` always uses the tree
layout and resolves covered generated positions through its in-memory map.

## `luam trace`

```bash
luam trace src/server.lua:42
luam trace "ERROR: [my-resource/src/server.lua:42] failure"
luam trace --map releases/my-resource.luam-map.json < mta-errors.log
```

Resolves a bare `file:line`, a quoted MTA log line, or one position per stdin
line. `--map` selects a relative or absolute map; otherwise the command tries the
configured map and then one discoverable map below the project. It prints
`source-file:line (symbol)` when a symbol is available. Exit code `1` means at
least one input did not resolve or the map could not be used; `0` means every
input resolved. See the [worked production trace](/en/reference/output-layouts#resolving-production-traces).

## `luam setup`

```bash
luam setup
luam setup --yes
```

Detects supported editor commands on `PATH`, asks for consent, and installs the
Luam extension. It tries the editor's marketplace first and falls back to the
official `.vsix` from the GitHub release matching the CLI version.

The command never installs into an editor silently. In a non-interactive
terminal, pass `--yes` explicitly.

## `luam doctor`

```bash
luam doctor
```

Reports the running CLI and Node.js versions, every supported editor detected on
`PATH`, and whether that editor has the Luam extension. Attach its output when
reporting a problem.

## Options

| Option | Meaning |
| --- | --- |
| `--cwd <path>` | Project directory holding `luam.json`. Defaults to the current directory. |
| `--config <path>` | Load this file instead of `luam.json`. |
| `--name <name>` | Resource name for `init`. |
| `--force` | Let `init` overwrite a file that exists. |
| `-y`, `--yes` | Install the extension in every detected editor without prompting. |
| `--watch` / `--no-watch` | Keep `ensure` or `dev` watching, or run once. Both watch by default. |
| `--bundle` / `--no-bundle` | Select bundle or tree output for `build` and `ensure`. `dev` always uses tree. |
| `--no-map` | Disable map generation. For `build`, also remove the existing default map after success. |
| `--map <path>` | Resource map used by `trace`. Relative paths resolve from the project directory. |
| `--offline` | Skip the `min_mta_version` lookup. `LUAM_OFFLINE` does the same. |
| `--no-color` | Plain output, no colour or emoji. `NO_COLOR` does the same. |
| `-h`, `--help` | Print the usage text. |
| `-v`, `--version` | Print the CLI version. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The command succeeded. |
| `1` | The command reported diagnostics or could not complete setup. |
| `2` | The command line or the configuration is invalid. |

## Streams and colour

Progress is painted on **stderr** and the report goes to **stdout**, so
redirecting stdout captures the report alone:

```bash
luam check > report.txt
```

Output drops every escape sequence when the stream is not a terminal, so a CI
transcript stays readable. `--no-color` or a non-empty `NO_COLOR` turns colour
and emoji off everywhere.
