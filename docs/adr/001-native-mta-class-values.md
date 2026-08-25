# ADR-001: Model native MTA class values

**Status:** Accepted

**Context:**
MTA exposes instance members, static methods, and callable native classes through its OOP API. Luam previously generated only instance members, so calls such as `Player.getRandom()` and `File(path)` had no type checking or editor support. Static and instance methods can share names or differ between server and client.

**Options considered:**
- Keep only instance members and require procedural functions. This preserves the smallest compiler surface but leaves part of the MTA OOP API unsupported.
- Merge static and instance members into one class registry. This is simple but cannot represent duplicate names, distinct call syntax, or side-specific shapes correctly.
- Model instance members, static methods, and constructors as separate class surfaces. This matches MTA semantics and lets each surface preserve its own environment.

**Decision:**
Represent native MTA classes with separate instance members, static methods, and callable constructor metadata. Generate each surface from the pinned upstream declarations, reserve native class names while OOP is enabled, and emit their source syntax unchanged because MTA provides the runtime implementation. Native MTA classes cannot be extended by Luam classes because the class helper creates Lua table instances rather than MTA-managed elements.

**Consequences:**
- Positive: the checker and LSP support static methods and native constructors with argument and environment validation.
- Positive: instance and static methods with the same name remain independent.
- Positive: native calls require no runtime helper and remain Lua 5.1-compatible.
- Positive: class declarations cannot replace native MTA type identities while OOP is enabled.
- Negative: correctness depends on the OOP declarations of the pinned
  `mtasa-lua-types`, which remains the source of the OOP surface, the element
  hierarchy, and the events even now that the procedural catalog is generated
  from a committed MTA wiki snapshot.
- Negative: verified runtime differences such as the single-argument `File` constructor require explicit catalog overrides.
- Negative: Luam classes cannot extend native MTA classes.
