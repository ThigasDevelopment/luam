# @luam/mta-types

Typed declarations for the Lua 5.1 standard library, the MTA server and client
APIs, MTA events, and the language extension helpers. The package is the single
source of truth for what a `server`, `client`, or `shared` file may use.

The MTA catalogs are **generated**, not handwritten, from a committed snapshot of
the MTA wiki. See ADR-019 for the source decision, which supersedes ADR-006.

> **User documentation:**
> [APIs and events](https://thigasdevelopment.github.io/luam/en/mta/apis-and-events) ·
> [Environments](https://thigasdevelopment.github.io/luam/en/mta/environments) ·
> [OOP API](https://thigasdevelopment.github.io/luam/en/mta/oop)
> · [em português](https://thigasdevelopment.github.io/luam/pt-br/mta/apis-and-events).

## Layout

```
src/
├── api-declaration.ts     What a declaration is, and how environments resolve
├── type-descriptor.ts     The neutral type model the catalog is written in
├── oop-declaration.ts     The OOP class and member model
├── catalog.ts             Lookups over the generated catalogs
├── catalog-overrides.ts   Hand corrections applied on top of the wiki parse
├── element-hierarchy.ts   Element inheritance queries
├── event-lookup.ts        Event environment queries
├── library-members.ts     math, string and table members
├── lua-standard.ts        The Lua 5.1 standard library
├── luam-runtime.ts        Luam own globals: class registry, sleep, Threads, Async
├── oop-surface.ts         Lookups over the generated OOP surface
└── generated/             Never edit by hand — pnpm generate rewrites all of it
    ├── api/               One module per category and side, plus the aggregates
    ├── oop/               The OOP surface, chunked, plus its aggregate
    ├── docs/              The documentation catalog, chunked
    ├── element-types.ts   Every MTA element type name
    └── mta-events.ts      Every server and client event
data/
├── mta-wiki.json          The committed wiki snapshot the generator reads
└── catalog-index.json     Every declaration's rendered signature, for diffing
```

The split is the rule: everything at the root is written by hand and is the
public surface other packages import; everything under `generated/` is produced
by `pnpm --filter @luam/mta-types generate` and is deleted and rewritten on every
run. A generated module imports the root through the `@mta-types/*` alias, never
a relative path out of its folder.

## Type Descriptors

Declarations are written with a neutral descriptor model
(`src/type-descriptor.ts`) instead of the compiler type model, so the catalog
stays independent of the compiler. The compiler converts a descriptor into its
own type when it seeds the global scope of a file.

```ts
outputChatBox: fn([STRING, ANY, NUMBER, NUMBER, ANY, ANY], BOOLEAN, 1);
```

The third argument is the minimum number of arguments a call must pass; the
fourth marks a variadic signature.

## Modules

| Module | Status | Contents |
| ------ | ------ | -------- |
| `type-descriptor.ts` | handwritten | The descriptor model and its constructors |
| `api-declaration.ts` | handwritten | Declaration shape and environment resolution |
| `catalog.ts` | handwritten | Aggregates every catalog and answers lookups |
| `catalog-overrides.ts` | handwritten | Overrides the generator applies and never rewrites |
| `lua-standard.ts` | handwritten | Lua 5.1 globals available everywhere |
| `luam-runtime.ts` | handwritten | Luam class runtime globals |
| `library-members.ts` | handwritten | Typed `math`, `string`, and `table` members, including injected helpers |
| `element-hierarchy.ts` | handwritten | Element lookup over the generated hierarchy |
| `event-lookup.ts` | handwritten | Event environment lookup over the generated catalogs |
| `oop-declaration.ts` | handwritten | The OOP class and member shape and its constructors |
| `oop-surface.ts` | handwritten | Class, member, and environment lookups over the generated OOP surface |
| `mta-shared.ts`, `mta-server.ts`, `mta-client.ts` | generated | Aggregate one environment from its category modules |
| `mta-<category>-<environment>.ts` | generated | One wiki function-list section on one side |
| `mta-oop.ts`, `mta-oop-<n>.ts` | generated | The object form of the API: one class per element type |
| `mta-events.ts` | generated | Server and client event names |
| `element-types.ts` | generated | Element type names and their inheritance chain |

Generated files carry no marker comment — the project forbids comments in code —
so this table is the record of which files the generator owns. Editing one by
hand fails the drift test in `tests/generator.test.ts`.

`catalog.ts` aggregates everything: `globalsFor(environment)` returns what a file
may reference, and `isApiAvailable(name, environment)` answers whether a name is
allowed there. A name the catalog does not declare is treated as available, so
project globals never produce a false diagnostic.

## Coverage

| Set | Count |
| --- | ----- |
| MTA declarations | 1413 (545 shared, 229 server, 639 client) |
| Lua 5.1 globals | 24 |
| Luam runtime globals | 3 |
| Library members | 39 across `math`, `string`, and `table` |
| Events | 203 (79 server, 124 client) |
| Element types | 58 |
| OOP classes | 58 |
| OOP methods | 656 |
| OOP static methods | 120 |
| OOP constructors | 47 |
| OOP properties | 218 |

Milestone 8 replaced 246 handwritten declarations with the full catalog.

Milestone 30 replaced the source. The catalog came from `mtasa-lua-types`, which
stopped being published on 2023-02-05, and had drifted 119 functions and 24
environments behind MTA. It is now generated from a committed wiki snapshot,
covering MTA 1.7.0. `getElementPosition` and the other 99 multi-return functions
now emit tuples rather than `any`, because the wiki states the return list
directly.

Milestone 11 added the OOP surface: the upstream classes read a second
way, as classes rather than free functions. It carries no declaration of its
own — every member records the procedural function it wraps, and takes its
environment from that function's entry in the catalog. Instance members,
static methods, and callable constructors remain separate so their server and
client shapes do not overwrite each other. 28 properties whose getter the
upstream does not name are dropped rather than guessed.

## Refreshing

```bash
pnpm --filter @luam/mta-types fetch-wiki
```

```bash
pnpm --filter @luam/mta-types generate
```

The two commands are separate on purpose. `fetch-wiki` is the only thing in this
package that opens a connection: it reads the two curated wiki function lists,
downloads every page it names, trims each at the Example section, and rewrites
`data/mta-wiki.json`. It fetches incrementally by revision id, so refetching an
unchanged wiki produces a byte-identical file, and it writes nothing until every
batch has succeeded.

`generate` reads that committed file and nothing else. It never opens a
connection, so a clone with no network regenerates the catalog byte for byte.
`tests/offline-boundary.test.ts` proves it by stubbing `fetch` to throw and
running a whole generation.

The wikitext is parsed as text, never evaluated and never imported. A page count
far below the baseline, a page with no Syntax section, or a Syntax block that
does not name its function fails the run naming the page.

`.github/workflows/catalog-refresh.yml` runs both weekly and opens a pull
request. It never merges one. `refresh-catalog` refuses to write when the parse
rate falls below the measured bar, when the diff exceeds a sanity threshold, or
when a function has disappeared from the wiki — a blanked page must not remove a
declaration from anyone's type information.

### Generator layout

| Script | Responsibility |
| ------ | -------------- |
| `scripts/fetch-wiki.ts` | Entry point: the only script that opens a connection |
| `scripts/generate-catalog.ts` | Entry point: generates and writes, offline |
| `scripts/refresh-catalog.ts` | Entry point: generates behind the refresh guards and writes the proposal summary |
| `scripts/wiki-endpoint.ts` | The MediaWiki client, and the one file that calls `fetch` |
| `scripts/wiki-function-list.ts` | Derives the canonical function list and its categories from the two curated pages |
| `scripts/wiki-snapshot.ts` | The snapshot shape, its validation, and its environment derivation |
| `scripts/wiki-syntax.ts` | Locates the Syntax section and its per-side Lua blocks |
| `scripts/wiki-signature.ts` | Parses a signature into arity, optionality, and variadic form |
| `scripts/wiki-type-mapper.ts` | Maps a wiki type spelling onto a descriptor |
| `scripts/wiki-templates.ts` | Reads the OOP surface, the release, and the review flags a page carries |
| `scripts/wiki-documentation.ts` | Reads the summary, argument, and return prose |
| `scripts/wiki-declaration-parser.ts` | Turns a snapshot into declarations, surfaces, and unparsed pages |
| `scripts/wiki-catalog-source.ts` | Applies the tiebreaker, the retained upstream names, and the redundant-override report |
| `scripts/wiki-parse-classification.ts` | The committed accuracy bars and the verdict on every arity disagreement |
| `scripts/wiki-parse-report.ts` | Measures parse rate and arity agreement against the frozen upstream |
| `scripts/upstream-catalog.ts` | Parses `mtasa-lua-types`: the tiebreaker, the element hierarchy, events, and variables |
| `scripts/upstream-tiebreaker.ts` | Narrows a wiki type the model cannot resolve, and never adds a declaration |
| `scripts/upstream-source.ts` | Locates and reads the upstream declaration files |
| `scripts/declaration-parser.ts` | Reads upstream functions, variables, aliases, and classes |
| `scripts/type-mapper.ts` | Maps a TypeScript type node onto a descriptor |
| `scripts/catalog-generator.ts` | Orchestrates a run and returns the files in memory |
| `scripts/catalog-normalizer.ts` | Resolves environments, merges sides, applies overrides |
| `scripts/catalog-fingerprint.ts` | Renders and diffs the catalog index the review report reads |
| `scripts/catalog-drift.ts` | Reports what the wiki lists and the catalog lacks |
| `scripts/catalog-drift-allowlist.ts` | The deferred gap, empty while the catalog is complete |
| `scripts/refresh-guards.ts` | The thresholds an automated refresh must clear |
| `scripts/descriptor-printer.ts` | Prints a descriptor back as source |
| `scripts/catalog-emitter.ts` | Emits the category modules and their aggregates |
| `scripts/catalog-data-emitter.ts` | Emits the event and element type catalogs |
| `scripts/documentation-emitter.ts` | Emits the documentation catalog chunks |
| `scripts/oop-parser.ts` | Reads the upstream classes: methods, properties, and the wiki link each method carries |
| `scripts/oop-surface-builder.ts` | Resolves members against the catalog and types a property from its getter |
| `scripts/oop-emitter.ts` | Emits the OOP chunks and their aggregate |
| `scripts/write-catalog.ts` | Writes the generated files and renders both report forms |
| `scripts/source-resolver.ts` | Resolves extensionless source imports for Node |

## Normalization Rules

The generator applies these rules; nothing is decided per function by hand.

- A function declared on both sides is `shared`. Its signature is the merge of
  the two: a parameter the sides disagree on becomes `any`, the minimum argument
  count is the lower of the two, and variadic wins.
- A function on one curated list only keeps that side.
- A parameter is optional when the bracket depth at the start of its cell is
  greater than zero, or when the wiki gives it a default. This reads
  `f( a [, b ] )`, `f( a, [ b ] )`, and `f( [ a, ] b )` identically.
- A trailing `...` marks the signature variadic. The parameter it repeats is kept
  when a sibling shares its stem — `vertex1` beside `vertex2` — and dropped when
  it is a bare placeholder such as `argument1` or `arguments`.
- A multi-return head is a tuple: `float, float, float getElementPosition`
  becomes `(Element) -> (number, number, number)`.
- A page documenting several overloads contributes its first syntax block per
  environment.
- A union spelling — `a/b` or `a|b` — becomes a union descriptor, and collapses
  to `any` when any option is `any`.
- A type spelling the element hierarchy does not declare is `any`.
- A name the Lua standard library or the Luam runtime already declares is
  skipped, so every name is declared exactly once.
- An undeclared name stays `any` with no diagnostic, so a gap never blocks a
  build.
- An OOP method maps to the procedural function named by its `@see` wiki link,
  lowercased at the first letter. The mapping is read from the source, never
  derived from the method name, and a method whose target the catalog does not
  declare is dropped instead of guessed.
- An OOP member takes the environment of its procedural function, so the two
  views of the API can never disagree about which side declares it.
- An OOP property is typed by the return type of its getter, matched
  case-insensitively against `get`, `is`, `are`, `does`, `doesHave`, `has`,
  `was`, and `can` over the class and its ancestors. A property with no
  resolvable getter is dropped.
- A method declared on both sides merges into one signature by the same rule the
  procedural catalog uses.

## Literal enumerations

A string parameter whose accepted values the wiki documents in a table or a
bullet list is declared as the union of those values instead of `string`.

```ts
engineSetPoolCapacity: fn([unionOf([literal('building'), literal('dummy'), ...]), NUMBER], BOOLEAN, 2),
```

`scripts/wiki-enumerations.ts` is the curated half: it names the wiki template
each value list comes from, whether that template is a table or a bullet list,
and which parameter of which function it describes. The template wikitext is
carried in the committed snapshot beside the function pages, so extraction stays
offline and every value is revision-stamped.

A table template contributes the first column of its first table only — several
of them carry sibling tables listing the accepted values of individual
properties. A bullet template contributes the quoted or bolded token that opens
each item.

An entry applies only when the parameter is still `string`, or when the
enumeration names an `element` and the parameter is `any`. Anything else is
reported as unapplied rather than forced, so the curated map cannot rot.

## The tiebreaker

`mtasa-lua-types` stays an exact-pinned devDependency, demoted from the source to
a tiebreaker. It is consulted only where the wiki gives a type the model cannot
narrow: a bare `table`, a `var`, a generic `element` where upstream names the
exact element type, and an untyped `function` where upstream types the callback.
It narrowed 27 positions in the current catalog, and it can never introduce a
declaration the wiki does not list.

It aligns by position, so it is skipped entirely when the two signatures
disagree on how many parameters they declare — upstream counts one parameter
more than the wiki for `dxDrawText`, and trusting the index there typed `font`
as a number.

It also still supplies what the function lists do not carry at all: the element
hierarchy, the event catalog, the OOP classes, and the predefined variables
(`root`, `localPlayer`, `source`, and the rest).

`scripts/wiki-catalog-source.ts` carries `RETAINED_UPSTREAM`, eighteen
deprecated functions the wiki documents outside the curated lists —
`getBlurLevel`, `isPedOnFire`, `setVehicleDirtLevel`, and the rest. MTA still
accepts them, so they are retained by name rather than silently dropped.

## Overrides

`src/catalog-overrides.ts` is handwritten, is applied after the wiki parse, and
wins over the generated declaration. Use it when the wiki is wrong or when the
project wants a signature tightened. It also carries the element type aliases,
the parents the upstream classes do not declare, and the names to exclude. No
automated refresh can undo it, and generation reports any override the wiki has
made redundant.

```ts
unbindKey: { type: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1) },
```

Upstream declares `unbindKey` with three required parameters; MTA accepts one.
The override keeps a valid call from producing a diagnostic. A test asserts every
override still wins after a regeneration.

## Attribution

The catalog is generated from the
[MTA Wiki](https://wiki.multitheftauto.com), written by the Multi Theft Auto
community, and published under the
[GNU Free Documentation License 1.3](https://www.gnu.org/licenses/fdl-1.3.html).

Two things in this repository are wiki content and are attributed as such:

- `data/mta-wiki.json`, a revision-stamped snapshot of the wikitext of every
  page the two curated function lists name. It is a build input. The package
  publishes `src` only, so the snapshot is never redistributed in a release.
- `src/generated/docs/`, the documentation catalog: 1339 summaries plus the
  argument and return descriptions, re-expressed from the wiki prose. Every
  entry carries the URL of the page it came from, and the LSP surfaces that link
  in a hover.

Everything else the package commits is factual API data — names, parameter
types, and which side declares them — expressed in this project's own descriptor
model.

The tiebreaker,
[`mtasa-lua-types`](https://github.com/mtasa-typescript/mtasa-lua-types) by
Anatolii Titov and contributors, is generated from the same wiki by
[`mtasa-wiki-parser`](https://github.com/mtasa-typescript/mtasa-wiki-parser).
Its repository is licensed GPL-3.0 while its `package.json` declares MIT; the
two disagree and this project states both rather than resolving one. The
dependency stays dev-only and is never vendored or redistributed.
