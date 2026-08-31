# ADR-042: The formatter is configured by `.luam.formatter`, not by the manifest

**Status:** Accepted

**Context:**
[ADR-017](017-manifest-domain-contract.md) established `.luam.manifest` as the
project contract, and every configuration Luam has lives in it. Milestone 32
built the formatter with a fixed style and settled one contested rule — `function (`
over `function(` — by counting the corpus, 60 to 37. A 60–37 split is a majority,
not a consensus, and the minority currently cannot use the formatter at all. The
indent is likewise a module constant of four spaces, so a team that indents with
tabs has no path that does not involve not formatting. A formatter nobody can
adopt is a formatter nobody runs.

[39.05](../../plans/39.05-formatter-configuration.md) makes the whitespace
decisions a project's own. The question this ADR answers is where that
configuration lives.

*The case for the manifest.* One project file is a real property. A developer
looks in one place, the dialect and its tooling already exist, and a second file
is a second thing to explain, watch, and keep in sync.

*The case against it, which decides this.* **The formatter runs on files that
have no project.** A developer who opens a single `.luam` file in an editor,
outside any project directory, gets formatting today — the language server
formats a document, not a project. Reading the style from a manifest would mean
that file has no style at all, or has the default while a sibling inside a
project has another, with nothing in the editor explaining why the same file
formats differently depending on where it was opened. The manifest answers
"what is this resource"; the formatter file answers "how is Luam written here",
and the second question has an answer where the first has none.

**Decision:**
The formatter is configured by a `.luam.formatter` file, discovered by walking up
from the file being formatted to the nearest one, independent of whether a
manifest exists anywhere above it.

- **It is written in the manifest dialect** ([ADR-015](015-luam-manifest-language.md)),
  parsed and validated by the same machinery. `analyzeManifest` takes a schema —
  a field table, a removed-field map, a normalizer, and a diagnostic retag — so
  the formatter file reuses the pass, the type checking, the closed-set checking,
  the editor completion and the hover rather than re-implementing any of them. A
  developer who has written `.luam.manifest` already knows the syntax. A JSON or
  TOML file would need every one of those written again.
- **The nearest file wins entirely. There is no merging.** The rule that is
  explainable in one sentence beats the rule that makes the effective style a
  computation nobody can perform by reading.
- **A file that does not parse stops the run** — the CLI exits `2` and formats
  nothing, and the editor offers no edits. Falling back to the defaults would
  silently format a project against a style it explicitly rejected, which is
  worse than refusing.
- **A `.luam.formatter` inside a library package is never read.** The upward walk
  stops at a `node_modules` segment, and library sources are not formatted at
  all, so a library's style is not its consumer's business.
- **Every option defaults to today's behaviour**, so a project with no
  `.luam.formatter` formats byte-identically to one built before the file
  existed.

**Consequences:**

- The one-project-file convention now has one documented exception, with the
  projectless-file case as its reason. A future configuration that does *not*
  have that property belongs in the manifest, and this ADR is the test it has to
  pass.
- The option set is bounded by what whitespace can express, and the bound is
  enforced rather than promised: `formatSource` re-renders its output, re-parses
  it, and compares the piece signature against the original. An option that tried
  to change a quote, a name or a construct would not produce wrong output — it
  would produce no output. That is why "the formatter configures whitespace only"
  is a property of the code and not a rule for reviewers to remember.
- Removing an option is a breaking change for every project that set it, so the
  list starts short — five fields — and each one names a decision a real team
  disagrees on. Adding a sixth later is cheap.
- The gate in [39.04](../../plans/39.04-conventions-gate.md) is unaffected. This
  repository sets no `.luam.formatter` and keeps the milestone 32 defaults, so
  `luam format --check` here means what it always meant: the gate asserts that
  *this* repository's corpus is formatted, not that every Luam project shares one
  style.
- The editor reads the file per document rather than caching it. Formatting is
  user-initiated, so the cost is one stat per invocation, and "re-reads on
  change" becomes true by construction instead of by cache invalidation.
