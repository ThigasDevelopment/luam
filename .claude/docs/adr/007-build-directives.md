# ADR-007: Build directives as contextual keywords that contribute to the manifest

**Status:** Accepted, partly superseded by
[ADR-008](008-generated-manifest-standard.md)

**Superseded:** Three parts.

*Directives are reserved words, not contextual keywords.* `KEYWORDS` in
`lexer/token.ts` is no longer the Lua 5.1 set: it now also holds the 10 words the
language adds, `export` among them. `local export = 1` is a syntax error, and
`isDirectiveStart` matches a `keyword` token rather than an identifier. The
position rule this ADR established is unchanged — `export` is a directive only
when followed by `function` at the top level. See the Reserved Words section in
[language-design.md](../language-design.md).

*The `setting` and `depends` directives are removed from the language.* The
project owner does not need `<setting>` or `<include>`, and keeping words that
produce nothing is worse than removing them. Both are ordinary identifiers
again, and no input can produce either element. `export` is unchanged, and the
contribution channel this ADR established stays — it carries `export` today and
is what a future directive would reuse.

*A shared export is one entry.* `<export type="shared" />` replaces the
`server` and `client` pair this ADR emitted. The duplicate-export check keeps
its shape: it still compares one entry per name per side, so a shared export
colliding with a per-side one is still `project-duplicate-export`.

**Context:**
An MTA resource is two artifacts that must agree: the Lua the server loads and
the `meta.xml` that describes it. Today the compiler owns `meta.xml` entirely
and derives every entry from facts it already has — the script list from the
module set, the environment from the path, the info block from `luam.json`.

A whole class of MTA features does not fit that shape, because the fact belongs
to a specific symbol in a specific file and only the author knows it. The
clearest case is `<export>`: MTA exposes a function to other resources through
`call()` only if `meta.xml` names it. Today the author would have to write the
function in Luam and then name it again somewhere else, in a file the compiler
generates and overwrites. The two halves drift the moment the function is
renamed, and neither the checker nor the LSP can see the relationship.

The same gap covers `<setting>`, `<include>`, and `<aclrequest>`: each is a
declaration about the resource that the author writes, that has no expression in
the language, and that no part of the pipeline can infer.

**Options considered:**
- **Build directives in the source** — contextual keywords such as `export`
  that mark a declaration and contribute an entry to the generated manifest.
  Pros: one place to write and rename; the checker can validate; the LSP can
  see it. Cons: grows the language surface for build-time concerns.
- **A hand-authored `meta.xml` fragment merged into the generated one.** Cons:
  reintroduces the drift the directive exists to remove, has no connection to
  the symbol it names, and is unverifiable — a typo in a function name is
  discovered by a caller at runtime.
- **Entries in `luam.json`.** Pros: no language change. Cons: the fact is a
  property of a function, and putting it in a project-wide config detaches it
  from the code, so a rename breaks the export silently.
- **Comment annotations, in the style of `---@export`.** Cons: a second
  declaration syntax parsed by a different path, invisible to the checker's
  symbol table, and impossible to complete or rename in the editor.

**Decision:**
Introduce build directives: source-level words that describe how a declaration
participates in the built resource. `export` is the first.

```luam
export function getPlayerScore(player: Player): number
    return scores[player] or 0
end
```

emits the function unchanged and adds `<export function="getPlayerScore"
type="server" />` to the manifest.

Five rules define the mechanism.

*Directives are contextual keywords, not reserved words.* `KEYWORDS` in
`lexer/token.ts` stays the Lua 5.1 set. `export` is a directive only in the
position that admits one — followed by `function` at the top level — exactly as
`class`, `interface`, `enum`, and `type` are already disambiguated by lookahead
in `isDeclarationStart`. A variable named `export` keeps compiling, and no
existing source breaks when a directive is added.

*Directives are erased.* A directive never changes the emitted Lua. `export
function f()` emits `function f() ... end`, byte for byte what the same function
without the directive emits. This also means an exported function must be a
global: MTA resolves `call()` against the resource's global table, so `export
local function` is a diagnostic rather than a silently broken export.

*A directive produces a contribution, not an effect.* Compiling a module yields
a list of manifest contributions alongside the code it already yields.
`assembleResource` merges the contributions of every module into the manifest.
The compiler still writes nothing; the CLI keeps ownership of I/O. This is what
makes the second directive cheap — it adds a contribution kind and a manifest
element, and touches nothing in between.

*Contributions are ordered deterministically.* The manifest is emitted as info,
scripts, exports, settings, includes, files — never in the order modules
happened to compile. Renaming a source file must not produce a manifest diff.

*A fact becomes a directive only when it is attached to a symbol or a file.*
Anything true of the resource as a whole — name, author, version, `oop`,
`min_mta_version` — stays in `luam.json`. This is the test to apply before
adding the next word.

The environment mapping follows the file's environment: a server file exports
`type="server"`, a client file `type="client"`, and a shared file emits both
entries, because the script itself is loaded on both sides and a caller on
either side can reach it.

**Resolved by milestone 10:**
- *The word is `depends`, not `include`.* The directive describes the
  relationship the author is stating; `<include>` is the manifest's spelling of
  it, and the mapping is the manifest layer's job. This also keeps the word
  usable when the manifest element is not literally `include`.
- *A `setting` is written to the manifest and read back through the MTA API.* No
  typed accessor in v1. Giving Luam a typed read means modelling the settings
  registry, which is a runtime feature rather than a directive detail.
- *Every `setting` carries the `*` prefix.* MTA uses it to mark a setting the
  client and other resources may read. A directive cannot opt out in v1; an
  opt-out needs syntax that carries an attribute, which is the same open
  question as `http="true"` below.
- *A directive nested in a block is a diagnostic, not a silently hoisted
  declaration.* `export` reports `check-export-not-top-level`; `setting` and
  `depends` report `check-directive-not-top-level`.
- *`depends 'name'` wins over the Lua call-with-a-string sugar.* A function named
  `depends` must be called with parentheses. This is the same trade the language
  already makes for `type`, `declare`, `class`, `interface`, and `enum`.

**Open questions:**
- Export attributes. MTA supports `http="true"`; the syntax that carries an
  attribute without turning the directive into a decorator is undecided, so
  v1 emits the default.
- Whether class methods can be exported. MTA exports plain functions, so an
  exported method would need a generated global wrapper — a real feature, not a
  directive detail.

**Consequences:**
- Positive: an exported function is written and renamed in one place, and the
  compiler is the only thing that writes `meta.xml`.
- Positive: mistakes that are silent in MTA become diagnostics — an export that
  is local, nested, or declared twice across the project.
- Positive: the LSP can complete, highlight, and eventually rename directives,
  because they are in the grammar rather than in comments.
- Positive: adding the next directive is additive; the pipeline between the
  parser and the manifest does not change again.
- Negative: the language grows words that mean nothing at runtime, and a reader
  must know that `export` is a build instruction rather than a scope modifier.
- Negative: contextual keywords cost lookahead in the parser and a rule in the
  grammar for every word added, and the error message for a near-miss
  (`export local function`) has to be written by hand.
- Negative: `CompileResult` and `CompiledModule` carry a new field, so the
  incremental cache must keep contributions with the cached module and the
  manifest must be rebuilt even when every module is reused.
