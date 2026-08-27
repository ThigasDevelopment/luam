# ADR-035: Expose Lua metamethods by reserved member name, minus the three that own the object model

**Status:** Accepted

**Context:**
A Luam class compiles to a table with an instance metatable the class helper owns. `__index` points at the class definition, which is what makes member lookup, inheritance, and `super(...)` work. Metamethods were therefore blocked outright: a class could not answer `tostring`, `==`, `<`, `#`, `..`, or arithmetic, and the limitation was recorded with milestone 24.10 as its owner.

**Options considered:**
- Dedicated syntax, such as a `metamethod` keyword or an `operator +` form. Unambiguous, and it adds grammar for something Lua already names.
- A decorator, such as `@Operator` on a method. Composable, and it needs a mapping table from decorator to metamethod that the reader has to learn.
- Reserved member names — write `__tostring` as a class member. Zero new grammar, and the name in the source is the name Lua uses.

**Decision:**
Reserved member names, gated by an allowlist that both the compiler and the runtime enforce.

Exposed: `__tostring`, `__eq`, `__lt`, `__le`, `__len`, `__concat`, `__unm`, `__add`, `__sub`, `__mul`, `__div`, `__mod`, `__pow`. Each carries a fixed contract — how many parameters it takes beside `self`, and what it must return — checked before emit as `check-invalid-metamethod`.

Blocked, each for a specific reason rather than by category:

- `__index` replaces member lookup, which the class helper owns.
- `__newindex` swallows a field write, which the class helper owns.
- `__call` makes an instance callable, which hides construction.
- `__gc` does not run for a table in Lua 5.1, so accepting it would promise something the target cannot do.
- `__metatable` hides the metatable the class helper needs.
- `__mode` turns instances into weak references the class helper cannot track.

A class **method** whose name starts with `__` and is not on the allowlist is `check-blocked-metamethod`, which catches both a blocked name and a misspelling. A class **field** with the same prefix is untouched, so `__cache` keeps working.

A metamethod is emitted as an ordinary member of the class table. The runtime copies allowlisted keys onto the instance metatable when the constructor is first built, walking the inheritance chain from the root down so a child overrides a parent. The `metamethods` modifier the helper already accepted goes through the same allowlist, so nothing can reach the metatable that the compiler would have rejected. A metamethod is **not** registered as a checker member, so it does not appear in completion and cannot be called as `instance:__tostring()`.

**Consequences:**
- Positive: a class can answer `tostring`, comparison, length, concatenation, and arithmetic with a checked signature, and inheritance works the way method inheritance already did.
- Positive: the block is enforced twice. The checker refuses the source, and the helper refuses the table, so a hand-written `:metamethods { __index = ... }` still errors at runtime.
- Positive: no new grammar. The parser did not change.
- Negative: the name `__tostring` is now reserved for methods. A class that wanted a plain method by that name cannot have one.
- Negative: `__eq` follows Lua 5.1's rule, which only calls it when both operands are tables with the *same* metamethod. Comparing instances of two different classes falls back to identity, whatever either class declares.
- Negative: the checker does not verify that an operator is applied to operands that declare the matching metamethod. Named types stay mutually permissive for operators, so a missing `__add` surfaces at runtime, not at compile time.
