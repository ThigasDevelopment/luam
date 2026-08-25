# .luam.manifest

`.luam.manifest` sits at the project root. **Only `name` is required.**

```luam
name = 'luam-demo'
author = 'Thigas'
version = '1.0.0'
description = 'A demo resource'

compiler = {
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
    logs = {
        enabled = false,
        maxMessageLength = 4096,
        rateLimit = 30,
        rateWindowMs = 1000,
    },
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

A `local` that no field reads is dead configuration, so the manifest reports it as
`check-unused-local` — a warning, not an error. This does not depend on
`compiler.noUnusedLocals`, which governs source files; the manifest is
always checked in its own strict mode. Rename the local with a leading `_` to keep
it on purpose.

A value is a literal, a table, or those combined with `and`, `or`, `not`,
comparison, arithmetic, and concatenation:

```luam
outDir = mode == 'production' and 'build' or 'build-dev'
serverPath = env.LUAM_MTA_SERVER or 'C:/MTA Server'
```

Lua truthiness applies, so `a and b or c` reads as a conditional and the checker
types it precisely: the branch above is a `string`, which is what `serverPath`
accepts.

### Why there are no calls

The expression language has no calls and no function values. That is the whole
point: evaluating a manifest is pure and total, so it is safe to run anywhere.
The compiler evaluates it in process, and so does the language server every time
you type — opening a folder never executes project code and never spawns
anything.

There are no hooks and no plugins for the same reason. A manifest declares what
the project is; it never describes how to build it.

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
local root = env.LUAM_MTA_SERVER

serverPath = root or 'C:/MTA Server'
```

Nothing else is in scope. There is no `print`, no `os`, no `require` — a name the
manifest did not declare is `config-unknown-field`, which is also why a typo in a
field name is caught at the field rather than silently ignored.

### In the editor

The manifest is an ordinary document to the language server. Diagnostics appear
as you type, completion offers the fields valid at the cursor — with their type,
whether they are required, and their default — and the closed sets (`helpers`
and the `mode` values) complete inside the quotes. Hover names the
field's full path and type.

Because the server reads the file directly, flipping `compiler.oop` takes
effect on save. There is no snapshot to refresh and no CLI run to wait for;
`.luam/settings.json` no longer exists.

## Domains

The manifest is a closed set of typed domains. Each one has a single owner and a
single implemented consumer, so a field never means two things in two places.

| Domain | Owns |
| --- | --- |
| identity | `name`, `author`, `version`, `description` |
| `compiler` | How the checker reads the project. |
| `sources` | Which files belong to the project and to which environment. |
| `assets` | Which files are copied into the resource and where they land. |
| `dependencies` | Resources this one requires at run time. |
| `engine` | The MTA version the resource requires. |
| `environment` | Which `.env` files supply `env` and `process.env`. |
| output | `outDir`, `loadOrder`, `output`, `helpers`. |
| deployment | `serverPath`, `resourcesDir`, `development`. |

A complete field-by-field table, including every validation rule, is in
[Configuration fields](/en/reference/configuration-fields).

## `compiler`

| Key | Default | Meaning |
| --- | --- | --- |
| `strict` | `true` | Project-wide strict mode. A `#!strict` or `#!nonstrict` directive in a file still wins for that file. |
| `oop` | `false` | Enables the MTA OOP API and writes `<oop>true</oop>`. |
| `noUnusedLocals` | `false` | Reports a local that is never read as `check-unused-local`. |
| `noUnusedParameters` | `false` | Reports a parameter that is never read as `check-unused-parameter`. |
| `warningsAsErrors` | `false` | Promotes every warning to an error, so a warning fails the build. |

A name starting with `_` is never reported as unused, which is the way to keep a
binding on purpose.

With `oop` on, the compiler types the object form of the MTA API, so
`player:getName()` returns `string`. Off, the same call is `check-oop-disabled`
and the message names the procedural function to use instead. The emitted Lua is
identical either way. See [OOP API](/en/mta/oop).

## `sources`

Each side lists the patterns that belong to it:

```luam
sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam', 'ui/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}
```

A pattern uses `*` (anything inside one segment), `**` (any number of segments),
and `?` (one character). `/` separates segments. There is no regex, no negation,
no brace expansion, and no extglob — a value shaped like one is
`config-invalid-pattern`. `.git`, `.luam`, `node_modules`, and `outDir` are never
scanned.

The side a file gets is the side that matched it. A `#!server`, `#!client`, or
`#!shared` directive in the file still wins, and the mismatch is reported as
`env-path-directive-conflict` so the disagreement is visible rather than silent.
A file matched by two sides is `config-source-side-conflict`; a literal path that
names no file is `config-missing-source`; a project where nothing matched at all
is `config-no-sources`.

Omitting `sources` keeps the default layout, which is the three patterns above.

## `assets`

Each entry names what to copy and where it lands inside the resource:

```luam
assets = {
    { from = 'assets/**/*', to = 'assets' },
    { from = 'media/logo.png', to = 'images' },
}
```

Everything a mapping names is copied and declared as `<file>`, so clients
download it. Nothing else is copied — a data file sitting beside server code
needs its own mapping, which is what makes the resource contents predictable.

`to` is a destination directory inside the resource. Two entries that resolve to
the same destination are `config-output-collision`, and so is a destination that
would overwrite `meta.xml` or the generated `lib/` directory. A literal `from`
that names no file is `config-missing-asset`.

