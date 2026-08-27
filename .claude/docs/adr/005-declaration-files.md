# ADR-005: Type verbatim Lua with `.d.luam` declaration files

**Status:** Accepted

**Context:**
[ADR-004](004-resource-configuration-and-environment-files.md) keeps
`config.lua` as plain Lua copied verbatim so its owner is the resource author
and not the compiler. The cost is that everything it exposes is `any`:
`Config.spawnPint` is `nil` at runtime with no diagnostic. The same gap covers
any handwritten Lua a resource carries — a vendored library, a snippet copied
from a community resource, a helper the developer prefers to keep in Lua.

The two obvious fixes both fail. Having the compiler parse and own the file
returns it to being generated output, which is what ADR-004 rejected. Adding
entries to `packages/mta-types` does not work either: that catalog is
TypeScript compiled into the compiler, so a project cannot extend it.

TypeScript solved this with `.d.ts` — a file that describes types for code the
compiler does not own, contributes nothing to the output, and is never shipped.
The same shape fits here, and Luam already has an extension convention from
[ADR-002](002-luam-source-file-extension.md) to hang it on.

**Options considered:**
- `.d.luam` declaration files — a source file holding declarations only,
  resolved by the checker and the LSP, emitting nothing.
- Annotations inside the Lua file, in the style of LuaLS `---@class` comments —
  Pros: the type sits next to the code it describes. Cons: a second type syntax
  to parse and keep aligned with Luam's own, inside files the compiler
  otherwise never reads.
- A JSON schema per file — Cons: a third way to write a type, unable to express
  what the language already expresses, and invisible to the LSP.

**Decision:**
Introduce `.d.luam`. A declaration file contains declarations only — no
statements, no expressions with effects — and describes symbols that exist at
runtime through some path the compiler does not control.

A declaration file produces no output. It is not compiled, not copied, and
never appears in the generated resource, exactly as its `.lua` counterpart in
`packages/runtime` is copied but never parsed. Discovery excludes `.d.luam`
from the `**/*.luam` glob that feeds the emitter and routes it to the checker
instead.

Declaration files take their environment from their path like every other
source file, through `environmentFromPath`. A `config.d.luam` under
`src/shared` declares shared symbols; one under `src/server` declares
server-only symbols and the checker rejects their use from a client file.

This also gives the `process.env` typing from ADR-004 a home that does not
require the project's environment keys to be baked into `packages/mta-types`.

**Resolved questions:**

- **Syntax.** A declaration file reuses the existing grammar — `class`,
  `interface`, `enum`, `type`, and `function` — and adds one statement,
  `declare <name>: <type>`, which binds a global to an annotated type. The type
  grammar is unchanged, so a table shape is written as an `interface` and
  attached with `declare`:

    ```luam
    interface ConfigShape {
        greeting: string
        spawn: SpawnPoint
    }

    declare Config: ConfigShape
    ```

  `declare` is rejected outside a `.d.luam` file
  (`check-declare-outside-declaration-file`), and a declaration file rejects any
  statement that would have an effect
  (`check-declaration-file-statement`).

- **What a declaration binds to.** A global name. Member access on the annotated
  type resolves through the normal member rules, so a misspelled member of an
  interface is `check-unknown-member`.

- **Discovery.** By extension, not by name pairing. A `.d.luam` file anywhere
  under `sourceDirs` is discovered by the same walk that finds `.luam`, routed
  to the checker, and excluded from emission. Nothing ties `config.d.luam` to
  `config.lua` beyond the author's naming.

- **Precedence.** The declaration wins for typing, and real source is checked
  against it. Assigning `RESOURCE_NAME = 1` where a declaration file says
  `declare RESOURCE_NAME: string` is `check-type-mismatch`. No separate conflict
  diagnostic exists: a declaration that describes a symbol the project also
  writes is the intended way to type it.

- **The record descriptor.** Introduced in ADR-004's implementation, not here.
  `declare` reaches table shapes through `interface`.

Declaration files export their globals to the rest of the project the way
classes, interfaces, and enums already do — through `AmbientDeclarations`, which
gained a `globals` list. Ordinary globals still cross module boundaries as
`any`; only `declare` contributes a type.

**Consequences:**
- Positive: `config.lua` keeps its owner and gains types, which ADR-004 treated
  as mutually exclusive.
- Positive: nothing is added to the generated resource, so a resource pays no
  size or load cost for being typed.
- Positive: a project can describe symbols the shipped catalog knows nothing
  about, without the catalog being extensible.
- Positive: environment checking applies to declared symbols through the
  mechanism that already exists.
- Negative: a declaration can drift from the Lua it describes, and nothing
  detects it. The compiler is asserting, not verifying.
- Negative: a second file to maintain beside the one being described.
- Negative: discovery, the LSP, and `luam check` all need to understand a file
  kind that emits nothing, which is a new concept in the pipeline.
