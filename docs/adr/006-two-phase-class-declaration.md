# ADR-006: Separate when a class is a type from when it is a value

**Status:** Accepted

**Context:**
Until now `extends` and `new` resolved only against classes declared earlier in the same file, so a child written above its parent was `check-unknown-class` and the author had to order declarations by hand. The restriction came from the checker registering a class when it reached the class statement, and from the runtime helper resolving `extends` against the registry at the moment the declaration executes. Both are ordering artefacts rather than decisions: MTA loads a script top to bottom, but nothing in Lua 5.1 requires a class table to be filled before another table points at it.

Removing the restriction has to respect two contracts. Top-level effects keep their authored order — a `print` between two class declarations still runs between them — and a readable build keeps one line of Lua for every line of Luam, which rules out inserting declaration statements the author did not write.

**Options considered:**
- **Register class headers in a checker prepass only.** Fixes the type error and nothing else: the generated Lua still asks the runtime for a parent that does not exist yet, so a child written above its parent compiles and then fails at load. Rejected on its own.
- **Reorder the generated class statements so parents come first.** Cheap to implement and wrong: a class declaration is a statement with observable effects — field initializers run, decorators build tables — so moving it past a `print`, a call, or an assignment changes what the program does. Rejected.
- **Emit an explicit shell statement for every forward-referenced class.** Correct at runtime, but every shell is a line of Lua the author never wrote, and the development output contract keeps generated and authored lines aligned one to one. Rejected for what it costs the readable build.
- **Create the shell inside the runtime helper, at the moment `extends` names an unknown class.** No emitted line changes, the shell is the same table the later declaration fills, and the failure that the old eager error caught moves to the first instantiation instead of disappearing. Accepted.

**Decision:**
A class name has two distinct visibilities.

**As a type it is visible in the whole file.** The checker collects every top-level class header before checking any statement: the name, its `extends` target, and its interface list. `extends` and `new` therefore resolve in both directions, an inheritance cycle is reported as `check-class-cycle` at the class that closes it, and a duplicate name is still `check-duplicate-class`. Members are registered when the declaration itself is checked, so a reference that appears before the declaration sees the class but not yet its members: reading one yields `any` and the constructor arity of a forward `new` is not verified. A reference after the declaration is checked in full.

**As a value it exists from the line its declaration runs**, exactly like any other Lua statement. Instantiating a class before that line is `check-class-before-declaration` when the instantiation itself is a top-level effect — a top-level statement or a class field initializer — because that code runs during load. Inside a function body, including a method or a constructor, `new` on a class declared further down is accepted: the body runs later, when the declaration has executed.

`extends` is the one reference the runtime resolves ahead of the declaration. `class.lua` creates a pending shell for a parent it does not know yet, links the child to that table, and fills the same table when the parent's declaration runs, so inherited members resolve through `__index` afterwards. A method that would bind `self:super` against a parent that is still pending binds it lazily instead, resolving the inherited function at call time; a class whose parent is already defined keeps the eager binding and its existing cost. `new` refuses a class with a pending ancestor, naming the ancestor, so a parent that never arrives — a cross-file class whose script loads later — fails loudly at the first instantiation rather than silently behaving as an empty parent. `getClass` and `getClasses` do not report pending shells.

**Consequences:**
- Positive: a file can be organised by meaning rather than by inheritance order, and a child may sit next to the code that uses it.
- Positive: no generated line moves, appears, or disappears, so readable builds, source maps, and existing snapshots are unchanged for code that already compiled.
- Positive: an inheritance cycle is now a real possibility and is reported before emit, at a stable position, rather than being prevented by the ordering rule.
- Negative: a forward reference is checked less strictly than a backward one — unknown constructor arity, `any` members — which is a difference an author cannot see without knowing this rule. The limitations page states it.
- Negative: the runtime error for an undefined parent moves from load time to first instantiation. A class that is never instantiated no longer reports its missing parent at all.
- Negative: a method on a class whose parent is still pending pays one extra table lookup per call to resolve `super`.
