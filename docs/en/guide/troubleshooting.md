# Troubleshooting

## Reading a diagnostic

Every diagnostic carries a location and a rule code:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

| Part | Meaning |
| --- | --- |
| `src/client/hud.luam` | Source file, relative to the project root. |
| `1:1` | Line and column, both 1-based. |
| `error` | Severity. A warning never fails the build. |
| `check-environment-api` | The rule. Look it up in [Diagnostics](/en/reference/diagnostics). |

The rule prefix tells you which stage rejected the file: `lex-` while reading
characters, `parse-` while reading structure, `check-` while type checking,
`project-` while assembling the resource, `build-` while discovering sources, and
`config-` while loading `.luam.manifest`.

On a terminal the CLI groups diagnostics under their file and prints the offending
source line with a caret. When the stream is not a terminal, it prints the plain
one-line form above, so a CI transcript carries no escape sequence.

## `luam: command not found`

The npm global bin directory is not on your `PATH`. See
[Installation](/en/guide/installation#luam-command-not-found), or use
`npx @thigasdevelopment/luam <command>`, which needs no `PATH` entry.

## The build reports no sources

```
config-no-sources: No ".luam" source files matched "sources".
```

The compiler compiles what `sources` matches, which defaults to
`src/server/**/*.luam`, `src/client/**/*.luam`, and `src/shared/**/*.luam`.
Either create those directories, or point each side of `sources` at the patterns
you actually use.

A literal path that names a file the project does not have is
`config-missing-source` instead, which names the path.

## An MTA function is "not available"

```
check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
```

The file's environment comes from its folder. Move the file under `src/client`,
or override the environment for that one file:

```luam env=client
#!client
```

A `shared` file may use only `shared` declarations, because it runs on both
sides. See [Environments](/en/mta/environments).

## An MTA function stays `any`

The catalog comes from a pinned snapshot of the MTA wiki, so a function added in a
newer MTA release may not be known yet. An unknown name resolves to `any` rather
than failing, so a missing declaration never blocks a build — you simply lose
completion and argument checking for that call.

## `player:getName()` is rejected

```
src/shared/oop.luam:2:18 error check-oop-disabled: "Player.getName" is part of the MTA OOP API, which this project does not enable. Call "getPlayerName" instead. Set "compilerOptions = { oop = true }" in .luam.manifest to enable the MTA OOP API.
```

Set `compilerOptions = { oop = true }` in `.luam.manifest`. That also writes `<oop>true</oop>` into
`meta.xml`, which is what makes the object form exist at runtime. See
[OOP API](/en/mta/oop).

## A value is `string?` and nothing narrows it

A guard narrows a **name**, not a field. `if value ~= nil then` does refine a
local or a parameter inside the branch, and `tonumber(amount) or 100` is
`number`, because `or` drops the nil on its left:

```luam
local amount = '25'
local requested: number = tonumber(amount) or 100
```

What keeps its declared type is a field: `self.value` stays `string?` however you
test it. Copy it into a local, and test the local:

```luam static
local connection = self.connection

if connection ~= nil then
    local handle: userdata = connection
end
```

The narrowing also ends where the block ends, and it is dropped as soon as the
name is assigned again. See [Type guards](/en/language/types#type-guards) for
every form that narrows, and [Limitations](/en/reference/limitations) for what
does not.

## Template interpolation says a name is not in scope

```
check-unknown-template-root: Template interpolation "getPlayerName(player)" refers to "getPlayerName(player)", which is not in scope.
```

An interpolation takes a **name or a member path**, not an expression. Compute the
value first:

```luam
local name: string = getPlayerName(player)

outputChatBox(`${name} joined.`, root)
```

See [Template strings](/en/language/template-strings).

## `ensure` builds but never restarts

That is what it does: `ensure` mirrors the files into the server and stops. Type
`refresh` and `restart <name>` in the server console, or run
`luam dev --start-server`, which owns the MTA process and writes those commands
for you. See [Daily development](/en/guide/daily-development).

## The local MTA server does not start

The executable error lists every attempted path. Check that `serverPath` points
at the installation root, or set a contained relative
`development.server.executable`. A readiness timeout names `server.log`; inspect
that file for startup errors or a release with a different startup marker.

## `min_mta_version` is missing with a warning

The value is resolved from the latest published MTA release and cached in
`.luam/mta-version.json`. With no network and no cache the build warns, leaves the
element out, and still produces a complete resource. Pass `--offline` (or set
`LUAM_OFFLINE`) to skip the lookup deliberately.

## Resolving an MTA runtime position

`luam dev` builds the tree layout and uses the current in-memory map to replace a
covered generated Lua path and line with the authored `.luam` path and line. It
prints an unresolvable log record unchanged. Leave `output.map` enabled and do
not pass `--no-map` when you need this resolution.

For a production error, keep the `<outDir>/<name>.luam-map.json` written beside
the deployed resource and run:

```bash
luam trace "ERROR: [my-resource/src/server.lua:42] failure" --map releases/1.4.0/my-resource.luam-map.json
```

Use the map from the exact deployed build. A different supported map may resolve
to a plausible but wrong source line, and the CLI cannot detect that mismatch.
An unsupported version or uncovered position exits with code `1` and prints no
resolution for that input. See
[Output layouts and source maps](/en/reference/output-layouts#resolving-production-traces).

## The editor disagrees with `luam check`

The language server re-analyzes other files when an edit changes what a file
**declares**, and it sees files you never opened — it scans the workspace on
start and the extension watches `**/*.luam`, `.luam.manifest` and `.env*`. What
it does not read is a file outside the workspace root, so open a folder that
holds your `.luam.manifest`, not a subfolder of it.

If the two still disagree, run **Luam: Restart Language Server** and report it:
the build and the editor share one frontend, so a real difference is a bug.

## Colour and progress in CI

Output drops every escape sequence when the stream is not a terminal. To force it
anywhere, pass `--no-color` or set `NO_COLOR` to a non-empty value. Progress is
painted on stderr and the report goes to stdout, so redirecting stdout captures
the report alone.

## Still stuck

Open an issue at
[github.com/ThigasDevelopment/luam/issues](https://github.com/ThigasDevelopment/luam/issues)
with the output of `luam doctor` and the failing diagnostic. For an editor
problem, set `luam.trace.server` to `"verbose"` and attach the trace.
