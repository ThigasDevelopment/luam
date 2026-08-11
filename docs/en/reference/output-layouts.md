# Output layouts and source maps

Luam uses a compact bundle layout for a resource you ship and a tree layout for
development. Bundling is the production shape, not a minification setting: it
preserves names and readable Lua while reducing the resource to at most one
script per environment.

## Command defaults and overrides

| Command | Default layout | Layout override | Source map |
| --- | --- | --- | --- |
| `luam build` | Bundle when `output.bundle` is `true` (the default); tree when it is `false`. | `--bundle` or `--no-bundle` overrides the configuration. | Writes `<outDir>/<name>.luam-map.json` when `output.map` is `true` (the default). `--no-map` disables and removes that map. |
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
    ├── .env                      when declared; written once
    ├── assets/                   authored paths preserved
    └── src/
        ├── shared.lua            when shared code or helpers exist
        ├── server.lua            when server code or helpers exist
        └── client.lua            when client code or helpers exist
```

The literal `src/` bundle directory does not follow `sourceDirs`. An empty
environment has no bundle and no `<script>` entry. There is no `lib/` directory
or mirrored module tree. Runtime helpers and modules are isolated in `do ... end`
blocks; helpers precede modules, and `loadOrder` still controls module order.

The manifest lists `config.lua` first when present, followed by the non-empty
bundles in shared, server, client order:

```xml
<script src="config.lua" type="shared" cache="false" />
<script src="src/shared.lua" type="shared" cache="false" />
<script src="src/server.lua" />
<script src="src/client.lua" type="client" cache="false" />
```

`config.lua`, `.env`, and assets are never put into a bundle. `config.lua` stays
at the resource root and remains a shared script. `.env` stays at the root for
the server-only environment helper and never receives a `<file>` entry. Assets
keep their authored paths and normal `<file>` entries. See
[config.lua and .env](/en/mta/configuration) for their ownership and security
rules.

## Tree layout

The tree layout keeps each generated module and runtime helper separate:

```text
my-resource/
├── meta.xml
├── config.lua
├── .env
├── assets/
├── lib/
│   ├── shared/class.lua
│   └── server/env.lua
└── src/
    ├── shared/labels.lua
    ├── server/greet.lua
    └── client/hud.lua
```

The manifest lists helpers, `config.lua`, pinned `loadOrder` entries, and then
the source groups. This is the normal `ensure` and fixed `dev` shape because a
running resource remains easy to inspect. Use `luam build --no-bundle` when a
local build also needs this shape.

Switching layouts removes generated files from the previous layout. Files whose
bytes did not change are not rewritten, and `.env` is never overwritten.

## Resource map file

`luam build` writes `<outDir>/<name>.luam-map.json` beside the resource directory,
never inside it. The current format version is `1`. It records:

- `version`, `resource`, and `layout` for the build;
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

Pass either a bare generated position or a quoted MTA log line:

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
