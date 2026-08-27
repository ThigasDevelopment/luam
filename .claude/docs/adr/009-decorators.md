# ADR-009: Decorators rewrite the class they annotate

**Status:** Accepted

**Context:**
Luam needs a compact way to request generated class members without making
accessor generation part of every field declaration. The syntax must remain
distinct from build directives, preserve the authored parse tree, and allow the
checker to choose names from resolved field types.

**Options considered:**
- `@Name` above a class or member. It is visually distinct, binds to the next
  declaration, and leaves names contextual.
- A comment directive such as `--@Getter`. It resembles tooling metadata but
  makes language semantics look like a comment and competes with environment
  directives.
- Field modifiers such as `getter name: string`. This avoids a sigil but adds a
  keyword and does not extend naturally to class-wide behavior.

**Decision:**
Use `@Name` on its own line above a class declaration or class member. `@` is
punctuation and the name remains an identifier. Decorators bind positionally to
the next supported declaration, and stacked decorators preserve source order.

The first definitions are `@Getter` and `@Setter`. They apply to fields directly
or to every field through a class decorator. Expansion runs in the checker after
field types resolve. Generated methods travel in a side table keyed by the class
declaration; the parser AST remains exactly what the author wrote.

A decorator may rewrite only the class it annotates. Decorator arguments,
user-defined decorators, and decorators on functions, locals, parameters,
interfaces, and enums are not supported. Argument syntax receives a dedicated
diagnostic so a future design can extend that location without changing the
grammar boundary.

**Consequences:**
- Positive: boolean aliases and inferred boolean defaults produce the correct
  `is` getter because expansion has checker types.
- Positive: repeated checking is idempotent because generated methods never
  enter the parser AST.
- Positive: the emitter and LSP consume the same generated-member table.
- Negative: every consumer that needs generated members must accept the side
  table explicitly.
- Negative: decorators cannot run arbitrary code or affect declarations outside
  their class.
