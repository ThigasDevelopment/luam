# ADR-026: Bind self paths directly in template context tables

**Status:** Accepted

**Context:**
A template literal lowers to `string.template(literal, context)`. The context was built from the *roots* of the interpolation paths: every `${self.version}` inside a class method emitted `{ self = self }`, and the runtime `resolve` in `runtime/lua/string.lua` walked `self` then `version` with a `gmatch` over the path text.

Handing the whole receiver to a runtime helper is more than the call needs. The helper reads one value, and the emitter already knows which one at compile time, because the checker resolves the interpolation root during `checkTemplate`.

**Options considered:**
- Mirror the path as nested tables, `{ owner = { name = self.owner.name } }`. It removes `self` from the context, but pays a table constructor per level and leaves the runtime walk at its original length, so it costs more allocation than the form it replaces and resolves no faster. It also forces the emitter to merge paths that share a prefix into one tree.
- Flatten only `self.<field>` and leave deeper paths on `{ self = self }`. Safe, and it splits the emitted shape by a distinction nobody reading the generated Lua would predict.
- Flatten every `self` path into one joined name.

**Decision:**
When an interpolation path is rooted at `self`, join its fields with `_` and bind the whole path to that name: `${self.version}` emits `{ version = self.version }` and `${self.person.data.name}` emits `{ person_data_name = self.person.data.name }`. The literal is rewritten to match, and the lowering owns both halves, so the literal and the context can never disagree.

Three cases keep the previous root binding:

- A joined name that collides with another root in the same template, as in `` `${self.version} vs ${version}` ``.
- Two different `self` paths that claim the same joined name, as in `` `${self.owner.name} and ${self.owner_name}` ``.
- A joined name that is a Lua keyword, which cannot be written as a bare table key.

The rewrite is confined to `emitter/template.ts`. The checker still validates the original path, so diagnostics point at the source text the user wrote.

**Consequences:**
- Positive: the context table carries only the values the template reads, instead of the entire receiver.
- Positive: the runtime path walk drops to a single key lookup however deep the source path was.
- Negative: **a deep path is now evaluated eagerly.** `${self.person.data.name}` reads `self.person.data.name` at the call site, so a nil `person` raises `attempt to index a nil value` where the runtime `resolve` used to stop and return the fallback. The checker does not type the interpolation path, so nothing warns first. Typing the path and reporting an optional segment is the follow-up that closes this.
- Negative: for a flattened interpolation the emitted literal no longer matches the source text, and `${person_data_name}` is not a name that appears anywhere in the `.luam`. Diagnostics are unaffected, since they are produced before lowering.
- Neutral: this does not remove the dominant per-call cost, which is the context table allocation plus the `gsub` and its per-interpolation pattern matching in `string.template`. Lowering interpolation to plain `..` concatenation would remove all of it and remains open; the public documentation already describes that shape.
