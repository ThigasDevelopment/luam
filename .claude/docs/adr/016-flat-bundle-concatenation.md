# ADR-016: Bundle members are concatenated without a wrapper block

**Status:** Accepted

**Amends:** [ADR-010](010-bundled-production-output.md). Everything ADR-010
decides about the bundle layout stays as written — three bundles under `src/`,
helpers first, `config.lua` and `.env` outside the bundle, top-level `return`
rejected. Only the paragraph titled *"Each module keeps its own scope through
`do ... end`"* is reversed.

**Context:**
`materializeBundle` wrapped every helper and every module in a `do ... end`
block before concatenating them. The block bought two things: a file-level
`local` stayed invisible to the modules after it, matching what separate chunks
give in the `tree` layout, and each module's registers were released at the end
of its block, so the Lua 5.1 limit of 200 active locals was bounded per module
instead of summed across the resource.

It also put two lines into the output for every member of every bundle, and put
those two lines between the reader and the code when a shipped bundle is opened
by hand. The generated Lua ADR-010 describes is otherwise dense and free of
scaffolding the author did not write.

**Options considered:**
- Keep the block — no work, and every member of every bundle keeps paying two
  lines for an isolation guarantee most resources never exercise.
- Emit the block only for members that declare a top-level `local` — keeps the
  guarantee where it matters and removes the lines elsewhere, but makes the
  shape of the output depend on a property of the source that is invisible at
  the call site, and leaves the position mapping with two cases instead of one.
- Concatenate verbatim — the output is exactly the modules in load order, and
  the position mapping becomes an offset with no correction.

**Decision:**

*Bundle members are concatenated verbatim.* `materializeBundle` normalizes each
member to end in a newline and joins them. No wrapper is emitted, so a bundle is
byte-for-byte the load-ordered concatenation of its helpers and modules, and a
generated line number in a bundle is the member's line plus the lines of the
members before it.

The two properties ADR-010 bought with the block are given up deliberately:

- Every module in a bundle shares the bundle chunk scope. A file-level `local`
  is visible to every module after it in the same environment, and two modules
  declaring the same file-level name resolve to one variable. Modules already
  reach each other through globals, so this changes what is *possible*, not what
  the compiler asks an author to write.
- The Lua 5.1 limit of 200 active locals applies to the bundle rather than to
  each module. A resource whose file-level locals sum past 200 in one
  environment fails to load with `main function has more than 200 local
  variables`. The `tree` layout is unaffected and remains the fallback.

Neither property is checked by the compiler. A resource that relies on either
one is correct in the `tree` layout and can break in the `bundle` layout.

**Consequences:**
- Positive: a shipped bundle is the modules and nothing else, so a line read out
  of an MTA error maps to a member by counting lines, with no wrapper to skip.
- Positive: two lines per member disappear from every bundle.
- Negative: a file-level `local` leaks across module boundaries inside a bundle,
  so the same source can behave differently under `build` and under `dev`.
- Negative: the 200-local limit is now a resource-wide budget in the bundle
  layout, and nothing warns before the server refuses to load the script.
