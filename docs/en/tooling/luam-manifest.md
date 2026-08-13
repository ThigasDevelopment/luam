# .luam.manifest

`.luam.manifest` sits at the project root. **Only `name` is required.**

```luam
name = 'luam-demo'
author = 'Thigas'
version = '1.0.0'
description = 'A demo resource'

sourceDirs = { 'src' }
assetDirs = { 'assets' }
outDir = 'build'
loadOrder = { 'src/server/index.luam', 'assets/shaders/base.fx' }

output = {
    bundle = true,
    map = true,
}

oop = false
helpers = { 'threads' }
serverPath = 'C:/MTA Server'
resourcesDir = 'mods/deathmatch/resources'

development = {
    logs = {
        enabled = false,
        maxMessageLength = 4096,
        rateLimit = 30,
        rateWindowMs = 1000,
    },
}

transport = {
    kind = 'http',
    host = '127.0.0.1',
    port = 22005,
    resource = 'luam-sync',
    username = 'luam',
    passwordEnv = 'LUAM_MTA_PASSWORD',
}
```

`--manifest <path>` loads a different file, which is how a project keeps a separate
manifest for a second server. The path has to end in `.luam.manifest` —
`deploy.luam.manifest` is accepted, `luam.config.js` is
`config-unsupported-manifest`.

## The dialect

The manifest is written in Luam, restricted to what a configuration file needs.
The compiler parses, checks, and evaluates it — the same lexer, the same parser,
the same diagnostics with carets. There is no separate configuration language to
learn and no separate process to run it.

Two statements are allowed:

```luam
local prefix = 'luam'          # a local, to name a value used more than once
name = prefix .. '-demo'       # an assignment to a configuration field
```

Anything else — a function, a loop, an `if`, a `return`, a call, an environment
directive — is `config-invalid-statement`. An assignment to a name that is not a
configuration field is `config-unknown-field`, reported at the name rather than at
the file:

```
.luam.manifest:2:1 error config-unknown-field: "outdir" is not defined in this
manifest. Declare it with "local", or read "mode", "env", or "root".
```

Every configuration diagnostic carries a line and a column, and an interactive
terminal underlines the offending text the same way it does for a source file.

A value is a literal, a table, or those combined with `and`, `or`, `not`,
comparison, arithmetic, and concatenation:

```luam
outDir = mode == 'production' and 'build' or 'build-dev'
port = 22000 + 5
transport = {
    kind = env.LUAM_MTA_PASSWORD and 'http' or 'none',
    passwordEnv = 'LUAM_MTA_PASSWORD',
}
```

Lua truthiness applies, so `a and b or c` reads as a conditional and the checker
types it precisely: the branch above is `'http' | 'none'`, which is what
`transport.kind` accepts.

### Why there are no calls

The expression language has no calls and no function values. That is the whole
point: evaluating a manifest is pure and total, so it is safe to run anywhere.
The compiler evaluates it in process, and so does the language server every time
you type — opening a folder never executes project code and never spawns
anything.

### Injected values

Three names are in scope besides the configuration fields:

| Value | Type | Meaning |
| --- | --- | --- |
| `mode` | `string` | `development` for `dev` and `ensure`, `production` for `build`, otherwise the command name — `check`, `trace`. |
| `env` | table of `string?` | The environment the CLI was given. Read a variable by name; the value never reaches a diagnostic. |
| `root` | `string` | Absolute project root, for composing paths that do not depend on the working directory. |

`env` members are optional strings, so a missing variable is `nil` rather than an
error. Comparing or defaulting is the way to use one:

```luam
local password = env.LUAM_MTA_PASSWORD

transport = {
    kind = password and 'http' or 'none',
}
```

Nothing else is in scope. There is no `print`, no `os`, no `require` — a name the
manifest did not declare is `config-unknown-field`, which is also why a typo in a
field name is caught at the field rather than silently ignored.

### In the editor

The manifest is an ordinary document to the language server. Diagnostics appear
as you type, completion offers the fields valid at the cursor — with their type,
whether they are required, and their default — and the closed sets (`transport.kind`,
`helpers`, and the `mode` values) complete inside the quotes. Hover names the
field's full path and type.

Because the server reads the file directly, flipping `oop` takes effect on save.
There is no snapshot to refresh and no CLI run to wait for; `.luam/settings.json`
no longer exists.

## Fields

| Field | Required | Default | Meaning |
| --- | --- | --- | --- |
| `name` | yes | — | Names the output folder and the resource `ensure` restarts. It never reaches `meta.xml` — MTA reads the name from the folder. |
| `author`, `version`, `description` | no | unset | `meta.xml` info attributes. |
| `sourceDirs` | no | `{ 'src' }` | Scanned for `.luam` and `.d.luam` files. Other files here are copied but not declared. |
| `assetDirs` | no | `{ 'assets' }` | Copied verbatim and declared as `<file>`, so clients download them. |
| `outDir` | no | `'build'` | Receives `<outDir>/<name>`. |
| `loadOrder` | no | `{ }` | Source paths pinned ahead of their group in `meta.xml`. |
| `output.bundle` | no | `true` | Uses production bundles for `build`; `false` selects the tree layout. |
| `output.map` | no | `true` | Generates source position maps. Only `build` writes a map file. |
| `oop` | no | `false` | Enables the MTA OOP API and writes `<oop>true</oop>`. |
| `helpers` | no | `{ }` | Runtime helpers to copy even when no feature requires them. |
| `serverPath` | no | unset | MTA server root. Required by `ensure` and `dev`. |
| `resourcesDir` | no | `'mods/deathmatch/resources'` | Resource directory relative to `serverPath`. |
| `transport` | no | absent | How `ensure` restarts the resource. `kind` is required once the table is written. |
| `development.logs` | no | disabled, safe limits | Client relay length and rate limits used by `dev`. |

