# luam.json

`luam.json` sits at the project root. **Only `name` is required.**

```json
{
    "name": "luam-demo",
    "author": "Thigas",
    "version": "1.0.0",
    "description": "A demo resource",
    "sourceDirs": ["src"],
    "assetDirs": ["assets"],
    "outDir": "build",
    "loadOrder": ["src/server/index.luam", "assets/shaders/base.fx"],
    "output": {
        "bundle": true,
        "map": true
    },
    "oop": false,
    "helpers": ["threads"],
    "serverPath": "C:/MTA Server",
    "resourcesDir": "mods/deathmatch/resources",
    "development": {
        "logs": {
            "enabled": false,
            "maxMessageLength": 4096,
            "rateLimit": 30,
            "rateWindowMs": 1000
        }
    },
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

`--config <path>` loads a different file, which is how a project keeps a separate
manifest for a second server.

## Fields

| Field | Default | Meaning |
| --- | --- | --- |
| `name` | required | Names the output folder and the resource `ensure` restarts. It never reaches `meta.xml` — MTA reads the name from the folder. |
| `author`, `version`, `description` | unset | `meta.xml` info attributes. |
| `sourceDirs` | `["src"]` | Scanned for `.luam` and `.d.luam` files. Other files here are copied but not declared. |
| `assetDirs` | `["assets"]` | Copied verbatim and declared as `<file>`, so clients download them. |
| `outDir` | `"build"` | Receives `<outDir>/<name>`. |
| `loadOrder` | `[]` | Source paths pinned ahead of their group in `meta.xml`. |
| `output.bundle` | `true` | Uses production bundles for `build`; `false` selects the tree layout. |
| `output.map` | `true` | Generates source position maps. Only `build` writes a map file. |
| `oop` | `false` | Enables the MTA OOP API and writes `<oop>true</oop>`. |
| `helpers` | `[]` | Runtime helpers to copy even when no feature requires them. |
| `serverPath` | unset | MTA server root. Required by `ensure` and `dev`. |
| `resourcesDir` | `"mods/deathmatch/resources"` | Resource directory relative to `serverPath`. |
| `transport` | `{ "kind": "none" }` | How `ensure` restarts the resource. |
| `development.logs` | disabled, safe limits | Client relay length and rate limits used by `dev`. |

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
  `config-unknown-helper`.

`helperDir` was removed. Tree output writes helpers to `lib/<environment>`;
bundle output includes them in its environment bundles. A `luam.json` that still names `helperDir` fails with
`config-unknown-field` — delete the line.

## `transport`

```json
{
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD",
        "refreshFunction": "refreshResources",
        "restartFunction": "restartResource"
    }
}
```

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
| No `luam.json` in the directory | `config-not-found` |
| The file is not valid JSON | `config-invalid-json` |
| `name` missing | `config-missing-field` |
| `name` is not a valid resource name | `config-invalid-name` |
| A field has the wrong type | `config-invalid-type` |
| A field is not recognized | `config-unknown-field` |
| A path escapes its base | `config-escaping-path` |
| `passwordEnv` names an unset variable | `config-missing-secret` |

Every code is listed in [Diagnostics](/en/reference/diagnostics).
