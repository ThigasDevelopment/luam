# @luam/mta-types

Typed declarations for the Lua 5.1 standard library, the MTA server and client
APIs, MTA events, and the language extension helpers. The package is the single
source of truth for what a `server`, `client`, or `shared` file may use.

The MTA catalogs are **generated**, not handwritten. See
ADR-006 for the source
decision.

## Layout

```
src/
├── api-declaration.ts     What a declaration is, and how environments resolve
├── type-descriptor.ts     The neutral type model the catalog is written in
├── oop-declaration.ts     The OOP class and member model
├── catalog.ts             Lookups over the generated catalogs
├── catalog-overrides.ts   Hand corrections applied on top of the upstream
├── element-hierarchy.ts   Element inheritance queries
├── event-lookup.ts        Event environment queries
├── library-members.ts     math, string and table members
├── lua-standard.ts        The Lua 5.1 standard library
├── luam-runtime.ts        Luam own globals: class registry, sleep, Threads, Async
├── oop-surface.ts         Lookups over the generated OOP surface
└── generated/             Never edit by hand — pnpm generate rewrites all of it
    ├── api/               One module per category and side, plus the aggregates
    ├── oop/               The OOP surface, chunked, plus its aggregate
    ├── element-types.ts   Every MTA element type name
    └── mta-events.ts      Every server and client event
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
| `mta-<category>-<environment>.ts` | generated | One upstream Wiki category on one side |
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
| MTA declarations | 1294 (509 shared, 226 server, 559 client) |
| Lua 5.1 globals | 24 |
| Luam runtime globals | 3 |
| Library members | 39 across `math`, `string`, and `table` |
| Events | 203 (79 server, 124 client) |
| Element types | 57 |
| OOP classes | 57 |
| OOP methods | 652 |
| OOP properties | 218 |

Milestone 8 replaced 246 handwritten declarations with the full catalog. 97
multi-return functions such as `getElementPosition` return `any` until the
checker models tuples.

Milestone 11 added the OOP surface: the same upstream snapshot read a second
way, as classes rather than free functions. It carries no declaration of its
own — every member records the procedural function it wraps, and takes its
environment from that function's entry in the catalog. 28 properties whose
getter the upstream does not name are dropped rather than guessed, and static
members and constructors are not modelled.

## Refreshing

```bash
pnpm --filter @luam/mta-types generate
```

The generator reads `mtasa-lua-types`, an exact-pinned devDependency, parses its
`.d.ts` files with the TypeScript compiler API, and rewrites every generated
module. It never executes upstream content. Regenerating without a source change
produces no diff.

To pick up new MTA functions, bump the pinned version in `package.json`, run the
generator, and review the diff.

### Generator layout

| Script | Responsibility |
| ------ | -------------- |
| `scripts/generate-catalog.ts` | Entry point: writes files and removes stale ones |
| `scripts/catalog-generator.ts` | Orchestrates a run and returns the files in memory |
| `scripts/upstream-source.ts` | Locates and reads the upstream declaration files |
| `scripts/declaration-parser.ts` | Reads functions, variables, events, and classes |
| `scripts/type-mapper.ts` | Maps a TypeScript type node onto a descriptor |
| `scripts/catalog-normalizer.ts` | Resolves environments, merges sides, applies overrides |
| `scripts/descriptor-printer.ts` | Prints a descriptor back as source |
| `scripts/catalog-emitter.ts` | Emits the category modules and their aggregates |
| `scripts/catalog-data-emitter.ts` | Emits the event and element type catalogs |
| `scripts/oop-parser.ts` | Reads the upstream classes: methods, properties, and the wiki link each method carries |
| `scripts/oop-surface-builder.ts` | Resolves members against the catalog and types a property from its getter |
| `scripts/oop-emitter.ts` | Emits the OOP chunks and their aggregate |
| `scripts/source-resolver.ts` | Resolves extensionless source imports for Node |

## Normalization Rules

The generator applies these rules; nothing is decided per function by hand.

- A function declared on both sides is `shared`. Its signature is the merge of
  the two: a parameter the sides disagree on becomes `any`, the minimum argument
  count is the lower of the two, and variadic wins.
- A function the source declares on one side only keeps that side.
- A multi-return function is typed `any`.
- A union collapses to its single option when every option maps to the same
  descriptor, and to `any` otherwise. A union of string literals is `string`; a
  union of an element and `false` is `any`.
- A type the source references but the element hierarchy does not declare is
  `any`.
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

## Overrides

`src/catalog-overrides.ts` is handwritten and wins over the generated
declaration. Use it when the upstream source is wrong or when the project wants
a signature tightened. It also carries the element type aliases, the parents the
upstream classes do not declare, and the names to exclude.

```ts
unbindKey: { type: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1) },
```

Upstream declares `unbindKey` with three required parameters; MTA accepts one.
The override keeps a valid call from producing a diagnostic. A test asserts every
override still wins after a regeneration.

## Attribution

The catalog is generated from
[`mtasa-lua-types`](https://github.com/mtasa-typescript/mtasa-lua-types) by
Anatolii Titov and contributors, which is itself generated from the
[MTA Wiki](https://wiki.multitheftauto.com) by
[`mtasa-wiki-parser`](https://github.com/mtasa-typescript/mtasa-wiki-parser).

The upstream repository is licensed GPL-3.0 while its `package.json` declares
MIT; the two disagree and this project states both rather than resolving one.
The dependency is dev-only and is never vendored or redistributed. What this
package commits is factual API data — names, parameter types, and which side
declares them — re-expressed in this project's own descriptor model, carrying no
upstream source text, documentation, or file layout.