A complete field-by-field table, including every validation rule, is in
[Configuration fields](/en/reference/configuration-fields).

## Path safety

`outDir`, `resourcesDir`, and every `sourceDirs`, `assetDirs` and `loadOrder`
entry must stay **inside their base directory**. An absolute path or a `..`
segment is `config-escaping-path` and the configuration fails to load.

## `loadOrder`

An ordered list of source paths relative to the project root. Each entry is
emitted ahead of its group in `meta.xml` — a script as its compiled `.lua` path,
an asset as itself.

Order is meaningful for assets too, since a shader can depend on another. An
entry that names a file the project does not produce is
`project-load-order-missing`, so a rename cannot break the order silently.

## `oop`

Off by default. On, the compiler writes `<oop>true</oop>` above `<info>` and types
the object form of the MTA API, so `player:getName()` returns `string`. Off, the
same call is `check-oop-disabled` and the message names the procedural function to
use instead. The emitted Lua is identical either way. See
[OOP API](/en/mta/oop).

## `output`

`output.bundle` sets the `build` default. `--bundle` and `--no-bundle` override
it. `ensure` defaults to tree unless passed `--bundle`, while `dev` always uses
tree.

`output.map` controls map generation. `build` writes
`<outDir>/<name>.luam-map.json`; `ensure` and `dev` keep maps in memory and never
write that file. `--no-map` disables map generation for the current command.
See [Output layouts and source maps](/en/reference/output-layouts).

## `helpers`

Names runtime helpers the compiler would not inject on its own.

- `threads` is opt-in.
- `env` is injected automatically when the project has a `.env`, so listing it is
  only needed to ship the library without one.
- Listing an automatic helper is harmless; listing an unknown name is
  `config-unknown-helper`, and completion offers the known names inside the
  quotes.

`helperDir` was removed. Tree output writes helpers to `lib/<environment>`;
bundle output includes them in its environment bundles. A `.luam.manifest` that
still names `helperDir` fails with `config-unknown-field` — delete the line.

## `transport`

```luam
transport = {
    kind = 'http',
    host = '127.0.0.1',
    port = 22005,
    resource = 'luam-sync',
    username = 'luam',
    passwordEnv = 'LUAM_MTA_PASSWORD',
    refreshFunction = 'refreshResources',
    restartFunction = 'restartResource',
}
```

`kind` is the one member the table must carry — `transport = { }` is
`config-missing-field`, so a half-written block never falls back to a silent
default.

`none` skips the restart and only syncs files. `http` calls the MTA HTTP
interface:

```
POST http://<host>:<port>/<resource>/call/<function>
```

The call carries HTTP basic authentication and a JSON array of arguments.
`refreshFunction` runs first, then `restartFunction` with the resource name. Both
must be exported by the `resource` named in the configuration, and the ACL must
grant the configured user HTTP access.

Prefer `passwordEnv` over an inline `password`. See
[Security boundaries](/en/mta/security).

## `development.logs`

Used by `luam dev` only. `build` and `ensure` never write the development
helpers.

| Key | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | `dev` enables capture even when this section is omitted. |
| `maxMessageLength` | `4096` | Longer relayed records are rejected. |
| `rateLimit` | `30` | Records allowed per client per window. |
| `rateWindowMs` | `1000` | Length of that window. |

## When the file is wrong

| Problem | Diagnostic |
| --- | --- |
| No `.luam.manifest` in the directory | `config-not-found` |
| `--manifest` names a file that is not a manifest | `config-unsupported-manifest` |
| The file could not be read | `config-unreadable-manifest` |
| A statement the dialect does not allow | `config-invalid-statement` |
| A value the expression language does not allow | `config-invalid-expression` |
| `name`, or `transport.kind`, is missing | `config-missing-field` |
| `name` is not a valid resource name | `config-invalid-name` |
| A field has the wrong type | `config-invalid-type` |
| A name is not a configuration field | `config-unknown-field` |
| A path escapes its base | `config-escaping-path` |
| `passwordEnv` names an unset variable | `config-missing-secret` |

Every code is listed in [Diagnostics](/en/reference/diagnostics).

## Migrating from `luam.json`

`luam.json` is not read, not merged, and not reported. A project that still has
one fails with `config-not-found` until it is migrated. Three steps:

1. Rename `luam.json` to `.luam.manifest`.
2. Unwrap the outer braces, drop the quotes around the keys, and write `=` instead
   of `:`. JSON arrays become Luam tables: `["src"]` is `{ 'src' }`.
3. Rename `--config` to `--manifest` wherever a script or CI job passes it.

```json
{
    "name": "luam-demo",
    "sourceDirs": ["src"],
    "outDir": "build"
}
```

becomes

```luam
name = 'luam-demo'
sourceDirs = { 'src' }
outDir = 'build'
```

The field names, their defaults, and every validation rule are the same. Once the
file loads, `mode` and `env` are available wherever a value has to differ per
environment.
