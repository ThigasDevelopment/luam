# ADR-019: Generate the MTA catalog from a committed wiki snapshot

**Status:** Accepted

**Supersedes:** [ADR-006](006-mta-declaration-source.md)

**Context:**
[ADR-006](006-mta-declaration-source.md) chose `mtasa-lua-types` as the catalog
source and defined a refresh as bumping the pinned version. Both halves of that
decision have stopped being true.

`mtasa-lua-types` was last published on 2023-02-05, and `1.1.1` is the newest
version that will ever exist. Bumping a pin is no longer a refresh path, so the
catalog has been frozen against MTA as it stood three and a half years ago.

Measured on 2026-08-25 against the wiki's two curated lists,
`Client_Scripting_Functions` and `Server_Scripting_Functions`:

- The catalog declared 1294 MTA functions. The lists name 1384. 119 were
  missing: 93 client, 12 server, 14 shared. Whole feature areas were absent —
  engine streaming and IMG, Discord Rich Presence, PostFX, buildings, and the
  HTTP server.
- 24 declarations named the wrong environment. Every one is the same shape: a
  function that gained a second side in a later MTA release and is still
  declared one-sided, so the checker rejected code MTA accepts.
  `catalog-coverage.test.ts` asserted one of them, `getPlayerSerial`, as correct
  behaviour.

Nothing in the repository compared the catalog to the API it claims to describe,
so the 119 accumulated without a single failing test. An undeclared name
degrades to `any` and never blocks a build, which makes incompleteness invisible
by construction.

ADR-006 rejected the wiki on a fidelity estimate: "the syntax sections are prose
written by many hands, with inconsistent optional-parameter notation". That was
an estimate, not a measurement, and measurement contradicts it. All 1384 pages
carry a `<syntaxhighlight lang="lua">` block naming the function inside their
Syntax section. The notation is inconsistent in exactly three mechanical ways —
`f( a [, b ] )`, `f( a, [ b ] )`, and `f( [ a, ] b )` — and all three fall out of
tracking bracket depth at the start of each parameter rather than pattern
matching the prose.

**Options considered:**
- **Keep `mtasa-lua-types` primary and bump on release** — there is no release
  to bump to. Rejected.
- **Committed wiki snapshot as primary, upstream as tiebreaker** — the wiki is
  first-hand and still moves. Measured: 100% of pages parsed, 98.3% agreement
  with the frozen catalog on total arity, 98.2% on required arity, and 98.1% on
  environment. Every one of the 44 remaining arity disagreements is classified
  and committed beside the parser; none is a parser defect. Accepted.
- **Fetch during generation** — makes the compiler depend on a public wiki being
  reachable and on whatever it says at that moment. Rejected: generation stays
  offline and deterministic.
- **Parse `mtasa-blue` C++ registrations** — the only truly first-hand source,
  but it yields argument counts and `CScriptArgReader` calls rather than named
  types, and it is GPL-3.0 source. Rejected, as in ADR-006.
- **Hand-maintain the gap in `catalog-overrides.ts`** — rejected as the primary
  source; retained as the escape hatch it already is.

**Decision:**
The catalog is generated from a revision-stamped snapshot of the MTA wiki,
committed at `packages/mta-types/data/mta-wiki.json`.

`pnpm --filter @luam/mta-types fetch-wiki` writes the snapshot. It derives the
function list from the two curated list pages rather than from
`Category:Client_functions`, which mixes third-party library documentation into
the same category — 2229 titles against 1159 real functions, with DGS and
Astrath pages inseparable from native ones by name alone. Membership of both
lists is what makes a function `shared`. Each page is stored with its `revid`,
its revision timestamp, and its wikitext trimmed at the Example section, which
halves the file without losing anything the generator reads. The fetch is
incremental by `revid`, so an unchanged wiki costs one identifier pass and
produces a byte-identical file.

`pnpm --filter @luam/mta-types generate` reads that committed file and nothing
else. It never opens a connection. A clone with no network regenerates the
catalog byte for byte, and a test proves it by stubbing `globalThis.fetch` to
throw and running a full generation.

