# ADR-044: Merge both sides into the surface of a shared file

**Status:** Accepted, amended — the warning this record chose was removed. A `shared` file now reports nothing. See **Amendment** at the end.

**Context:**
`shared` is two things at once in Luam: the environment of a file listed for both sides of `meta.xml`, and the fallback for a file whose path resolves to nothing. Until now it was also the strictest environment — a `shared` file saw the shared catalog and nothing else, so every server-only or client-only name in it was `check-environment-api`, an error, and the file did not compile.

A real ported resource showed why that is the wrong default. A `Network` class asks which side it is on with `isElement(localPlayer)`, stores the answer in `self.isClient`, and branches on that field between `triggerServerEvent` and `triggerClientEvent`. The file runs correctly as written on both sides. The compiler produced six errors for it.

The decision the author already made cannot be recovered by the compiler: the branch tests a stored class field, not an expression the checker can narrow on. No mechanism that reasons about control flow reaches inside it.

**Options considered:**
- **Narrow the environment along control flow.** Rejected: the branch tests `self.isClient`, a field written in the constructor from a call in another method. Narrowing over an access path cannot cross that, so the mechanism would not accept the file that motivated it.
- **A compiler-provided `isClient` / `isServer` global to narrow on.** Rejected for the same reason, plus it adds language surface and forces the author to restructure a class that already works.
- **Merge both sides into the shared surface and report nothing.** Rejected: `shared` is the fallback environment. A client module written outside `src/client` resolves to `shared`, and silence would strip environment checking from it entirely.
- **Merge both sides into the shared surface and keep a warning.** Accepted.

**Decision:**
In a `shared` file the checker sees the shared declarations plus the server and client ones. Each declaration keeps the side it was declared for, and a name declared on both sides still resolves to its shared form, so nothing that already worked changes signature. Using a side-restricted name in a `shared` file is a warning — `check-environment-api` or `check-environment-event` at `warning` severity, naming the side — instead of an error. The same rule applies to events, to project declarations, and to MTA OOP members and constructors. In a `server` or `client` file both stay errors with the messages they had.

Imports do not change. A `shared` module importing a `server` or `client` module is still `project-environment-import`, because an import resolves when the chunk loads and no runtime branch can undo it.

ADR-023 stands: the environment is still a property of the whole file, and nothing is split per side.

**Consequences:**
- Positive: a module that decides its own side at runtime is writable in one file, with the real types of both surfaces — `localPlayer` is `Player`, `triggerServerEvent` carries its signature instead of falling back to `any`.
- Positive: a misplaced file still gets environment feedback; the warning names the side and says the file must decide it at runtime.
- Positive: the emitted Lua, the line map, and the generated manifest are unchanged — this is a checking and editor decision only.
- Negative: the warning is now the only thing between a `shared` file and a `nil` call on the wrong side. An author who ignores it ships a runtime error rather than a build failure.
- Negative: a `shared` file's completion list carries both sides. The side is put in the item detail and side-restricted names sort after the shared ones, but the list is longer than it was.

**Amendment:**
The warning did not survive contact with real code. `onResourceStart` is a server event, so an ordinary shared file that registers a resource-start handler carried one; a module that decides its side at runtime carried one per name. The only lever against either was `#!nocheck`, which also drops type, arity and every other check in the file — too much to pay to quiet a line.

A `shared` file now reports **nothing** for a side-restricted API, event, project declaration or MTA OOP member. The rest of this record stands: the merged surface, the real types on both sides, the unchanged `server` and `client` errors, and the unchanged import rules.

The option this record rejected as "report nothing" is therefore the one in force, and its stated cost is accepted: a file that lands in `shared` by the path fallback gets no environment feedback. The compensating signal moved into the editor, where it does not interrupt — completion still ranks the shared surface first and badges a side-restricted name with `(client)` or `(server)`, and hover still names the side. The information arrives when the name is chosen instead of after it is written.

An opt-out directive (`#!bothsides`) was considered as a middle step and rejected: a file that declares `#!shared`, or sits under `src/shared/**`, has already said the thing the directive would repeat.

**References:**
- [ADR-023](023-file-level-environments.md) — one environment per file, which this decision does not change.
- Plans `43.01` – `43.04`.
