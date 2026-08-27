# ADR-001: Use typed Lua as the source syntax

**Status:** Accepted

**Context:**
The compiler must fix its source syntax before the lexer, parser, and emitter
are implemented. The project's audience is MTA developers, who write Lua 5.1
every day, and existing MTA resources, docs, and runtime helpers are
Lua-shaped. An earlier design documented in `docs/language-design.md` chose
brace blocks for statements, functions, and classes; that hybrid read oddly
next to Lua idioms and forced the emitter to translate braces to
`then/do/end`. The user decided to keep Lua's syntactic essence and add types
on top.

**Options considered:**
- Typed Lua (Luau/Teal style) — Lua blocks (`if cond then ... end`, `for ...
  do ... end`, `function ... end`, `repeat ... until cond`) and Lua operators
  (`~=`, `and`, `or`, `not`, `..`, `#`) as the base, with Luau-style type
  annotations (`?`, `|`, `[]`, generic aliases) and additive extensions on
  top. Pros: familiar to MTA/Lua developers, the emitter writes blocks
  straight through, and generated output stays debuggable against source.
  Cons: developers coming from TypeScript must learn Lua blocks, and
  `class`/`interface`/`enum` still need custom brace syntax.
- Brace-block hybrid (previously documented) — Lua keywords (`if`, `for`,
  `function`) with `{ ... }` bodies and `!=`. Pros: TS-like feel for control
  flow. Cons: reads oddly next to Lua idioms, `end` appears only in generated
  code, the emitter must translate brace blocks, and MTA developers must
  unlearn Lua.
- Full TypeScript-like syntax — `if (...) { ... }`, `let`/`const`, `=>`
  arrows, `//` comments. Pros: familiar to TS developers. Cons: largest
  distance from Lua, largest emitter translation surface, and the MTA
  ecosystem is Lua-shaped.

**Decision:**
Use typed Lua as the source syntax: Lua blocks, Lua operators (`~=` for
  inequality, never `!=`), Luam comments (`#`, `#* *#`), and `function ...
end` declarations as the base. Luau-style type annotations stay. Our additive
extensions stay: brace-block `class`/`interface`/`enum` declarations, backtick
template strings, compound assignment (`+=`, `-=`, `..=`), native property
  extensions (`items.count`, `name.trim`), and `#!` strictness/environment
directives. The lexer reports `!=`, `//`, and `/*` as lexical errors, since
they are not part of the language.

**Consequences:**
- Positive: source is familiar to MTA/Lua developers and reads like Lua.
- Positive: the emitter writes blocks directly — no brace-to-`end`
  translation, which simplifies the emitter.
- Positive: generated Lua stays close to the source, keeping output
  debuggable.
- Negative: developers who only know TypeScript-like syntax must learn Lua
  blocks and operators.
- Negative: class, interface, and enum bodies remain custom brace syntax, so
  the language mixes Lua blocks with brace declarations.
