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

## Sources and output

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `sourceDirs` | `string[]` | no | `{ 'src' }` | Scanned for `.luam` and `.d.luam`. Other files here are copied but not declared. A configured directory that does not exist is `build-source-dir-missing`. |
| `assetDirs` | `string[]` | no | `{ 'assets' }` | Copied verbatim and declared as `<file>`, so clients download them. |
| `outDir` | `string` | no | `'build'` | Receives `<outDir>/<name>`. |
| `loadOrder` | `string[]` | no | `{ }` | Source paths pinned ahead of their group in `meta.xml`. An entry matching no file is `project-load-order-missing`. |
| `output.bundle` | `boolean` | no | `true` | Default layout for `build`: one bundle per non-empty environment when true, mirrored tree when false. `ensure` still defaults to tree and `dev` always uses tree. |
| `output.map` | `boolean` | no | `true` | Generates position maps. `build` writes one beside the resource; `ensure` and `dev` keep it in memory only. |

Every path must stay inside its base directory. An absolute path or a `..`
segment is `config-escaping-path`.

`--bundle` and `--no-bundle` override `output.bundle` where the command permits a
layout choice. `--no-map` overrides `output.map`. See
[Output layouts and source maps](/en/reference/output-layouts).

Neither layout bundles `config.lua`, `.env`, or assets. `config.lua` and `.env`
stay at the resource root, while assets retain their authored paths. The map file
stays outside the resource under `outDir`.

## Language and runtime

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `oop` | `boolean` | no | `false` | Enables the MTA OOP API and writes `<oop>true</oop>`. See [OOP API](/en/mta/oop). |
| `helpers` | `string[]` | no | `{ }` | Runtime helpers to copy even when no feature requires them. Only the names below are accepted; anything else is `config-unknown-helper`. |

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

| Field | Status |
| --- | --- |
| `helperDir` | Removed. Tree helpers use `lib/<environment>` and bundled helpers live inside environment bundles. A manifest that still names it fails with `config-unknown-field`. |

## Environment variables

| Variable | Effect |
| --- | --- |
| `LUAM_OFFLINE` | Skips the `min_mta_version` lookup, like `--offline`. |
| `NO_COLOR` | Turns colour and emoji off, like `--no-color`. |
| the name in `transport.passwordEnv` | Supplies the transport password. |
