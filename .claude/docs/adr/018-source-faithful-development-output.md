# ADR-018: Emit source-faithful Lua in development builds

**Status:** Accepted

**Context:**
`luam dev` writes unminified Lua that a developer reads directly, and MTA reports runtime errors against that file. The generated output is therefore a debugging surface, not only a build artifact.

[ADR-011](011-source-position-mapping.md) made a generated position resolvable by recording a line map. Source-preserving emission then went further and kept most statements on their authored lines. This decision closes the remaining gap: a position that resolves is not the same as a file a developer can read.

Measuring a representative sample shows that line alignment is already preserved. A 25-line source produced 25 lines of Lua: `canonicalEdits` pads a shrinking statement with blank lines, `emit` receives a `sourceLineOffset` so canonical statements land on their authored lines, and erased declarations are blanked in place rather than removed. Generated positions also already resolve back to source positions through the resource map, `luam trace`, and the automatic rewriting `luam dev` applies to MTA console records.

Several constructs already emit exactly the requested form. `new Example ()` becomes `new 'Example' ()`, a class header becomes `class 'Example' {`, a preserved call keeps its authored layout, and a top-level `count += 1;` becomes `count = count + 1;` on its own line with the semicolon intact.

What diverges is the shape of three constructs:

- An `interface` is blanked to empty lines, so the contract disappears from the file a developer is reading.
- An `enum` is always emitted on one line, regardless of how it was authored.
- A `class` body is re-emitted canonically, which normalizes the author's spacing and drops the semicolons written inside it. The header and the closing line already match.

A fourth construct drifts for a different reason. Lowering `continue` wraps the loop body in `repeat ... until true`, and both scaffolding keywords take a line of their own, so every loop containing a `continue` grows. A simple loop gains one line, a loop that also contains a `break` gains three because of the `__luam_break` sentinel, and a single-line loop grows from one line to five. The lowering itself is sound: the sentinel preserves the meaning of the author's `break`, and the checker already rejects the one case the wrapping would break, a `continue` that would hide from an outer `until` condition a local declared in the body.

The first two follow from `class-declaration` and `enum-declaration` falling through to `default: return false` in `canPreserveStatement`, and from erasures being blanked with a whitespace replacement. The third follows from canonical replacement being applied per top-level statement rather than per lowered sub-statement, which is also why a compound assignment nested inside an `addEventHandler` reformats the entire handler while the same assignment at top level does not.

Measuring also exposed a defect that is independent of formatting. An erased declaration terminated with `;` leaves the semicolon behind, so `interface I { name: string };` emits a bare `;` with no preceding statement. Lua 5.1 has no empty statement in its grammar, which makes that output invalid for the targeted runtime, and no diagnostic reports it. The same applies to a `type` alias and to any other erased declaration written with a trailing semicolon.

**Requirement:**
The generated Lua is the source file with the Luam-specific constructs removed or lowered, and nothing else changed. Everything Lua 5.1 already accepts is copied through unchanged: indentation, blank lines, the space before a parenthesis, and the semicolons the author wrote. Only what belongs to Luam and not to Lua is rewritten, which is the type annotations, the compound assignments, the native extensions, and the class, enum, and interface declarations. A declaration that has no runtime form remains visible as a Lua block comment over its original span instead of becoming blank lines, semicolon included. An inline type annotation is erased outright: it is noise in the generated Lua, not a contract a reader needs.

A rewritten construct occupies the same lines as the construct it replaces, so a position reported by MTA against the generated file names the same line in the source.

**Constraint on the enum form:**
The requested multi-line enum must keep its member names quoted. The runtime helper assigns `values[names[index]] = index - 1`, so each element is used as a table key. Unquoted `LOBBY` is an undeclared global that evaluates to `nil`, which makes `{ LOBBY }` a table of length zero and produces an enum with no members, failing silently at every read. The target form is therefore a multi-line table of string literals, which satisfies both the line fidelity and the runtime contract.

**Options considered:**
- Rely on the resource map, `luam trace`, and the console rewriting already in place. This costs nothing and already resolves error positions, but it does not make the generated file readable and does not help a developer who opens the Lua directly.
- Ship a richer source map and resolve positions in the editor. This improves navigation without improving the artifact, and MTA console output is still consumed as plain text outside the editor.
- Extend source-preserving emission to cover erased declarations, `class`, and `enum`, and gate the behavior to development builds. This satisfies the requirement and leaves release output untouched, at the cost of a second output form and a per-construct surgical emitter.
- Apply source-faithful emission in every build. This keeps a single output form, but it ships authored whitespace and commented-out contracts in client files that every player downloads, which the minifier would then have to remove.

