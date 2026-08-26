# ADR-003: Erase type annotations by default

**Status:** Accepted

**Context:**
A Luam annotation is read by the checker and disappears from the generated Lua. Nothing in the emitted resource records that a parameter was declared `string`, so a value that reaches a function at runtime is whatever the caller passed. That matters most at the MTA trust boundary: any client can call `triggerServerEvent` with any payload, so a server handler annotated `function onBuy(player: player, amount: number)` receives whatever the client sent, and the annotation is a claim about the code, not a guard on the data. The reference manual has always said so, but the contract was never recorded as a decision, which left it unclear whether erasure is a deliberate boundary or an unimplemented feature.

**Options considered:**
- **Erase every annotation and validate nothing.** One rule, no generated guards, no runtime cost, and generated Lua that reads like the authored source. It also means an unvalidated boundary fails deep inside the handler instead of at the entry point.
- **Emit a runtime check for every annotated parameter.** Every call site gains type dispatch written in Lua 5.1: a `type()` call per parameter, a table lookup per class check, and an error path per function. MTA resources run this inside event handlers and render loops, where the cost is paid every frame, and the generated file stops being a line-for-line rendering of the source, which is the development output contract. Rejected.
- **Emit checks only in a debug build.** Two behaviours for one program, and the build that developers test is not the build that ships. A boundary bug then reproduces only where the checks are absent. Rejected.
- **Erase by default and generate validators only where the author marks a trust boundary.** Keeps the default and the cost model intact, puts the guard exactly where untrusted data enters, and leaves the marking visible in the source. This is the direction of the runtime boundary validation task.

**Decision:**
Type annotations are a compile-time contract and are erased from the generated Lua. The compiler emits no implicit runtime type check anywhere, and neither the strictness modes nor `compiler` change that. Validating data that crosses a trust boundary — a client-triggered event, a command argument, an exported function called by another resource, a value read from `config.lua` — is the author's responsibility, and the security chapter of the manual is where that duty is documented.

A future opt-in validator may generate checks, subject to two constraints that this decision fixes: it is off unless the source marks the boundary, and it never changes what an unmarked function emits. Turning implicit validation on globally is not a future option.

**Consequences:**
- Positive: generated Lua contains no code the author did not write, which keeps the readable build a faithful rendering and the production bundle small.
- Positive: the runtime cost of a typed program equals the runtime cost of the equivalent hand-written Lua.
- Positive: the security boundary is stated in one place rather than implied by whichever annotations happen to exist.
- Negative: an annotation that is wrong about incoming data produces a failure later than a guard would, and further from the boundary that admitted it.
- Negative: authors who expect TypeScript-shaped safety must be told explicitly that no `assert` is generated for them; the limitations page and the security chapter carry that statement.
