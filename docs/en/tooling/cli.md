# CLI commands

```bash
luam <command> [options]
```

Project commands read `.luam.manifest` from the current directory, or from `--cwd`.
`setup`, `doctor` and `init` do not require an existing project.

Every option belongs to the commands that read it. An option a command does not
own is a usage error, not a warning, so a flag never looks like it took effect
when it did not. Ask any command what it accepts:

```bash
luam --help
luam build --help
luam help trace
```

| Command | What it does |
| --- | --- |
| [`init`](#luam-init) | Scaffolds `.luam.manifest`. |
| [`check`](#luam-check) | Compiles and reports diagnostics. Writes nothing. |
| [`test`](#luam-test) | Runs the project's `.test.luam` files on a local Lua 5.1 interpreter. |
| [`build`](#luam-build) | Compiles and writes the resource into `<outDir>/<name>`. |
| [`ensure`](#luam-ensure) | Builds, syncs into the MTA server, restarts, and watches. |
| [`dev`](#luam-dev) | The `ensure` loop plus a live server log stream. |
| [`server`](#luam-server) | Runs an existing local MTA server in the foreground. |
| [`config`](#luam-config) | Derives a declaration file from the literal data in `config.lua`. |
| [`trace`](#luam-trace) | Resolves generated Lua positions back to Luam source. |
| [`setup`](#luam-setup) | Detects editors and installs the extension, with consent. |
| [`doctor`](#luam-doctor) | Reports the CLI, Node.js, the Lua interpreter, editors, and the extension. |

## `luam init`

```bash
luam init
luam init --name gamemode-race
```

Writes **one file**, `.luam.manifest`, and stops. There is no framework, no example
tree, and nothing to delete before your first line of code.

The resource name comes from `--name`, or from the project directory when that is
a valid MTA resource name, or from `luam-resource` as a last resort. An existing
`.luam.manifest` is kept and reported; `--force` overwrites it.

## `luam check`

```bash
luam check
luam check --watch
```

Compiles everything and prints diagnostics. **Writes nothing.** This is the
command for CI and for a pre-commit hook.

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
```

`--watch` keeps it running and re-checks on every change under the manifest’s
`sources`, printing the same separator `ensure` does between runs and reusing the
incremental cache. It still writes nothing, performs no release lookup, and needs
no network. A change to `.luam.manifest` re-reads the configuration and
re-derives the watched set. Unlike `dev` and `ensure`, `check` does **not** watch
by default. A watch runs until interrupted, so its exit code reports termination
rather than the last check — a script that wants a verdict runs `luam check`
without the flag.

## `luam format`

```bash
luam format
luam format --check
luam format src docs/snippets
```

Rewrites every project source in the style the
[formatting reference](/en/reference/formatting) records, so the editor is no
longer the only way to satisfy it. The command renders that style and never
extends it; a project chooses the whitespace decisions in a
[`.luam.formatter`](/en/reference/formatter-file), and a configuration that does
not parse stops the run with `2`.

With no path, the files are the ones `luam check` compiles — the manifest's
`sources` patterns — plus every `.d.luam` declaration file in the project. The
output directory, `node_modules` and the libraries resolved inside it are never
touched. With one or more paths, those files and directories are formatted
instead, no manifest is loaded, and every `.luam` file below a directory is
included. `.luam.manifest` is not formatted: it is configuration in the
[manifest dialect](/en/tooling/luam-manifest), not a source file.

`--check` writes nothing. It prints the path of every file that differs, one per
line, and exits `1` when any does.

```
src/client/hud.luam
Format failed: 12 files scanned, 1 differing in 8 ms.
```

A file that does not parse is **warned about and left alone**, and does not fail
the run — the formatter has nothing to say about a file it cannot read, and
`luam check` is the command that explains why. Formatting is idempotent, so a
second run changes nothing.

## `luam test`

```bash
luam test
luam test --lua /usr/bin/lua5.1
```

Compiles the project together with every `*.test.luam` file and runs them on a
**Lua 5.1 interpreter found on `PATH`** — `lua5.1`, `lua51`, `lua`, then `luajit`,
each accepted only when it reports `Lua 5.1`. `--lua <path>` or the `LUAM_LUA`
variable pins a specific one, and [`luam doctor`](#luam-doctor) says whether the
command can run at all. The CLI ships no interpreter of its own.

`test` is the only command that runs your code. `build`, `check`, `ensure` and
`dev` never do. No test file reaches the assembled resource or `meta.xml`: a
`*.test.luam` file is excluded from `sources`, and listing one there is an error
rather than a silent inclusion.

A test file resolves to an environment the way every other file does — from its
`sources` pattern, overridden by a file directive, falling back to `shared`.
Shared tests run once on their own, and server and client tests run after the
shared bundle has loaded.

Six globals exist inside a test file and nowhere else:

| Global | What it does |
| --- | --- |
| `describe(name, body)` | Groups tests. Names nest with ` > `. |
| `test(name, body)` | Registers one test. |
| `beforeEach(body)` | Runs before every test in scope. |
| `afterEach(body)` | Runs after every test in scope. |
| `expect(value)` | Returns the matchers below. |
| `mta` | Reads and configures the MTA stubs. |

| Matcher | Passes when |
| --- | --- |
| `.toBe(expected)` | `value == expected`. |
| `.toNotBe(expected)` | `value ~= expected`. |
| `.toEqual(expected)` | The two values are deeply equal. |
| `.toNotEqual(expected)` | They are not. |
| `.toBeNil()` | The value is `nil`. |
| `.toBeTruthy()` | Lua treats the value as true. |
| `.toBeFalsy()` | The value is `false` or `nil`. |
| `.toContain(entry)` | A string contains the substring, or a table contains the value. |
| `.toThrow(message)` | Calling the value raises, and the error contains `message`. `message` is optional. |

**MTA APIs are stubbed, not simulated.** Every MTA function the catalog declares
for the file's environment records the arguments it was called with and returns
`nil`. Configure and read them through `mta`:

| Call | What it does |
| --- | --- |
| `mta.returns(name, value)` | The stub returns `value`. |
| `mta.stub(name, implementation)` | The stub calls `implementation` and returns what it returns. |
| `mta.calls(name)` | The recorded calls, each one a table of arguments. |
| `mta.reset()` | Forgets both. It also runs on its own before each test. |

Non-function MTA globals such as `root` are absent rather than stubbed, so
reaching for one fails instead of yielding a value that means nothing. A test can
prove which calls your code made. It cannot prove what MTA does in response —
that needs a running server, and this command never opens one.

`luam check` compiles the resource, not the tests, so a type error inside a test
file surfaces in the editor and in `luam test`, not in `check`.

A failure reports a position in the `.luam` source, never in the generated Lua:

```
  x shared · rankOf > returns gold at one hundred points
      src/shared/scoreboard.test.luam:9:9 expected "silver", got "gold"
Tests failed: 2 tests passed, 1 failed in 63 ms.
```

The command exits `1` when a test fails, so CI can gate on it, and `2` when no
Lua 5.1 interpreter is available. [Testing a module](/en/recipes/testing-a-module)
walks through a complete project.

## `luam build`

```bash
luam build
```

Compiles and writes the production bundle into `<outDir>/<name>`. The default
also writes `<outDir>/<name>.luam-map.json`; see
[Output layouts and source maps](/en/reference/output-layouts) for the exact
resource shape and overrides.

**`build` is the only command that minifies.** Every `.lua` file it writes —
bundles, the mirrored tree under `--no-bundle`, runtime helpers, and `config.lua`
— is written as one line with its comments and formatting removed. Identifiers
are never renamed, so a runtime error still names the function you wrote.
`meta.xml`, `env.lua`, and assets are written untouched. `ensure` and `dev` keep the
readable output they always had.

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
luam ensure gamemode-race scoreboard
```

Builds, mirrors the resource into your MTA server, and repeats on every save.
Requires a server path — `serverPath` in the manifest, or a
[`.luam.server`](/en/reference/server-file) above it. It syncs files and never
restarts the resource — use `luam dev`, or `refresh` in the server console, to
load the sync. `ensure` never writes to `<outDir>/<name>` and uses the tree
layout by default, regardless of `output.bundle`. Pass `--bundle` for a bundled
sync.

Run at a **workspace root** — a directory holding a `.luam.server` and no
manifest — it takes one or more resource names, builds and syncs each one once,
and exits. There is no watch and no owned console there, so it syncs and restarts
nothing; `luam dev` is the form that does both. With no name it is a usage error
that lists the resources it found.

See [Daily development](/en/guide/daily-development) for the full loop.

## `luam dev`

```bash
luam dev
luam dev --start-server
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
layout and resolves covered generated positions through its in-memory map, so it
owns no layout flag: `luam dev --bundle` is a usage error.

`--start-server` starts the local MTA process first and waits for readiness before
building. After a changed sync, it writes `refresh`, `stop <resource>`, and
`start <resource>` to the owned console, so it also starts a newly deployed
resource. An early or unexpected server
exit stops the development loop with exit code `1`. Without the flag, `dev`
never starts or stops an MTA process.

`luam server` and `luam ensure` in separate terminals are separate processes.
`ensure` cannot write to a console owned by the other invocation, so standalone
`ensure` only syncs files. The session below is the arrangement that does not
have that problem.

### The workspace session

Run `luam dev` at a directory holding a
[`.luam.server`](/en/reference/server-file) and it opens a **session** instead:
one MTA server for the whole directory, and a terminal that speaks two
vocabularies.

```bash
luam dev
```

It starts the server, waits for readiness, follows the log, and attaches
**nothing**. A session with no resource attached compiles nothing and watches
nothing, so opening one does not cost what the directory holds. You name the
resources you are working on, right then:

| Verb | Argument | What it does |
| --- | --- | --- |
| `ensure` | one resource name | Builds it, syncs it, starts it on the server, and watches it for changes. |
| `drop` | one attached name | Stops watching and syncing it. What is on the server is left alone. |
| `rebuild` | optional name | Forces a cycle for one attached resource, or for every attached resource. |
| `list` | — | The attached resources, each with the outcome and age of its last build. |
| `help` | — | The verbs, and the escape below. |

A line whose **first word** is one of those five is executed by the CLI. Every
other line reaches the MTA console unchanged, so `refresh`, `start` and `stop`
still work exactly as they do under `luam server`. The match is on the whole
first word: `ensureing` and `ensure-all` are forwarded.

Begin a line with a **space** to forward it verbatim even when its first word is
a verb — that is the escape for a server command that collides with one:

```
 list
```

The verb list is closed at five for that reason: each one takes a name out of a
vocabulary MTA owns.

`--start-server` is a usage error at a workspace root. The session always owns
the server, so a flag saying "also do the thing you always do" would imply there
is a mode where it does not. `Ctrl+C` shuts the server down and closes every
watch. An unexpected server exit ends the session with exit code `1`.

`luam dev` inside a single resource directory is untouched, `--start-server` and
all.

## `luam server`

```bash
luam server
```

Runs the existing installation under `serverPath` in the foreground with its
console attached. At a workspace root the installation comes from
[`.luam.server`](/en/reference/server-file) instead, so the command runs in a
directory that holds no manifest at all. Windows probes `MTA Server.exe`; Linux probes `mta-server64`
then `mta-server`. Set `development.server.executable` for another layout. On
Linux a candidate that is present without the execute permission is skipped, and
an otherwise empty probe names it with the `chmod +x` that fixes it.
`Ctrl+C` writes MTA's `shutdown` command and uses a bounded kill fallback. The
command owns and stops only the child it launched.

## `luam config`

```bash
luam config
luam config --write
luam config --source settings/config.lua --out settings/config.d.luam --write
```

Reads the literal data in a native `config.lua` and writes a
[declaration file](/en/language/declaration-files) for it. Without `--write` it
prints what it would write and changes nothing.

The file is **read, never executed and never imported**. What it understands is
a top-level assignment of a literal or a table constructor: strings, numbers,
booleans, `nil`, keyed tables, bracketed string keys, positional tables, and
nesting of those. A keyed table becomes an object type, a positional one an
array, a mixed one `table`, and a positional table of different element types
`any[]`. It stops at 256 KB of source, eight levels of nesting and 512 entries
per table.

Anything else — a call, a concatenation, a function, a loop — is reported with
its line and column and skipped; the names around it are still declared. Declare
what it skipped by hand.

The generated file carries a marker on its first line, and the command refuses
to overwrite a file that does not carry it, so a hand-written declaration is
never lost. `--source` and `--out` must stay inside the project directory.

Nothing about `check` or `build` changes: `config.lua` is still copied into the
resource verbatim and is never compiled.

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

A minified `build` script is one line, so MTA reports `line 1` for every error in
it and a generated line carries no information. `trace` recognises the
`minified` flag on a map written by `build` and refuses it rather than returning
a confident wrong line. Reproduce the error under `luam dev` or `luam ensure`,
where the readable tree resolves to the exact source line and symbol.

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

Reports the running CLI and Node.js versions, whether a Lua 5.1 interpreter is on
`PATH` for [`luam test`](#luam-test), every supported editor detected on `PATH`,
and whether that editor has the Luam extension. Attach its output when
reporting a problem.

## Options

Each option lists the commands that own it. Passing it to any other command
returns `2` and runs nothing.

| Option | Owned by | Meaning |
| --- | --- | --- |
| `--cwd <path>` | every command | Project directory holding `.luam.manifest`. Defaults to the current directory. |
| `--no-color` | every command | Plain output, no colour or emoji. `NO_COLOR` does the same. |
| `-h`, `--help` | every command | Print the help text for that command. |
| `-v`, `--version` | root only | Print the CLI version, as `luam --version`. |
| `--manifest <path>` | `build`, `check`, `dev`, `ensure`, `format`, `test`, `trace` | Load this file instead of `.luam.manifest`. |
| `--bundle` / `--no-bundle` | `build`, `ensure` | Select bundle or tree output. `dev` owns neither. |
| `--watch` / `--no-watch` | `check`, `dev`, `ensure` | Keep watching, or run once. `dev` and `ensure` watch by default; `check` does not. |
| `--no-map` | `build`, `dev`, `ensure` | Disable map generation. For `build`, also remove the existing default map after success. |
| `--offline` | `build`, `dev`, `ensure` | Skip the `min_mta_version` lookup. `LUAM_OFFLINE` does the same. |
| `--json` | `build`, `check` | Write one machine-readable document to stdout instead of the human report. |
| `--check` | `format` | Write nothing and list the files that differ. Exits `1` when any does. |
| `--source <path>` | `config` | Native Lua file to read. Defaults to `config.lua`. |
| `--out <path>` | `config` | Declaration file to write. Defaults to `config.d.luam`. |
| `--write` | `config` | Write the declaration file instead of printing it. |
| `--lua <path>` | `test` | Lua 5.1 interpreter that runs the tests. `LUAM_LUA` does the same. |
| `--map <path>` | `trace` | Resource map to read. Relative paths resolve from the project directory. |
| `--name <name>` | `init` | Resource name. |
| `--force` | `init` | Overwrite a file that exists. |
| `-y`, `--yes` | `init`, `setup` | Accept the defaults, or install into every detected editor, without prompting. |

## Migrating from an earlier CLI

Before this release the parser accepted every option on every command and
ignored the ones that did not apply. Those invocations now fail with `2`:

| Invocation | What changed |
| --- | --- |
| `luam dev --bundle` | `dev` never bundled. It warned; it now fails. Use `luam build --bundle` or `luam ensure --bundle`. |
| `luam check --offline` | `check` performs no release lookup. Drop the flag, or set `LUAM_OFFLINE` if a script needs one setting for both commands. |
| `luam build --config luam.json` | `--config` became `--manifest`, and the file it points at is now a [`.luam.manifest`](/en/tooling/luam-manifest) written in the Luam manifest dialect. |
| `luam doctor --manifest .luam.manifest` | `doctor` and `setup` load no project. Drop the flag. |
| `luam build --version` | `--version` is a root option. Use `luam --version`. |
| `luam trace --name x` | `--name` belongs to `init`. Drop the flag. |

Scripts that pass only options the command owns are unaffected, and every exit
code keeps its meaning.

## Machine-readable output

`luam check --json` and `luam build --json` write **one JSON document to stdout
and nothing else there**. The human report — progress, phase timings, the
diagnostic excerpts and the summary line — is not printed at all, so the stream
is parseable with a single `JSON.parse`. Exit codes are unchanged: the document
says what happened, the code says whether it passed, and neither has to do the
other's job.

```json
{
    "version": 1,
    "luam": "0.19.5",
    "command": "check",
    "success": false,
    "diagnostics": [
        {
            "path": "src/server/main.luam",
            "line": 2,
            "column": 12,
            "endLine": 2,
            "endColumn": 17,
            "severity": "error",
            "code": "check-type-mismatch",
            "message": "Return value expects \"number\" but received \"string\"."
        }
    ],
    "summary": { "errors": 1, "warnings": 0, "files": 3, "durationMs": 4 }
}
```

Every key on a diagnostic is always present. `path`, `line`, `column`, `endLine`
and `endColumn` are `null` where the diagnostic has no location — a manifest or
configuration problem, for instance — and `endLine`/`endColumn` are `null` where
the compiler reports a point rather than a span. `path` is relative to the
project directory, the same path the human output prints, so the two reconcile by
eye.

### What you may rely on

| Stable | Not stable |
| --- | --- |
| Every field above exists, with the type shown. | The wording of `message`. Match on `code`. |
| `code` values, and their meaning. | The order of `diagnostics` beyond the sort the human output already applies. |
| `version` is present and is a number. | `durationMs`, which is a measurement. |
| Exit codes match the run without `--json`. | Whether a future release adds fields. |

A field may be **added** without a version bump; a consumer must ignore fields it
does not know. A field may not be removed, or change type or meaning, without
raising `version`.

### What does not have it

`--json` is owned by `check` and `build` only, and passing it to any other
command exits `2`. `test` reports test runs, whose machine shape is a different
document from this one; emitting only its compile diagnostics would be a
half-report. `dev` and `ensure` are rebuild loops, and a document per rebuild is
a stream rather than the single document this schema describes. For the same
reason `--json` and `--watch` together exit `2`.

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
