# ADR-002: Use `.luam` as the source file extension

**Status:** Accepted

**Context:**
Milestone 3 resolves environments from file paths and Milestone 4 discovers
source files for `build`, `check`, and `ensure`, so the compiler has to know
which files are its input before either lands. Luam source is typed Lua: it
parses as Lua only until the first annotation, `class` body, or template
string. The build writes Lua 5.1 next to (or into) a resource, so generated
output and source can share a tree. The language is named Luam and gets its own
LSP and editor extension in Milestone 5, which need something to bind to.

**Options considered:**
- `.luam` — a dedicated extension. Pros: discovery is an unambiguous
  `**/*.luam` glob, generated `.lua` output can never be read back as input,
  and the LSP and TextMate grammar bind to the extension without hijacking
  plain Lua files in the same workspace. Cons: no editor highlighting until the
  Luam extension ships, and tooling that assumes `.lua` needs configuration.
- `.lua` — reuse the Lua extension. Pros: existing Lua highlighting works
  immediately. Cons: source and generated output are indistinguishable, so
  discovery needs a path convention or a manifest to avoid compiling its own
  output; a Lua language server in the same workspace reports every annotation
  as a syntax error; and the Luam LSP cannot claim `.lua` without breaking
  handwritten Lua.
- A shared extension such as `.tl` — Cons: `.tl` belongs to Teal, and any
  borrowed extension confuses tooling that already recognizes it.

**Decision:**
Luam source files use `.luam`, and the editor language id is `luam`. The build
always emits `.lua`: `src/server/main.luam` becomes `main.lua` in the generated
resource. Handwritten Lua 5.1 that is not compiled — the runtime helpers in
`packages/runtime/lua` and any file copied verbatim into a resource — keeps
`.lua`. Test fixtures under `packages/compiler/tests/fixtures` are Luam source
and use `.luam`.

**Consequences:**
- Positive: file discovery is a glob, and the compiler can never read its own
  output as input.
- Positive: the LSP, the TextMate grammar, and the VS Code activation event all
  key off one extension, and a workspace can hold Luam and plain Lua side by
  side.
- Positive: environment resolution from `src/server/**`, `src/client/**`, and
  `src/shared/**` only has to consider `.luam` files.
- Negative: `.luam` files have no syntax highlighting until the editor
  extension from Milestone 5 is installed.
- Negative: external Lua tooling (linters, formatters, CI actions) has to be
  pointed at the extension or excluded.
