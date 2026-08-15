# Configuration fields

Every field `.luam.manifest` accepts. The **Required** column is the one the editor
shows beside each completion item. An unknown name is `config-unknown-field`, and a
field with the wrong type is `config-invalid-type`.

For the narrative version, see [.luam.manifest](/en/tooling/luam-manifest).

## Project

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `name` | `string` | yes | — | Resource name. Names `<outDir>/<name>` and the resource `ensure` restarts. Never written to `meta.xml`. Invalid values are `config-invalid-name`. |
| `author` | `string?` | no | unset | `meta.xml` info attribute. |
| `version` | `string?` | no | unset | `meta.xml` info attribute. |
| `description` | `string?` | no | unset | `meta.xml` info attribute. |

## Compiler options

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `compilerOptions.strict` | `boolean` | no | `true` | Project-wide strict mode. A `#!strict` or `#!nonstrict` directive still wins for the file that carries it. |
| `compilerOptions.oop` | `boolean` | no | `false` | Enables the MTA OOP API and writes `<oop>true</oop>`. See [OOP API](/en/mta/oop). |
| `compilerOptions.noUnusedLocals` | `boolean` | no | `false` | Reports a local that is never read as `check-unused-local`. |
| `compilerOptions.noUnusedParameters` | `boolean` | no | `false` | Reports a parameter that is never read as `check-unused-parameter`. |
| `compilerOptions.warningsAsErrors` | `boolean` | no | `false` | Promotes every warning to an error. |

A binding whose name starts with `_` is never reported as unused.

## Sources

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `sources.server` | `string[]` | no | `{ 'src/server/**/*.luam' }` | Patterns whose matches compile as server files. |
| `sources.client` | `string[]` | no | `{ 'src/client/**/*.luam' }` | Patterns whose matches compile as client files. |
| `sources.shared` | `string[]` | no | `{ 'src/shared/**/*.luam' }` | Patterns whose matches compile as shared files. |

A pattern accepts `*`, `**`, and `?`, with `/` as the separator. Regex, negation,
brace expansion, and extglobs are `config-invalid-pattern`. A file matched by two
sides is `config-source-side-conflict`, a literal path naming no file is
`config-missing-source`, and a project where no pattern matched is
`config-no-sources`. An environment directive in the file wins over the mapping
and reports `env-path-directive-conflict`.

## Assets

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `assets` | `{ from, to }[]` | no | `{ }` | Files to copy into the resource and declare as `<file>`. |
| `assets[].from` | `string` | yes | — | A path or pattern relative to the project root. A literal path naming no file is `config-missing-asset`. |
| `assets[].to` | `string` | no | `'.'` | Destination directory inside the resource. |

Two entries landing on the same destination, or a destination that would
overwrite `meta.xml` or `lib/`, are `config-output-collision`. Only what a
mapping names is copied.

## Dependencies and engine

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `dependencies` | `string[]` | no | `{ }` | Resources written as `<include resource="..." />`. Deduplicated and sorted. An invalid or self-referencing name is `config-invalid-dependency`. |
| `engine.minVersion` | `string` | no | `'latest'` | Becomes `min_mta_version`. `'latest'` looks the version up at build time; an explicit version keeps the build network-free. A malformed value is `config-invalid-engine-version`. |

Optional dependencies are not supported. `mta.minVersion` is not accepted.

## Environment files

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `environment.file` | `string` | no | `'.env'` | Declares the keys and types behind `env` and `process.env`, and the deployment template. |
| `environment.localFile` | `string` | no | `'.env.local'` | Overrides the values of keys the base file declares. A key only here is ignored. |

A configured file that does not exist is `config-missing-env-file`. The defaults
are optional, so a project without an environment file is not an error.