`mtasa-lua-types` stays an exact-pinned devDependency, demoted to a tiebreaker.
It is consulted only where the wiki gives a type the model cannot narrow: a bare
`table`, a `var`, a generic `element` where upstream names the exact element
type, and an untyped `function` where upstream types the callback. It narrowed
27 positions in the current catalog and can never introduce a declaration the
wiki does not list, so a name cannot re-enter the catalog from a dead source.
Eighteen deprecated functions the wiki documents outside the curated lists —
`getBlurLevel`, `isPedOnFire`, and the rest — are retained from upstream through
an explicit committed list rather than silently dropped, because MTA still
accepts them.

The snapshot is untrusted input. The wikitext is parsed as text: never
evaluated, never imported, and no template expanded by executing anything. A
page count far below the recorded baseline, a page with no Syntax section, or a
page whose Syntax block does not name its function fails the run naming the
page.

`.github/workflows/catalog-refresh.yml` runs the fetch weekly and on manual
dispatch, regenerates, typechecks, tests, and opens a pull request. It never
merges one, under any condition. It fails rather than writing a degraded catalog
when the parse rate falls below the measured bar, when the diff exceeds a sanity
threshold, or when a function has disappeared from the wiki — a blanked or
vandalised page must not remove a declaration from a user's type information.
`catalog-overrides.ts` is applied after the parse, so no automated refresh can
undo a hand-written correction.

`packages/mta-types/data/catalog-index.json` records the rendered signature and
environment of every declaration. Generation diffs the new catalog against it
and reports the result in four parts ordered by blast radius: environments
changed, existing signatures changed, functions the wiki no longer lists, and
functions added. The refresh workflow uses the same report as its pull request
body, linking each entry to the exact page revision it came from.

**Attribution:**
The MTA wiki publishes under the
[GNU Free Documentation License 1.3](https://www.gnu.org/licenses/fdl-1.3.html),
as its own `rightsinfo` endpoint declares. The committed snapshot is wiki text,
and the generated documentation catalog carries wiki prose — 1341 summaries plus
parameter and return descriptions. The project attributes the MTA wiki as the
direct source under GFDL-1.3 in `packages/mta-types/README.md`, and every
generated documentation entry links back to the page it came from.

**Consequences:**
- Positive: the catalog covers 1413 MTA declarations against 1294, and every
  function the wiki lists is declared.
- Positive: the 24 wrong environments are gone, so the checker stops rejecting
  code MTA accepts. `usePickup` moves the other way, from `shared` to server, so
  the correction can reject code that compiles today.
- Positive: 93 existing signatures gained real types where the second-hand
  source had `any`, and the wiki's multi-return heads emit as tuples.
- Positive: drift is measurable. A test compares the snapshot's function list to
  the catalog and fails on any gap or environment disagreement an allowlist does
  not cover, and reports the MTA release the snapshot covers — 1.7.0 today.
- Positive: the source moves again, on a schedule, without any wiki edit
  reaching shipped behaviour unreviewed.
- Negative: the source is now publicly editable. Everything in the refresh
  workflow's guard list exists because of this, and adoption stays manual.
- Negative: the repository carries 1.6 MB of wiki text as a build input, and the
  shipped catalog carries wiki prose. The GFDL-1.3 attribution above is the
  price of the documentation being first-hand.
- Negative: 44 arity disagreements with the frozen catalog remain. All are
  classified in `scripts/wiki-parse-classification.ts`, and the six that narrow
  a declaration — `addBan`, `createLight`, `dxCreateTexture`, `dxDrawText`,
  `engineRestoreObjectGroupPhysicalProperties`, and `fetchRemote` — are named
  explicitly because they can reject code that compiles today.
- Negative: a page documenting several overloads contributes only its first
  syntax block per environment, which is what the frozen upstream did for most
  of them. Merging the overloads was measured and made agreement worse.