**Decision:**
Extend source-preserving emission and gate it to builds that write readable Lua.

The gate is not a manifest field. `output.minify` already states whether the
output is meant to be read, so `luam build` derives the mode from the resolved
`minify` and `luam dev` and `luam ensure` are always in it because they never
minify. The compile boundary carries an explicit `development` flag so that the
emitter never reads a write-layer concern; deriving it is the CLI's job.

The same rule reaches a build directive. `#!client` steers the compiler and has no runtime form, so it becomes `--!client` on its own line rather than a blank one: `#` is the comment marker in Luam and `--` is its Lua spelling, so the directive text survives verbatim and no special case is needed in the replacement.

Replace the whitespace blanking of an erased declaration with a Lua long-bracket comment spanning the same offsets, reusing the existing bracket-padding logic in `commentReplacement` so that a nested closing bracket cannot terminate the comment early. The trailing semicolon is absorbed into the comment rather than blanked, so `type CustomType = string;` becomes `--[[type CustomType = string;]]`. This applies to whole declarations only. An inline type annotation carries no declaration a reader needs to keep, so it stays erased and the signature reads as plain Lua. Erasure spans nest, because an annotation inside an interface body has a span of its own inside the declaration span; the existing normalization in `sourceEdits` already drops a contained span and rejects a partially overlapping one, so nesting needs no new rule. Give `class-declaration` and `enum-declaration` surgical edits instead of canonical replacement, so that an authored multi-line `enum` stays multi-line over its own lines and a `class` keeps its body spacing while still receiving the `self` parameter, the quoted name, and the member separators. A decorated class stays on the surgical path: each decorator line is prefixed with `--` so the annotation survives as a line comment on its authored line, the members a decorator generates are injected in compact single-line form before the closing brace, and a `@Builder` companion class is appended to the closing line, so the decorator mechanics reach the output without adding a line. A `@Lazy` field must drop its initializer from the table, so the whole field becomes a long-bracket comment over its own lines and its lazy accessor joins the compact injection. A decorator sharing a line with the declaration it binds to would be commented out together with the code that follows it, so the parser rejects that form outright with `parse-decorator-line`: a decorator line ends after its last decorator, which keeps every decorated class on the surgical path. Narrow canonical replacement from the enclosing top-level statement to the lowered sub-statement, so an isolated compound assignment stops reformatting its whole handler. Fold the `continue` scaffolding onto lines the loop already occupies, placing `repeat` at the start of the loop body's first line and `until true` at the end of its last line, together with the sentinel declaration and its test, so that lowering a `continue` adds no line and the loop's own header and `end` are copied through unchanged. Keep `continue` in the language: the drift is a placement problem in the emitter, not a defect in the construct. Repair the orphan semicolon in every build, since it produces invalid Lua 5.1 rather than merely unpleasant Lua.

Keep the release path unchanged. The development and release distinction already exists at the CLI write layer, where `build` passes `minify` through `productionWriteOptions` and `dev` does not; the emitter needs the same distinction reaching it through the compile options.

**Consequences:**
- Positive: the file a developer reads during `luam dev` matches the file they wrote, which makes both reading and diffing the generated Lua meaningful.
- Positive: contracts that exist only at compile time remain visible at their original location instead of leaving unexplained gaps.
- Positive: an invalid Lua 5.1 emission is removed from every build, not only development ones.
- Negative: two output forms must be tested, which roughly doubles the snapshot surface for the affected constructs.
- Negative: surgical editing of a class must reproduce every lowering the canonical emitter performs, including the implicit `self` parameter, generated members, the builder, and inheritance, which is more places to diverge than a single emitter.
- Negative: comments carrying source text must never reach a release build, so the gate needs a test that asserts their absence.
- Negative: a loop containing a `continue` carries its scaffolding on the first and last lines of its body, which makes those two lines denser than what the author wrote, and denser still when a `break` shares the loop. The loop's own header and `end` are untouched, which is what keeps the construct recognizable.
- Negative: a multi-line enum keeps quoted members, so the generated form stays close to but not identical to the authored member list.
