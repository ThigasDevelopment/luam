# ADR-027: A template fallback marks an interpolated name optional

**Status:** Accepted

**Context:**
`checkTemplate` reported `check-unknown-template-root` whenever the root of an interpolation path was absent from the binder, and it ignored the fallback while deciding. `` `Ola ${missing:Guest}` `` was therefore a build error, even though the fallback exists to say that the value may not be there and the emitted Lua handles the case correctly: the context binds `missing` to the Lua global of that name, which is nil, and `string.template` substitutes `Guest`.

The scope rule earns its keep — it is what turns a typo inside a string into a build error rather than a nil in the chat box. But it was also carrying a second job by accident. `${getName(p)}` is rejected today only because `getName(p)` is not a name the binder holds. The check that an interpolation is a name and not an expression was a side effect of the scope lookup, not a rule of its own.

**Decision:**
Split the two jobs and let the fallback speak for the first one:

- An interpolation path that is not `identifier(.identifier)*` is reported, with or without a fallback. This is now an explicit shape check rather than a consequence of the lookup, so `${getName(p):none}` can no longer slip through into `{ getName(p) = getName(p) }`, which is not valid Lua.
- A well-formed path whose root is not in scope is reported only when the interpolation carries no fallback. `${missing:Guest}` compiles; `${missing}` does not, and its message names the fallback as the way to accept a value that may be missing.

Both keep the `check-unknown-template-root` code. The diagnostic register is public, and neither case is new enough to earn a second entry in it.

**Consequences:**
- Positive: the fallback means one thing in both directions — the value may be missing, whether because it is nil at runtime or because the name is not bound at all.
- Positive: the expression rule is enforced directly, so it no longer depends on the binder failing to find something.
- Negative: a typo with a fallback now compiles. `` `${nmae:Guest}` `` yields `Guest` at runtime instead of a build error, and the fallback is the only thing the author sees.
- Negative: the two behaviours share one diagnostic code, so a consumer filtering on the code cannot tell a malformed interpolation from an unbound name without reading the message.
