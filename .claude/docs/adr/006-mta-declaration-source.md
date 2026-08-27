# ADR-006: Generate the MTA catalog from `mtasa-lua-types`

**Status:** Accepted

**Context:**
`packages/mta-types` was written by hand in milestone 3. It declared 246 MTA
functions and 53 events against the 1294 distinct functions the MTA Wiki
publishes, so most of the API was undeclared. An undeclared name stays `any`
with no diagnostic, so the gap never blocked a build — it only left the majority
of every resource untyped and unscoped by environment.

Hand writing the rest is not viable. The signatures change with every MTA
release, and a catalog nobody can refresh drifts into being wrong, which is
worse than being incomplete.

The catalog needs three things from a source: the name, the signature, and the
environment. The environment is the part the compiler cannot infer, because
`dxDrawText` and `banPlayer` differ only in which side declares them.

**Options considered:**
- **`mtasa-lua-types`** — TypeScript declarations generated from the Wiki by
  `mtasa-typescript/mtasa-wiki-parser`, published on npm. Pros: environment is
  encoded in the directory layout (`server/`, `client/`), parameters carry
  optionality and rest markers, `LuaMultiReturn` marks multi-return functions,
  event names ship as enums, and the OOP classes give the element hierarchy. It
  parses with the TypeScript compiler API, which is already a dependency. Cons:
  a second-hand source, so a Wiki error is inherited; the last release is 1.1.1,
  so newer functions arrive only when upstream regenerates.
- **Scraping the Wiki HTML** — Cons: the syntax sections are prose written by
  many hands, with inconsistent optional-parameter notation and return
  descriptions in free text. Every fix would be a scraper heuristic, and the
  scraper would break on a template change.
- **The MTA Wiki API** — same content as scraping with a nicer transport. It
  does not make the syntax sections more machine readable.
- **Reading `mtasa-blue` C++ registrations** — the only first-hand source, but
  it gives argument counts and `CScriptArgReader` calls rather than named types,
  and it is GPL-3.0 source we would have to parse.

**Decision:**
Generate the catalog from `mtasa-lua-types`, pinned to the exact version
`1.1.1` as a **devDependency of `@luam/mta-types`**. The declarations are not
vendored into the repository: they arrive through `pnpm install`, the generator
parses them, and only the generated Luam catalog is committed.

`pnpm --filter @luam/mta-types generate` is the refresh. A refresh is triggered
by bumping the pinned version, running the generator, and reviewing the diff.
Because the pin is exact, the generator is deterministic against a fixed input,
and a drift test in `tests/generator.test.ts` fails when a generated file is
edited by hand.

The upstream data is treated as untrusted input. The generator parses the
declaration files with `ts.createSourceFile` and never executes them, never
imports them as modules, and never evaluates upstream expressions. It validates
what it parses: an unresolvable environment, an unexpected declaration shape, or
an empty catalog fails the run with a message naming the file, instead of
emitting a broken declaration.

Attribution and licensing are recorded in `packages/mta-types/README.md`.
`mtasa-lua-types` is GPL-3.0 on GitHub and declares `"license": "MIT"` in its
`package.json`; the two disagree. The generated catalog re-expresses factual API
data — names, parameter types, and which side declares them — in this project's
own descriptor model, and carries none of the upstream source text, doc
comments, or file layout. The dependency stays dev-only and is never
redistributed. The attribution names the upstream project, the Wiki it derives
from, and both license claims.

**Consequences:**
- Positive: the catalog grows from 246 to the full Wiki surface, and every entry
  carries an environment the compiler can check.
- Positive: a refresh is one command and a version bump, not a week of typing.
- Positive: `LuaMultiReturn` marks the functions that must stay `any` until the
  checker models tuples, so the deferral is data instead of a memory.
- Positive: nothing GPL-3.0 lands in the repository or in a shipped artifact.
- Negative: the catalog inherits upstream's Wiki errors. `src/catalog-overrides.ts`
  is the escape hatch, and it is handwritten and survives regeneration.
- Negative: a refresh needs network access, so a fully offline clone can build
  and test but cannot regenerate.
- Negative: upstream releases lag MTA releases, so a brand-new function stays
  undeclared — which degrades to `any`, the existing behaviour.
- Negative: the license claims conflict upstream, so the attribution states both
  rather than resolving one.
