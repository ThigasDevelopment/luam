# Luam Template

`@luam/template` holds the starter `luam.json` that `luam init` writes. That is
the entire package.

`luam init` scaffolds a manifest and nothing else: no framework, no example
sources, no tree to delete before writing your own first file. A build ships
exactly what the project authored.

The package ships source, not compiler logic.

## Layout

| Path | Contents |
| ---- | -------- |
| `files/luam.json` | The starter manifest, the only file `luam init` writes. |
| `src/template.ts` | The file catalog: target path, kind, and source location. |

`packages/cli` reads the catalog and copies each entry into the new project,
rendering `luam.json` with the resolved resource name.

## Not here

The `Core` / `Loader` / `Event` / `Listener` / `Command` / `ThreadPool` sketch
lives in `examples/framework` at the repository root. It is reference material
for how an MTA resource can structure itself in Luam — it is not part of the
language, the compiler, or anything `luam init` writes.
