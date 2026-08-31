# Libraries

A Luam library is an npm package that ships Luam source. The package manager
fetches it; the compiler reads it from disk and compiles it into the resource
that uses it.

Nothing about it is hosted by Luam. There is no registry, no index, and no
`luam add`: the primitive is the install command the project already runs, and
the manifest field that names what the build may read.

## Consuming one

Install the package, then name it in `libraries`:

```bash
npm install @luam-example/collections
```

```luam
libraries = { '@luam-example/collections' }
```

The build then reads the package from `node_modules`, checks it with the project,
and vendors its output into the resource. Presence in `node_modules` is never
enough on its own — a package the manifest does not name is not compiled, because
a build is a function of reviewed files rather than of install state.

See [`libraries`](/en/tooling/luam-manifest#libraries) for the field, the
ordering rule, and how it differs from `dependencies`.

## Authoring one

A library is an ordinary npm package whose `package.json` carries a `luam` field:

```json
{
    "name": "@luam-example/collections",
    "version": "0.1.0",
    "keywords": ["luam"],
    "luam": {
        "sources": {
            "shared": ["src/**/*.luam", "src/**/*.lua"]
        },
        "requires": []
    }
}
```

`sources` takes the same three sides the project manifest takes — `server`,
`client`, `shared` — and the same `*`, `**`, `?` patterns. Patterns are relative
to the package root and may not leave it: one that resolves outside is
`config-library-escape`, so a library can never reach into the tree of the
project that consumes it.

Files are emitted in the order the field declares them: side by side in the order
`shared`, `server`, `client`, each side's patterns in the order they are listed,
and paths sorted inside one pattern. That is the order the checker uses too, so
what type checked and what the resource loads agree.

### What a library may ship

- `.luam` compiled from source. Its types are its source; there is no summary to
  publish and nothing that can drift from it.
- `.lua` copied verbatim, for code the compiler does not own.
- `.d.luam` declaration files that give that verbatim Lua its types. A
  declaration file emits nothing, exactly as it does in a project.

### The library owns its environment

The side a file runs on comes from the `luam` field, per pattern. A consumer
cannot reassign it, and a `#!` directive inside a library file that disagrees
with the declaration is `env-library-directive`. Once resolved, a library file is
an ordinary file of that side: a `server` symbol used from a client file is the
same [environment error](/en/mta/environments) any project file would get.

### Every top-level name becomes a global

MTA has one flat global namespace per side, so every top-level name a library
declares is a global in every resource that uses it. That is the one fact to know
before choosing names.

- Two libraries that declare one name on one side are
  `project-library-collision`, and so is a library that declares a name a project
  file declares. The compiler reports the collision; it does not resolve it, and
  a consumer's repair is to stop using one of the two.
- A library that declares a name the MTA API defines is
  `project-library-shadows-api`, a warning rather than an error, because wrapping
  an MTA function on purpose is a legitimate thing for a library to do.

Prefix or otherwise qualify the names a library exposes.

### A library sees only itself

Visibility is one way. A project file sees the globals of every library it lists;
a library file sees only its own package and the libraries it requires. A library
that reads a consumer's global is `project-library-project-reference` — it is not
a library at that point, it is a fragment of one project.

### Requirements are declared, never walked

A library that needs another library names it:

```json
{
    "luam": {
        "sources": { "shared": ["src/**/*.luam"] },
        "requires": ["mta-async"]
    }
}
```

Luam reads the packages the manifest names and stops. A requirement the consumer
did not list is `config-library-requirement-missing`, naming the package and the
install command; the developer adds it and builds again. There is no transitive
resolution, deliberately: two versions of one library cannot coexist in a flat
Lua namespace, so a resolver would only produce conflicts it could not settle.

## Where the code lands

In tree layout a library compiles to `libs/<package>/<environment>/`, mirroring
its own source tree beneath it, beside the `lib/<environment>/` runtime helpers.
A scoped name is flattened — `@scope/name` becomes `scope-name` — so no `@` and
no nested directory reaches an MTA path. In bundle layout its modules are
concatenated into the environment bundle ahead of the project's own.

Library scripts are enumerated `<script>` entries in `meta.xml`, never wildcards,
after the runtime library and before `config.lua`, the pinned `loadOrder` entries
and the source wildcards. A `loadOrder` entry that names a library file is
`project-load-order-library`: the emission order is the one `libraries` declares.

A helper a library needs — the class runtime, the string extensions — is emitted
once and first, from the same requirement set a project's own code feeds.

## Libraries and exports

Both answers exist and they are orthogonal.

| | Library | [Export contract](/en/language/exports) |
| --- | --- | --- |
| What crosses | Source, at compile time | A call, at run time |
| Where the code runs | Inside the consuming resource | Inside the providing resource |
| Manifest field | `libraries` | `dependencies` |
| Fits | A pure module — a queue, a formatter, a maths helper | A stateful service — a bank, a vehicle registry |

A project routinely does both.

## Boundaries

- A library ships code. Copying a library's images or other assets into the
  resource is not part of the model.
- A library is vendored, so every consuming resource carries its own copy. Two
  resources that use one library ship it twice; when that matters, the export
  contract is the answer.
- npm install scripts run with the developer's privileges before the compiler is
  involved. That is the package manager's boundary, not the compiler's — the
  compiler compiles library source and never executes it.
