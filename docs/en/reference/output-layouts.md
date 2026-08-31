# Output layouts and source maps

Luam uses a compact bundle layout for a resource you ship and a tree layout for
development. Bundling reduces the resource to at most one script per
environment; minification then removes the formatting from what `luam build`
writes. Both are production-only, and neither renames an identifier.

## Command defaults and overrides

| Command | Default layout | Layout override | Source map |
| --- | --- | --- | --- |
| `luam build` | Bundle when `output.bundle` is `true` (the default); tree when it is `false`. Minified in both. | `--bundle` or `--no-bundle` overrides the configuration. | Writes `<outDir>/<name>.luam-map.json` when `output.map` is `true` (the default), marked `minified`. `--no-map` disables and removes that map. |
| `luam ensure` | Tree, regardless of `output.bundle`. | `--bundle` selects bundle; `--no-bundle` selects tree. | Keeps a map in memory only. It never writes a map file. `--no-map` disables it. |
| `luam dev` | Tree, regardless of configuration or bundle flags. | None. `dev` always keeps generated files individually addressable. | Keeps a map in memory to resolve streamed logs. It never writes a map file. `output.map: false` or `--no-map` disables resolution. |

`ensure` and `dev` write directly to
`<serverPath>/<resourcesDir>/<name>`, never to `<outDir>/<name>`.

## Bundle layout

The default `luam build` output is ready to deploy:

```text
build/
├── my-resource.luam-map.json     kept outside the resource
└── my-resource/
    ├── meta.xml
    ├── config.lua                when authored
    ├── env.lua                   when keys are declared; written once
    ├── assets/                   authored paths preserved
    └── src/
        ├── shared.lua            when shared code or helpers exist
        ├── server.lua            when server code or helpers exist
        └── client.lua            when client code or helpers exist
```

The literal `src/` bundle directory does not follow `sources`. An empty
environment has no bundle and no `<script>` entry. There is no `lib/` directory
or mirrored module tree. Runtime helpers and modules are concatenated verbatim
into one chunk per environment, with no wrapper block; helpers precede modules,
and `loadOrder` still controls module order. Every module therefore shares the
bundle chunk scope, so a file-level `local` is visible to every module after it
and the Lua 5.1 limit of 200 active locals applies to the bundle as a whole.

The manifest lists `config.lua` first when present, followed by the non-empty
bundles in shared, server, client order:

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

`config.lua`, `env.lua`, and assets are never put into a bundle. `config.lua`
stays at the resource root and remains a shared script. `env.lua` stays at the
root as a server script, because it is owned by the administrator and written
once rather than regenerated. Assets keep their authored paths and normal
`<file>` entries. See [config.lua and .env](/en/mta/configuration) for their
ownership and security rules.

## Tree layout

The tree layout keeps each generated module and runtime helper separate:

```text
my-resource/
├── meta.xml
├── config.lua
├── env.lua
├── assets/
├── lib/
│   ├── class.lua
│   └── string.lua
├── libs/
│   └── luam-example-collections/
│       └── shared/src/queue.lua
└── src/
    ├── shared/labels.lua
    ├── server/greet.lua
    └── client/hud.lua
```

Runtime helpers sit flat in `lib/`, one file per helper. A helper resolves to a
single environment per build, so the directory never needs to separate them —
each `meta.xml` entry carries its own environment.

A [library](/en/tooling/libraries) the manifest lists is vendored under `libs/`,
one directory per package with its scoped name flattened, and its own source tree
beneath the side it declares.

The manifest lists helpers, library scripts, `env.lua` and `config.lua`, pinned
`loadOrder` entries, and then the source groups. This is the normal `ensure` and fixed `dev`
shape because a running resource remains easy to inspect. Use
`luam build --no-bundle` when a local build also needs this shape.

Switching layouts removes generated files from the previous layout. Files whose
bytes did not change are not rewritten, and `env.lua` is never overwritten.

## The development output contract

Every command that writes readable Lua emits the source file with the Luam-only
constructs removed or lowered, and nothing else changed. There is no manifest
field for it: turning minification off is what asks for readable output.

| Command | Readable output |
| --- | --- |
| `luam dev` | Always. It never minifies. |
| `luam ensure` | Always. It never minifies. |
| `luam build` | When `output.minify` is `false`, or with `--no-minify`. |

The contract has one measurable shape: **one line of Lua for every line of
Luam**. A rewritten construct occupies the lines the construct it replaces
occupied, so a position MTA reports against the generated file names the same
line in the source.

What is rewritten:

| Written | Generated |
| --- | --- |
| A type annotation or a return type | Erased, so the signature reads as plain Lua |
| `interface`, `type`, `declare`, `declare event` | A Lua block comment over the same lines, trailing semicolon included |
| `enum Name { A, B }` | `Name = enum { 'A', 'B' }` on the lines it was written on |
| `class Name extends Base` | `class 'Name' :extends 'Base'`, with the implicit `self` parameter and the member separators added in place |
| A class field with no default | `name = nil`, on the line the field was written on, so the declared shape reads from the generated class |
| `implements` | Erased, because it is a compile-time contract |
| `new`, a template string, a native extension | Canonical Lua for that expression alone, on the line it was written on, with the layout around it untouched |
| A compound assignment | Canonical Lua for that statement alone, not for the statement enclosing it, keeping the trailing semicolon on the generated line |
| `continue` | `break` inside a `repeat ... until true` whose keywords ride the first and last lines of the loop body |
| A Luam comment | The equivalent Lua comment |
| A build directive such as `#!client` | `--!client`, a comment on the same line, because it steers the compiler and not the runtime |

Everything else is copied through byte for byte: indentation, blank lines, the
space before a parenthesis, the quotes, and the semicolons you wrote.

