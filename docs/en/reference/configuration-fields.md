# Configuration fields

Every field `.luam.manifest` accepts. The table below is generated from the same
catalog the checker, the editor and the build read, so it cannot drift from what
the tool enforces. The **Required** column is the one the editor shows beside each
completion item. An unknown name is `config-unknown-field`, and a field with the
wrong type is `config-invalid-type`.

For the narrative version, see [.luam.manifest](/en/tooling/luam-manifest).

## The five sections

A manifest is one table constructor whose top-level keys are `info`,
`environment`, `scripts`, `files` and `build`. Nothing else is a section.

<!--@include: ../../generated/manifest-fields.en.md-->

A `scripts` entry declares its own side, so a file is typed by the entry that
matched it and not by the directory it sits in. A `files` entry is a bare path
that reaches `<file src>` exactly as written.

A pattern accepts `*`, `**` and `?`, with `/` as the separator. Regex, negation,
brace expansion and extglobs are `config-invalid-pattern`. A path that escapes the
project is `config-escaping-path` — except `build.output`, which may be absolute
and may leave the project.

## The workspace file

A directory of resources names its shared MTA installation once in
[`.luam.server`](/en/reference/server-file):

| Field | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `serverPath` | `string` | **yes** | — | MTA server root, resolved against the directory holding the file. |
| `resourcesDir` | `string` | no | `'mods/deathmatch/resources'` | Resource directory relative to `serverPath`. |
| `executable` | `string?` | no | platform probe | Executable relative to and contained by `serverPath`. |

## Removed fields

A removed name is rejected, never aliased. Each reports `config-removed-field` and
names its replacement. The second table above lists every one of them.

Hooks, plugins, regular expressions, and optional dependencies are not supported
and have no replacement.

## Environment variables

| Variable | Effect |
| --- | --- |
| `LUAM_OFFLINE` | Skips the `min_mta_version` lookup, like `--offline`. |
| `NO_COLOR` | Turns colour and emoji off, like `--no-color`. |
