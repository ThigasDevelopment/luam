# ADR-034: Validate a shape at runtime only where a class is marked

**Status:** Accepted

**Context:**
Type annotations are erased ([ADR-021](021-erased-type-annotations.md)), so nothing a Luam program declares survives into the running resource. That is right for code the compiler checked. It is wrong for a value that crossed a boundary the compiler cannot see: an event payload from a client, a table handed to an exported function, an HTTP body. At those points the declared type is a hope, not a fact.

**Options considered:**
- Validate every annotated value. Safe, and it turns every annotation into runtime cost, breaks the erasure contract for programs that never asked for it, and would change the meaning of existing code.
- Leave it to hand-written predicates. Zero cost and zero help: everyone writes the same walk again, differently, and forgets a field.
- Generate validators only where the author marks a boundary.

**Decision:**
Mark the boundary with a **class decorator**. `@Validated` on a class generates two static members:

- `ClassName.validate(value)` returns the value or raises a Lua error.
- `ClassName.matches(value)` returns a boolean.

The decorator was chosen over a `validate<T>(value)` intrinsic and over a declaration modifier because the project already has a decorator pipeline that generates typed members, emits them through both the canonical and the source-faithful emitter, and surfaces them in completion and hover. A call intrinsic would have needed type arguments on ordinary calls, a new lowering in two emitters, and a new rule in the source-preserving pass — for the same expressiveness, since a payload shape is a class either way.

The checker lowers the class's declared field types to a **descriptor**: a plain Lua table naming kinds, keys, and nested descriptors. The generated member passes it to a runtime helper that walks the value against it. There is no generated function per type, so there is nothing to deduplicate; the descriptor is a literal, built once per marked class.

The reifiable subset is: primitives, string, boolean and number literals, optionals, unions, arrays, maps, object types, an interface expanded into its members, and a class field checked nominally through the class helper's definition chain. Anything else — `any`, `unknown`, a name that resolves to nothing — is `check-unreifiable-type`, reported before emit rather than silently weakened to a table check.

The helper is **fail-closed and quiet**. It stops at 16 levels of nesting, 4096 entries in one table, and 65536 characters in one string, so a payload built to exhaust the server is rejected rather than walked. A failure names the path and the expected type and never the value, so a rejected payload cannot carry a token into a log.

**Consequences:**
- Positive: a program that never writes `@Validated` emits no validation code, and the erasure contract is untouched.
- Positive: the boundary is visible in the source. The class that describes the payload is the class that checks it.
- Negative: the unit of validation is a class. A single scalar crossing a boundary has to be wrapped in one, or checked by hand.
- Negative: the descriptor is a table literal at the call site of the generated member, so it is rebuilt per call rather than hoisted. That keeps both emitters identical at the cost of one allocation per check.
- Negative: nominal checks are as strong as the class helper's definition chain. A table shaped like an instance but built without `new` fails the check, and a value from another resource never passes it.