```luam
type CustomType = string;

class Example {
    label = 'a';

    greet = function (value: CustomType): void
        print(value)
    end
}
```

```lua
--[[type CustomType = string;]]

class 'Example' {
    label = 'a';

    greet = function (self, value)
        print(value)
    end
}
```

A `continue` is the one construct that needs scaffolding rather than a
substitution. The scaffolding is placed on the body's own lines, so `for ... do`
and its `end` stay byte-identical to what you wrote:

```luam
for index = 1, 10 do
    if (index == 2) then
        continue;
    end

    print (index);
end
```

```lua
for index = 1, 10 do
    repeat if (index == 2) then
        break;
    end

    print (index); until true
end
```

### What the contract does not promise

- A comment is not a runtime construct. An erased declaration stays erased: the
  comment shows the contract, it does not restore it.
- A loop containing a `continue` carries its scaffolding on the first and last
  lines of its body, which makes those two lines denser than what you wrote.
  That is the accepted cost of adding no line, and it is why the loop's own
  header and `end` survive untouched.
- The canonical emitter remains the fallback whenever a construct has no
  surgical form — a decorated class, a class with generated members, a builder.
  When such a construct cannot fit the lines it was written on, the whole file
  falls back to canonical emission rather than shifting every line below it.
- A minified `luam build` ships the release form instead: no authored
  whitespace, and no comment carrying source text.

## Production minification

`luam build` writes every generated `.lua` file as a single line. It applies to
bundles, to the mirrored tree under `--no-bundle`, to runtime helpers under
`lib/`, and to `config.lua`. `meta.xml`, `env.lua`, and copied assets are written
byte for byte as they were — `env.lua` is edited by an administrator, so it stays
readable.

The transformation lexes Lua 5.1 rather than matching text, so it is safe for
every construct the emitter can produce:

- comments, line and long bracket alike, are removed;
- short strings, long bracket strings, and numeric literals keep their bytes
  exactly, including a `--` or `]]` that appears inside one;
- a single space is inserted only where two tokens would otherwise merge, so
  `a - -b` never becomes a comment and `1 .. 2` never becomes a malformed
  number;
- **no identifier is renamed.** A production runtime error still names the
  function, method, or class you wrote.

```lua
-- authored
local total = 0

for index = 1, 3 do -- accumulate
    total = total + index
end
```

```lua
local total=0 for index=1,3 do total=total+index end
```

Minification runs on the whole file set in memory before the first write. A file
that does not scan as Lua 5.1 aborts the command with the file and line, and the
previous production resource is left intact — nothing is written and nothing is
pruned.

`luam ensure` and `luam dev` never minify. Use them whenever you need to read
the generated Lua.

## Resource map file

`luam build` writes `<outDir>/<name>.luam-map.json` beside the resource directory,
never inside it. The current format version is `1`. It records:

- `version`, `resource`, and `layout` for the build, plus `minified: true` on a
  map written by `luam build`;
- each generated Lua `path`;
- each module or helper segment and its generated line range;
- sparse, 1-based generated-to-source line mappings and an optional enclosing
  function, method, or class symbol.

The map is build-specific release metadata. Keep it for as long as logs from
that release may need investigation, and archive it with that release without
copying it into the MTA resource. A map from another build can point at the wrong
authored line even when the resource name and generated path match. `luam trace`
detects unsupported map versions and uncovered files or lines, but it cannot
prove that a supported map came from the same build. Treat a resolution made
with the wrong build's map as unreliable.

`--no-map` leaves the generated resource byte-identical and removes an existing
map at the default path after a successful build. `output.map: false` makes that
the project default.

## Resolving production traces

::: warning A minified build has no line to resolve
Every script `luam build` writes is one line, so MTA reports `line 1` for every
error in it. That number identifies nothing, and no map can recover the authored
line from it without a generated column, which this release does not record.

`luam trace` reads the `minified` flag and refuses such a map with an actionable
message instead of returning a confident wrong line. Reproduce the error under
`luam dev` or `luam ensure`: both keep the readable tree and resolve to the exact
source line and enclosing symbol.
:::

Against a readable build, pass either a bare generated position or a quoted MTA
log line:

```bash
luam trace src/server.lua:42
luam trace "ERROR: [my-resource/src/server.lua:42] attempt to index a nil value"
```

The command first tries the configured `<outDir>/<name>.luam-map.json`. If that
does not exist, it searches below the project directory and uses the map only
when exactly one exists. The search skips `node_modules` and directories whose
name starts with a dot, so a map kept in one of those is only reachable through
`--map`. Select another relative or absolute path explicitly:

```bash
luam trace src/server.lua:42 --map releases/1.4.0/my-resource.luam-map.json
```

With no operand, `trace` reads one position or full log line per non-empty stdin
line:

```bash
luam trace --map releases/1.4.0/my-resource.luam-map.json < mta-errors.log
```

A resolved line is printed as `source-file:line`, followed by its symbol when
available:

```text
src/server/orders.luam:18 (createOrder)
```

`trace` needs neither compilation nor a server. It returns `0` only when every
input line resolves. It returns `1` for no input, an unreadable or invalid map,
an unsupported map version, an input with no position, or any uncovered
position; valid lines in a mixed input are still printed. Command-line usage
errors return `2`.

## Bundle diagnostics

| Diagnostic | Cause | Fix |
| --- | --- | --- |
| `project-bundle-toplevel-return` | A module ends with a top-level `return`, which cannot preserve separate-chunk behavior inside a bundle. | Remove the top-level return or use the tree layout with `--no-bundle`. |
| `project-bundle-output-collision` | A source or asset would produce a reserved bundle path such as `src/server.lua`. | Rename the source output or asset, or use the tree layout. |

Either diagnostic fails the build before output is written.
