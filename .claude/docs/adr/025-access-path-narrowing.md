# ADR-025: Key narrowing facts on stable access paths

**Status:** Accepted

**Context:**
Narrowing was a lexical stack of `Map<string, Type>` frames keyed by identifier name. A guard refined a name, and exactly one reader consulted the frames: the `identifier` case of `checkExpression`. `checkMember` never looked, and `discriminantTest` required the tested object to be an `identifier`.

A field therefore kept its declared type however it was tested. `if self.connection ~= nil then` left `self.connection` as `userdata?` inside the block it guards, and the documented workaround was to copy the field into a local first. The gap was the **key**, not the absence of flow analysis: guard clauses already carry through `guardFacts`, alternatives already merge, and invalidation already existed as `forgetNarrowing`.

A previous revision of the owning plan concluded that a control-flow graph was the only sound answer. That verdict holds for joins, loop fixed points, and facts that cross branches. It does not hold for the daily case, which is a single guarded block over a field nobody writes in between, and which the lexical model already has the shape to express.

**Definition:**
A **stable access path** is an `identifier` root followed by literal property segments only, written as the dotted source text: `session`, `self.connection`, `self.socket.handle`. A call, a dynamic index, or a computed key ends the path and yields no path at all, so no fact is ever recorded for `session.slots[key]` or `open().handle`.

**The aliasing case:**
A Lua table is a reference. `local alias = self` followed by `alias.connection = nil` invalidates the fact recorded for `self.connection`, and no intraprocedural analysis at this cost sees it. The same holds for a function that receives the table and clears the field, and for a metamethod reached through an unknown call.

**Options considered:**
- Drop every path fact on any call. Sound, and unusable: a single `outputDebugString` between the guard and the use erases the refinement, which returns the feature to where it started while costing the implementation anyway.
- Narrow only fields the checker knows nobody can write, which today means `@ReadOnly` fields read outside their class. Strictly sound and far too narrow to answer the reported case, since the field a guard tests is usually one the class itself assigns.
- Track aliases: record that `alias` and `self` name the same table and invalidate both. This is a points-to analysis, which is the graph the plan deferred plus a heap model, and it still stops at a function boundary.
- Record the pragmatic invalidation rule below and state the aliasing hole as a boundary.

**Decision:**
Key narrowing facts on a stable access path and keep the existing lexical frames. A fact is dropped when the checker sees a write that can reach it:

- an assignment to the path itself;
- an assignment to any prefix of it, so writing `self.socket` drops `self.socket.handle`;
- an assignment to any path it prefixes, so writing `self.state.kind` drops the discriminated fact held on `self.state`;
- a re-binding of the root, by assignment or by a `local` of the same name;
- an assignment anywhere inside a nested function body in the same file, taken at the point the function is checked, because the closure may run at any later time;
- an assignment anywhere inside a loop body, taken on entry to the loop and without a fixed point, because the body runs after itself.

An arbitrary call does **not** drop a fact. That is the boundary this decision accepts: between the guard and the use, a call that reaches the same table through an alias can make the narrowed type wrong, and the checker will not say so. The rule catches every write it can name and none it cannot.

A dynamic index invalidates the deepest stable prefix it is written through: `session.slots[key] = nil` drops every fact on `session.slots` and below, since the checker cannot name the element.

**Consequences:**
- Positive: the reported case works. `if self.connection ~= nil then` refines the field inside the block, nested paths and discriminants included, and the copy-into-a-local workaround stops being required.
- Positive: the change is local. The frames, the guard-clause carry, the alternative merge, and the negation rules are untouched; only the key and its invalidation changed.
- Positive: nothing is narrowed that cannot be named, so a dynamic index or a call in the path produces no fact rather than a wrong one.
- Negative: narrowing is unsound under aliasing. A program that clears the field through a second reference to the same table type-checks and fails at runtime.
- Negative: invalidation is coarser than the writes it models. A closure that assigns `self.connection` drops the fact even on the paths where it never runs, and a loop drops it even when the write is unreachable.
- Negative: two mechanisms now describe how a fact ends, the lexical frame that pops and the prefix rule that deletes, and a later control-flow graph has to subsume both.
