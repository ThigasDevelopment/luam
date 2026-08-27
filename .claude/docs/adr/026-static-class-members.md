# ADR-026: Give a class one value with its own member space

**Status:** Accepted

**Context:**
A Luam class had one member space. Everything declared in the body belonged to instances, so state that belongs to the class itself — a counter, a registry, a factory — had to live in a file-level local or a global, outside the type that owns it. MTA's own OOP surface already draws the line Luam did not: `Player.getRandom()` is a call on the class value, `player:getName()` a call on an instance, and [ADR-001](019-native-mta-class-values.md) models those as separate surfaces for exactly that reason.

The runtime shape decides most of this. `class 'Name' { ... }` copies the table it is given onto one definition table, an instance reads through `__index` to that table, and a subclass reads through `__index` to its parent's. Anything stored there is therefore already shared by the class and inherited by subclasses.

**Options considered:**
- **Own-only statics.** `Child.count` would not see `Base.count`. Predictable, but it contradicts the table the runtime already builds, so the checker would have to reject a read that Lua resolves perfectly well. Rejected.
- **Copied statics.** Each subclass gets its own copy at declaration time. Two classes then disagree about a counter they appear to share, and nothing in the source says so. Rejected.
- **Inherited statics with one shared slot.** `Child.count` resolves to `Base.count`, reads and writes hit one slot, and this is what the definition chain does with no extra generated code. Accepted.
- **A separate runtime table for statics.** Would stop an instance from reaching a static at runtime, at the price of a second table per class, a second lookup chain, and a lowering that no longer matches what a reader sees. Rejected: the separation is a type-level contract, and a name may not exist in both spaces anyway.

**Decision:**
`static` is a contextual modifier on a class member — a field or a method — and it is a modifier only when a member name follows it on the same line, so a member or a local named `static` keeps working.

A static belongs to the **class value**, reached by naming the class: `Counter.total`, `Counter.bump(1)`. An instance member belongs to an **instance**: `counter.label`, `counter:describe()`. The two spaces never mix. Reading an instance member from the class value is `check-unknown-member` and names the receiver that would work; reading a static from an instance is `check-static-receiver`; calling a static with `:` is `check-static-receiver`, because a class value has no `self` to pass. Declaring one name in both spaces is `check-duplicate-class-member`.

A static method receives no `self`. Writing `self` inside one is the existing `check-invalid-self`, and `super(...)` inside one is `check-invalid-super`: a static has no instance and no parent method bound to it. A static that shadows an inherited static must carry the same type, or it is `check-invalid-override`.

Statics are inherited and share one slot: `Child.origin` reads what `Base.origin` holds, and writing through either name is visible through both. Statics are emitted into the same class table as everything else, in authored order, so a static field initializer runs once, when the class declaration runs. A read or a call lowers to `getClass('Name').member`, which is the only form that both reads and assigns through the definition table.

**Consequences:**
- Positive: class-level state lives inside the class that owns it, and the editor completes exactly the members the receiver can have.
- Positive: no new runtime helper and no new generated table. The class helper already carries the definition, the inheritance chain, and the lookup.
- Positive: the model matches the native MTA class surface, so `Player.getRandom()` and `Counter.bump()` are the same shape to a reader.
- Negative: a read lowers to a `getClass` call rather than a bare name, which is one function call per access. A hot loop should hoist it into a local, exactly as it would with any table lookup.
- Negative: nothing stops Lua from reaching a static through an instance at runtime, because the two spaces share one table. The checker rejects it, and the cross-space name rule keeps the shared table unambiguous, but generated Lua carries no guard — as with every annotation ([ADR-003](021-erased-type-annotations.md)).
- Negative: a class whose parent is still pending when it is declared inherits statics only after the parent's declaration runs, which is the same rule [ADR-006](024-two-phase-class-declaration.md) states for members.
