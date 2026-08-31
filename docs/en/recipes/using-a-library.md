# Using a library

A project that lists an installed Luam library, extends a class it declares, and
ships the library inside its own resource.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- Node and a package manager, which the CLI already required.

## File tree

```
luam-docs-using-a-library/
├── .luam.manifest
├── package.json
├── node_modules/
│   └── @luam-example/collections/   installed by the package manager
└── src/
    └── shared/lobby.luam
```

## Install the library

```bash
npm install @luam-example/collections
```

Installing is the developer's step. `build`, `check`, `ensure`, `dev` and `test`
only read `node_modules` from disk, so a machine with no network and a populated
`node_modules` builds exactly the same output.

## Source

<<< @/snippets/using-a-library/.luam.manifest{js}

<<< @/snippets/using-a-library/src/shared/lobby.luam

The library itself is an ordinary npm package. Its `package.json` declares the
layout the compiler reads:

<<< @/../examples/library/package.json{json}

<<< @/../examples/library/src/queue.luam

It also ships one verbatim Lua file with a declaration file beside it, so the
consumer gets types for code the compiler does not own:

<<< @/../examples/library/src/format.lua{lua}

<<< @/../examples/library/src/format.d.luam

## Why this works

`libraries` names what the build may read. The compiler resolves the package from
`node_modules`, compiles its sources with the project, and puts its top-level
names in the same flat namespace, so `Queue` and `formatCount` are visible to
`lobby.luam` with no import. The library's own types are its source, so
`self.size()` is checked, and a library that does not type-check fails this
build.

Visibility is one way: the project sees the library, the library never sees the
project.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/using-a-library.check.txt{text}

Three files compiled: two from the library, one from the project.

In the default bundle layout the library's modules are concatenated into the
environment bundle ahead of the project's own. In tree layout — `--no-bundle`, or
`output = { bundle = false }` — they are vendored under `libs/`, with the scoped
name flattened:

```
lib/class.lua
lib/string.lua
libs/luam-example-collections/shared/src/queue.lua
libs/luam-example-collections/shared/src/format.lua
src/shared/lobby.lua
```

and `meta.xml` enumerates them, after the runtime library and before the source
wildcards:

```xml
<!-- Runtime library -->
<script src="lib/class.lua" type="shared" cache="false" />
<script src="lib/string.lua" type="shared" cache="false" />
<!-- Libraries -->
<script src="libs/luam-example-collections/shared/src/queue.lua" type="shared" cache="false" />
<script src="libs/luam-example-collections/shared/src/format.lua" type="shared" cache="false" />
<!-- Source scripts -->
<script src="src/shared/**/*.lua" type="shared" cache="false" />
```

The class runtime is emitted because the library needs it, even though the
project's own file would not have asked for it on its own.

## A common error

Listing a package that is not installed stops the build before it writes
anything:

```
error config-library-missing: "@luam-example/collections" is listed in "libraries" but is not installed. Install it with "npm install @luam-example/collections" and build again.
```

The compiler never fetches. Run the install command and build again.

## Next

- [Libraries](/en/tooling/libraries) — writing one, and the rules a library
  author has to know.
- [Exports](/en/language/exports) — the other answer, for code that should keep
  running in its own resource.
