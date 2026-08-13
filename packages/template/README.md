# Luam Template

`@luam/template` holds the starter `.luam.manifest` that `luam init` writes. That is
the entire package.

`luam init` scaffolds a manifest and nothing else: no framework, no example
sources, no tree to delete before writing your own first file. A build ships
the authored resource as one bundle per non-empty environment by default, while
`config.lua`, `.env`, and assets keep their own paths. The generated source map
stays beside the resource rather than inside it.

> **User documentation:**
> [Quick start](https://thigasdevelopment.github.io/luam/en/guide/quick-start) ·
> [Project layout](https://thigasdevelopment.github.io/luam/en/guide/project-layout)
> · [em português](https://thigasdevelopment.github.io/luam/pt-br/guide/quick-start).

The package ships source, not compiler logic.

## Layout

| Path | Contents |
| ---- | -------- |
| `files/luam.manifest` | The starter manifest. `luam init` writes it as `.luam.manifest`, and it is the only file it writes. |
| `src/template.ts` | The file catalog: target path, kind, and source location. |

`packages/cli` reads the catalog and copies each entry into the new project,
rendering `.luam.manifest` with the resolved resource name.

## Not here

The `Core` / `Loader` / `Event` / `Listener` / `Command` / `ThreadPool` sketch
lives in `examples/framework` at the repository root. It is reference material
for how an MTA resource can structure itself in Luam — it is not part of the
language, the compiler, or anything `luam init` writes.
