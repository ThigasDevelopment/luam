# Ported resource corpus

Milestone 45 came from one exercise: converting a 3,600-line MTA resource,
annotated for the Lua language server, into Luam and reading the diagnostics. The
first run reported 56 errors and 2 warnings across 24 files, and every one was a
defect, a missing surface, or a real bug in the resource. No unit fixture in the
suite produced any of them, because a unit fixture is written against the feature
under test and a real resource is written against none of them.

This corpus keeps the **shapes** and owes the original nothing. It is a real
project — a manifest, a `config.lua`, a `.d.luam`, and all three environments — so
discovery, environment resolution, manifest generation and the bundle layout are
exercised alongside the checker.

`ported-resource` compiles with no diagnostics. `ported-defects`, beside it, keeps
the negative half: the shapes that must still report, and the genuine defects a
resource of this shape has. Its expected output is checked in as
`diagnostics.txt`, so a change in count, code, position or severity is a diff and
not a silent pass.

## Where each shape lives

| Task | Shape | File |
| --- | --- | --- |
| 45.02 | An empty literal initialising a map whose key is not a string | `src/shared/registry.luam` |
| 45.03 | `nil` assignment deleting a key | `src/shared/registry.luam` |
| 45.04 | `unpack` spread into the argument list it ends | `src/server/vehicles.service.luam` |
| 45.05 | A member whose key is not an identifier, declared and read | `src/shared/entities.luam`, `src/client/dealership.page.luam` |
| 45.06 | An optional parameter in a `fun` type | `src/server/database.luam` |
| 45.07 | An interface that takes type parameters | `src/shared/entities.luam` |
| 45.08 | A type alias read from another file, on both sides | `src/shared/entities.luam`, `src/client/dealership.page.luam` |
| 45.09 | A global the source assigns later | `src/server/vehicles.service.luam` |
| 45.10 | A record built over several statements, and an extended inferred literal | `src/server/vehicles.service.luam` |
| 45.11 | An inferred literal whose members widen | `src/server/vehicles.service.luam` |
| 45.12 | `nil` for a parameter the catalog declares optional | `src/client/dealership.page.luam` |
| 45.13 | A declaration that overwrites an MTA API and a runtime helper | `../ported-defects/src/server/patches.luam` |
| 45.14 | A class used as a receiver, and a reserved word in a name position | `../ported-defects/src/shared/adapters.luam` |
| 45.15 | An authored multi-return signature | `src/server/database.luam` |
| 45.16 | A registry instead of a class the code names at runtime | `src/shared/registry.luam` |

A failing baseline names the plan to read: the task column is the plan file under
`.claude/plans`.
