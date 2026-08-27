# ADR-013: `luam build` emits one-line Lua through a lexical minifier

**Status:** Accepted

**Amends:** [ADR-010](010-bundled-production-output.md) and
[ADR-011](011-source-position-mapping.md). ADR-010 stopped at one script per
environment and left the script itself formatted. ADR-011 closed with
"minification is now permanently out of reach without extending the map to
columns and renamed identifiers." That sentence is right about identifier
renaming and wrong about whitespace, and this ADR separates the two.

**Context:**
ADR-010 made the production resource three scripts instead of a mirrored tree.
Each of those scripts is still emitted the way the developer would want to read
it: one statement per line, indentation, and the `do ... end` guards the bundle
adds. MTA downloads client scripts to every joining player, so the bytes are
paid for on every connect, and the formatting is bytes nobody reads — the
production artifact is generated, and the readable copy is one `luam ensure`
away.

The obvious implementation is a set of regular expressions over the emitted
text. It is also wrong. `--` inside a string is not a comment. `]]` inside a
short string is not the end of a long bracket. A pattern that strips comments
without lexing will corrupt `local pattern = "--%s"`, and a pattern that
collapses whitespace without lexing will corrupt every multi-line string in the
resource. The transformation is only safe if it knows what a token is.

Identifier renaming is a different question with a different answer. It buys
real bytes, and it destroys the one thing ADR-011 built: the enclosing symbol in
the line map is the name the developer wrote, and a renamed `Shop:buy` resolves
to a name that appears in no source file. Whitespace removal costs the line
correspondence, which is recoverable; renaming costs the symbol, which is not.

**Options considered:**
- Regular expressions over the emitted text. Cheapest to write, and it cannot
  distinguish a comment from a string, so it is not a candidate.
- Parse to an AST and re-print. Correct, and it duplicates a Lua parser the
  project does not otherwise need in order to throw the tree away immediately.
- A Lua 5.1 token scanner and a joiner that inserts the smallest separator two
  adjacent tokens require. Correct for the same reason a parser is — it lexes —
  and it is one pass with no tree.

**Decision:**

*A lexical minifier, not a textual one.* A Lua 5.1 scanner recognises
identifiers, keywords, numbers, short strings, long bracket strings, line
comments, long bracket comments, and operators. Comments are dropped.
Everything else is emitted with its bytes unchanged, so string contents survive
exactly. The joiner inserts a single space only where concatenating two tokens
would change how Lua lexes them — `local x` stays two tokens, `a - -b` does not
become a comment, `1 .. 2` does not become a malformed number, and `t[ [[s]] ]`
does not become a long bracket one level deeper.

*Whitespace only. No renaming, no dead-code elimination, no bytecode.* This
release removes comments and formatting and nothing else. Every identifier in
the production artifact is the identifier the developer wrote, so a runtime
error names a real symbol and the line map's symbols stay true.

*Production is `build` alone.* `luam ensure` and `luam dev` write the readable
tree exactly as before. The compiler emitter is unchanged; minification is a
transformation applied by the CLI writer on the `build` path. Every generated
`.lua` file is minified — bundles, the mirrored tree when `--no-bundle` is used,
runtime helpers, and `config.lua`. `meta.xml`, `.env`, and copied assets are
written untouched.

*It runs before anything is written.* The whole file set is minified in memory
first. A scanner failure aborts the command before the first write and before
the prune, so a failed build leaves the previous production resource intact
rather than half-replaced.

*The production map is marked, and `trace` refuses it.* A minified script is one
line, so MTA reports `line 1` for every error in it and the generated line
carries no information. The map `luam build` writes gains `minified: true`, and
`luam trace` reads that flag and reports that the position cannot be resolved,
naming `luam ensure` and `luam dev` as the way to get a source-level position. A
confident wrong line is worse than no line.

**Consequences:**
- Positive: the client scripts every player downloads lose their comments and
  formatting, which is the part of the artifact that was never read.
- Positive: string literals, long brackets, and numeric literals are preserved
  byte for byte, because the transformation lexes rather than matches.
- Positive: `ensure` and `dev` are untouched, so the debugging workflow ADR-011
  built keeps its exact line and symbol resolution.
- Positive: a scanner failure is safe — nothing is written and nothing is
  pruned.
- Negative: a production stack trace is no longer resolvable to a line. The
  developer reproduces against `luam dev`, which is where the line map is exact.
- Negative: the project now owns a Lua lexer, and its token rules have to stay
  correct for every construct the emitter can produce.
- Negative: the resource map written by `build` is positionally useless. It is
  still written, still versioned, and still records structure, but its lines
  describe an artifact that has only one.