## `dependencies`

```luam
dependencies = { 'scoreboard', 'admin' }
```

Each name is written as `<include resource="..." />` in `meta.xml`, so MTA starts
the named resource first. Names are deduplicated and sorted. A value that is not
a valid resource name, or that names this resource, is
`config-invalid-dependency`. Optional dependencies are not supported — MTA has no
such concept.

## `engine`

```luam
engine = {
    minVersion = '1.6.0',
}
```

`minVersion` becomes `min_mta_version` in `meta.xml`. The default is `'latest'`,
which asks the MTA release feed for the current version at build time; `--offline`
and `LUAM_OFFLINE` skip that lookup and the build still succeeds. Pinning an
explicit version makes the build network-free. A value that is not a version is
`config-invalid-engine-version`.

`mta.minVersion` is not accepted. The domain is `engine`.

## `environment`

```luam
environment = {
    file = '.env.development',
    localFile = '.env.development.local',
}
```

`file` declares the keys and their types — it is what `env.X` and
`process.env.X` are typed against, and what the deployed `env.lua` is
rendered from. `localFile` overrides the *values* of keys the base file already
declares; a key only in the local file is ignored, so a machine-local override
can never change the project's shape. Both default to `.env` and `.env.local`.

A configured file that does not exist is `config-missing-env-file`; the defaults
are optional, so a project without a `.env` is not an error. The language server
watches both files and reanalyzes on save.

## Path safety

`outDir`, `resourcesDir`, and every `sources`, `assets`, and `loadOrder` entry
must stay **inside their base directory**. An absolute path or a `..` segment is
`config-escaping-path` and the configuration fails to load.

## `loadOrder`

An ordered list of source paths relative to the project root. Each entry is
emitted ahead of its group in `meta.xml` — a script as its compiled `.lua` path,
an asset as itself.

Order is meaningful for assets too, since a shader can depend on another. An
entry that names a file the project does not produce is
`project-load-order-missing`, so a rename cannot break the order silently.

## `output`

`output.bundle` sets the `build` default. `--bundle` and `--no-bundle` override
it. `ensure` defaults to tree unless passed `--bundle`, while `dev` always uses
tree.

`output.map` controls map generation. `build` writes
`<outDir>/<name>.luam-map.json`; `ensure` and `dev` keep maps in memory and never
write that file. `--no-map` disables map generation for the current command.
See [Output layouts and source maps](/en/reference/output-layouts).

`output.minify` controls whether `build` writes each script on one line.
`--minify` and `--no-minify` override it. `dev` never minifies, so a stack trace
stays readable while you work.

## `helpers`

Names runtime helpers the compiler would not inject on its own.

- `threads` is opt-in.
- `env` is injected automatically when the project has an environment file, so
  listing it is only needed to ship the library without one.
- Listing an automatic helper is harmless; listing an unknown name is
  `config-unknown-helper`, and completion offers the known names inside the
  quotes.

`helperDir` was removed. Tree output writes helpers to `lib/<environment>`;
bundle output includes them in its environment bundles. A `.luam.manifest` that
still names `helperDir` fails with `config-unknown-field` — delete the line.

## `development.logs`

Used by `luam dev` only. `build` and `ensure` never write the development
helpers.

| Key | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | `dev` enables capture even when this section is omitted. |
| `maxMessageLength` | `4096` | Longer relayed records are rejected. |
| `rateLimit` | `30` | Records allowed per client per window. |
| `rateWindowMs` | `1000` | Length of that window. |

## `development.server`

`executable` is an optional path relative to `serverPath`. It must stay inside
that directory. When omitted, `luam server` and `luam dev --start-server` probe
`MTA Server.exe` on Windows, or `mta-server64` then `mta-server` on Linux.

## When the file is wrong

| Problem | Diagnostic |
| --- | --- |
| No `.luam.manifest` in the directory | `config-not-found` |
| `--manifest` names a file that is not a manifest | `config-unsupported-manifest` |
| The file could not be read | `config-unreadable-manifest` |
| A statement the dialect does not allow | `config-invalid-statement` |
| A value the expression language does not allow | `config-invalid-expression` |
| `name`, or `from` inside an `assets` entry, is missing | `config-missing-field` |
| `name` is not a valid resource name | `config-invalid-name` |
| A field has the wrong type | `config-invalid-type` |
| A name is not a configuration field | `config-unknown-field` |
| A field that no longer exists | `config-removed-field` |
| A path escapes its base | `config-escaping-path` |
| A pattern the glob grammar does not allow | `config-invalid-pattern` |

Every code is listed in [Diagnostics](/en/reference/diagnostics).

## Removed fields

These names are rejected rather than aliased, so a stale manifest fails loudly
instead of building something different from what it says:

| Removed | Replacement |
| --- | --- |
| `oop` | `compiler = { oop = true }` |
| `compilerOptions` | `compiler = { ... }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }` |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }` |
| `mta` | `engine = { minVersion = '1.6.0' }` |
| `helperDir` | Nothing. Helpers go to `lib/<environment>` or into the bundles. |
| `transport` | Nothing. `ensure` syncs files; `dev --start-server` restarts the server it owns. |

Each one reports `config-removed-field` and names its replacement in the message.