## Output

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `outDir` | `string` | no | `'build'` | Receives `<outDir>/<name>`. |
| `loadOrder` | `string[]` | no | `{ }` | Source paths pinned ahead of their group in `meta.xml`. An entry matching no file is `project-load-order-missing`. |
| `output.bundle` | `boolean` | no | `true` | Default layout for `build`: one bundle per non-empty environment when true, mirrored tree when false. `ensure` still defaults to tree and `dev` always uses tree. |
| `output.map` | `boolean` | no | `true` | Generates position maps. `build` writes one beside the resource; `ensure` and `dev` keep it in memory only. |
| `output.minify` | `boolean` | no | `true` | Writes each generated script on one line during `build`. `dev` and `ensure` never minify. |
| `helpers` | `string[]` | no | `{ }` | Runtime helpers to copy even when no feature requires them. Only the names below are accepted; anything else is `config-unknown-helper`. |

Every path must stay inside its base directory. An absolute path or a `..`
segment is `config-escaping-path`.

`--bundle` and `--no-bundle` override `output.bundle` where the command permits a
layout choice. `--no-map` overrides `output.map`, and `--minify` / `--no-minify`
override `output.minify`. See
[Output layouts and source maps](/en/reference/output-layouts).

Neither layout bundles `config.lua`, `.env`, or assets. `config.lua` and `.env`
stay at the resource root, while assets land where their mapping puts them. The
map file stays outside the resource under `outDir`.

Accepted helper names: `async`, `class`, `dotenv`, `env`, `math`, `string`,
`table`, `threads`. Most are injected automatically when a feature needs them;
`threads` is the one that is opt-in, and `env` is automatic when the project has
a `.env`.

## Server sync

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `serverPath` | `string?` | no | unset | MTA server root. Required by `ensure` and `dev`. |
| `resourcesDir` | `string` | no | `'mods/deathmatch/resources'` | Resource directory relative to `serverPath`. |

## Transport

The whole `transport` table is optional; omitting it is the same as `kind = 'none'`.
Writing the table without `kind` is `config-missing-field`.

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `transport.kind` | `'none' \| 'http'` | yes | — | `none` syncs without restarting. |
| `transport.host` | `string` | no | `'127.0.0.1'` | A non-loopback host reports `config-remote-plaintext-transport`. |
| `transport.port` | `number` | no | `22005` | MTA HTTP interface port. |
| `transport.resource` | `string` | for `http` | — | Resource exporting the refresh and restart functions. |
| `transport.username` | `string` | for `http` | — | HTTP basic authentication user. |
| `transport.passwordEnv` | `string` | no | — | Names an environment variable holding the password. Unset at run time is `config-missing-secret`. |
| `transport.password` | `string` | no | — | Inline password. Accepted, but reports `config-plaintext-password`. |
| `transport.refreshFunction` | `string` | no | `'refreshResources'` | Called first. |
| `transport.restartFunction` | `string` | no | `'restartResource'` | Called with the resource name. |

`host`, `resource`, `refreshFunction` and `restartFunction` become part of the
request URL and are validated before any request is sent. A value containing `/`,
`?`, `#` or `..` is `config-invalid-url-segment`.

A `kind` that is neither `'none'` nor `'http'` is `config-invalid-transport`.

## Development logs

Used by `luam dev` only.

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `development.logs.enabled` | `boolean` | no | `false` | `dev` enables capture even when the section is omitted. |
| `development.logs.maxMessageLength` | `number` | no | `4096` | Longer relayed records are rejected. |
| `development.logs.rateLimit` | `number` | no | `30` | Records allowed per client per window. |
| `development.logs.rateWindowMs` | `number` | no | `1000` | Length of that window, in milliseconds. |

## Removed fields

A removed name is rejected, never aliased. Each reports `config-removed-field`
and names its replacement.

| Field | Replacement |
| --- | --- |
| `oop` | `compilerOptions = { oop = true }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }` |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }` |
| `mta` | `engine = { minVersion = '1.6.0' }` |
| `helperDir` | Nothing. Tree helpers use `lib/<environment>`; bundled helpers live inside environment bundles. Reports `config-unknown-field`. |

Hooks, plugins, regular expressions, and optional dependencies are not supported
and have no replacement.

## Environment variables

| Variable | Effect |
| --- | --- |
| `LUAM_OFFLINE` | Skips the `min_mta_version` lookup, like `--offline`. |
| `NO_COLOR` | Turns colour and emoji off, like `--no-color`. |
| the name in `transport.passwordEnv` | Supplies the transport password. |
