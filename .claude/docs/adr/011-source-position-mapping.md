# ADR-011: Generated positions map back to `.luam` through a line map

**Status:** Accepted

**Context:**
ADR-003 states that a path in a runtime error maps to an authored file by
changing one extension. That is true of the path. It is not true of the line.

The emitter does not carry source positions into its output. It walks the tree
and appends one line per emitted statement, so blank lines, comments, and every
multi-line construct that collapses shift everything after them. The
`control-flow.luam` fixture shows it directly: the `for` loop authored on line 4
is emitted on line 2 of the generated Lua. The offset is unbounded — it grows
with every blank line and every collapsed construct above the error.

So a developer reading `[resource:src/server/shop.lua:42]` today gets the right
file and a line that is merely near the right one. In a small module the drift
is a few lines and the eye closes the gap. In a large module it is not.

[ADR-010](010-bundled-production-output.md) makes this worse in production: the
line is now an offset into a bundle, and the file name no longer identifies the
module at all.

Both problems are the same problem. A generated position is meaningless on its
own; something has to hold the correspondence between it and the authored
position. Nothing does.

MTA offers no hook here. It reports positions from the Lua chunk it loaded, and
it will keep doing that. The correspondence has to be recorded at emit time and
applied by the tool that reads the message.

**Options considered:**
- Replace the map by padding generated output so every statement lands on its
  source line — a position is correct by construction until a construct emits
  more lines than it occupies in source. Rejected as a replacement for mapping;
  later production minification makes monotonic padding useful in readable
  output without increasing shipped scripts.
- Emit `--[[ src/server/shop.luam:57 ]]` before each statement — readable
  without tooling, and it inflates every shipped file with the structure ADR-010
  set out to remove.
- Record a line map at emit time and resolve positions in the CLI — the shipped
  output carries nothing, and a position is exact wherever the map is available.

**Decision:**

*The emitter produces a line map for every module.* `EmitResult` gains `lines`,
a sparse list of `[generatedLine, sourceLine]` pairs recorded where the
correspondence changes. A generated line with no pair inherits the last pair
above it. The map is per module, in module-local line numbers, and it is
produced in both layouts, because it fixes a gap that exists in both.

*Readable output preserves authored text when possible.* The parser records the
source spans of type annotations, compile-only declarations, export modifiers,
and top-level statements. The compiler applies erasures directly to the source,
translates Luam comment delimiters to Lua delimiters, and preserves all other
bytes, including whitespace, quotes, semicolons, and multiline expression
layout. A top-level statement containing a construct that requires lowering is
replaced as one canonical region; neighboring statements remain authored. Each
replacement carries its local line mappings, and assembly shifts subsequent
mappings by the region's actual expansion or contraction. Production
minification removes this formatting.

*Segments carry the enclosing symbol.* A pair may carry the name of the function,
method, or class body it was emitted inside — `Shop:buy`, `onPlayerJoin`. This
is the second half of what a developer reads off a stack trace, and the emitter
already knows it at the point the pair is recorded.

*The map travels with the build, never inside the resource.* `luam build` writes
`<outDir>/<name>.luam-map.json` beside the resource directory, not in it. The
shipped resource is unchanged by the existence of the map, which is what keeps
ADR-010 honest. `luam ensure` and `luam dev` keep the map in memory only; there
is no reason to write a file the running process already holds.

*The map composes.* A bundle segment records the module it came from and the
bundle line its `do` block starts at, so a bundle position resolves in two
steps: bundle line to module and module-local line, then module-local line to
`.luam` line and symbol. The `tree` layout uses the second step alone.

*Two consumers.* `luam dev` resolves positions as it prints them, so a log line
reads `src/server/shop.luam:57 in "Shop:buy"` rather than
`src/server/shop.lua:42`. `luam trace <file>:<line>` resolves a position pasted
from a production server against a map file, offline, with no project state
beyond the map itself.

*The map format is versioned and diffable.* A `version` field, paths relative to
the project root, sparse pairs, and stable ordering, so a map committed
alongside a release is reviewable and a future format change is detectable
rather than silently misresolved.

**Consequences:**
- Positive: a line reported by MTA becomes the line the developer wrote, in both
  layouts, which is the first time that has been true.
- Positive: ordinary readable modules preserve authored formatting physically,
  so generated Lua and raw MTA output remain easy to inspect.
- Positive: a stack trace from a production server stays resolvable, so ADR-010
  costs nothing in debuggability as long as the map for that build is kept.
- Positive: the resource ships no position metadata at all.
- Negative: resolution depends on keeping the map that matches the deployed
  build. A lost map means a bundle position stays a bundle position, and a map
  from a different build resolves confidently to the wrong line.
- Negative: the emitter gains line bookkeeping on a path that currently only
  concatenates strings, and the project cache has to carry and invalidate the
  map with the module.
- Negative: compile-only declarations and directives leave blank lines in
  source-preserving output so later authored positions do not move.
- Negative: the map is another artifact to write, version, and document, and it
  grows roughly with the module's line count.
- Negative: minification is now permanently out of reach without extending the
  map to columns and renamed identifiers.
