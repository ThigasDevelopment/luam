# ADR-032: Erase class type parameters at the point of use

**Status:** Accepted

**Context:**
Type aliases have taken type parameters since the generic-alias work, and substitution for them already existed. Classes did not, so a container had to be written once per element type or typed as `any`. The gap was recorded as a limitation with milestone 24.07 as its owner.

Lua 5.1 has no type system to reify into, so whatever a class parameter means, it has to mean it at compile time only.

**Options considered:**
- Monomorphize: emit one Lua class per specialization. Precise, and it multiplies generated code by the number of specializations for no runtime benefit, in a language where every table is already dynamically typed.
- Treat a class parameter as `any`. No runtime cost, no checking either; `Box<string>` and `Box<number>` would be the same type and neither would catch a mistake.
- Erase: substitute the argument at the point of use, emit one implementation.

**Decision:**
Erase. A class declares parameters after its name, a reference carries arguments, and the checker substitutes them where the member is read.

- `NamedType` carries optional `typeArguments`. `Box<string>` and `Box<number>` are distinct types; two specializations of the same class assign to each other only when their arguments do, pairwise. Named types with different names stay mutually assignable, as they were.
- A member is specialized at lookup: the checker finds the class that declares it, composes the substitutions down the inheritance chain — each parent's parameters bound to the arguments its child passed — and substitutes into the member type. `extends Box<T>` forwards, `extends Box<string>` pins, and both fall out of the same walk.
- `new Box<string>(...)` takes explicit arguments. Without them, the arguments are inferred by unifying the constructor's parameter types against the argument types; anything that stays unbound is `any`.
- A parameter may carry a constraint, checked with class inheritance rather than plain assignability, since named types are otherwise mutually assignable and the check would never fire.
- Type parameters, type arguments, and constraints are erased from the output like every other annotation — the parser records their spans, so source-faithful builds drop them too.
- Nesting a specialization more than eight levels deep is a diagnostic rather than an expansion. The substitution walk is depth-capped, and inheritance cycles are already broken before it runs.

Interfaces do not take type parameters. A class that implements one inherits its members unchanged, so there is nothing to substitute on that edge.

**Consequences:**
- Positive: one class, one implementation, whatever it is specialized to. Nothing in the generated Lua says a class was generic.
- Positive: the alias substitution engine is reused rather than duplicated; `substituteType` gained one case.
- Negative: a specialization is not a runtime value. `Box<string>` cannot be tested for at runtime, and a validator that wants to check the element type has to be told what to check.
- Negative: inference is single-pass and unification-based, so a parameter that appears only in a return type or only in a later argument is `any` rather than an error.
- Negative: constraints are checked by name and inheritance. A structural constraint against a class type is as coarse as named assignability, which stays permissive.
