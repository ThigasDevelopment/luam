# ADR-020: One role table generates every Luam editor theme

**Status:** Accepted

**Context:**
The VS Code extension shipped a TextMate grammar and no theme, so Luam was read
through themes designed for other languages. Those themes have no name for the
things Luam adds to Lua. A type annotation, an `interface`, a `declare`, and a
decorator all disappear before a single line of Lua is written, and every one of
them was painted as if it were ordinary code. The file environment — the single
fact that decides which half of the MTA API exists — was a comment-coloured
line. An MTA native, a Lua standard library call, a method, and one of the
user's own functions were one colour, because the grammar gave three of them the
same scope and could not have told them apart if it had not.

The grammar could not fix the second half of that on its own. Telling
`createVehicle` from a user function needs the symbol table and the catalog,
which only the language server has.

**Options considered:**

- **Better scopes and no theme.** Rejected. No scope split separates a native
  from a user function, because a regex cannot resolve a name. The elements the
  milestone is named for would still collapse.
- **A maximalist theme, one hue per element.** Rejected. At roughly fifty roles
  it is unreadable — a file becomes a rainbow — and unmaintainable, because
  every new element needs a hue nobody has used yet.
- **A minimal palette with globally unique styles.** Rejected as arithmetically
  impossible. Four hues, four value steps, and three font styles give 48 slots
  before contrast floors, and the contrast floors take most of them: two steps
  of one hue that both clear 4.5:1 against the background cannot also be four
  steps apart.
- **A minimal palette with distinctness scoped to confusion sets.** Chosen.

**Decision:**

Distinctness is not global. Two roles that can never occupy the same syntactic
position — a block comment and a type alias — may share a style without ever
being confused. Two roles that compete for the same position — an MTA native and
a user function at a call site — must not. The contract groups roles into
**confusion sets** and requires distinctness inside a set only.

- One rule carries the theme: cyan is what the compiler erases. Every other hue
  names what a thing is rather than whether it survives — blue for your own
  code, violet for vocabulary you were given, gold for a declared type name,
  salmon for members and parameters, green for strings, orange for scalars,
  grey for punctuation. The palette follows One Dark.
- Three axes. Hue says what a thing is, value step says how specific, style
  says emphasis. A word that introduces a name always recedes and the name
  always stands, and the hue only says what the word beside it cannot: at
  `class Round` the keyword classifies `Round`, but at `: Round` nothing does,
  so the annotation turns cyan.
- The erased layer is checked mechanically and in both directions: a role is
  cyan if and only if its `layer` tag says erased. A role that classifies
  neither way must appear in an explicit `NEUTRAL_ROLES` list, so the tag cannot
  be used to dodge the check.
- One documented exception. The environment directive takes the strongest
  violet in bold, marked as an exception in the data, and the test asserts it is
  the only role so marked.
- One role table, in `packages/theme`, generates the VS Code themes, the Zed
  theme, the Neovim colour scheme, and the `.tmTheme` for the TextMate family.
  No exporter contains a colour literal.
- The ramps are derived, not picked. Each step targets a fixed contrast ratio
  against that mode's background, and each step up is 1.62x the previous one in
  the WCAG ratio, so the contrast floors hold by construction rather than by
  inspection.

**Consequences:**

- A new language element must be added to the role table and placed in a
  confusion set before it can be coloured. That is friction by design: it is
  what stops the next element from being painted the same as something it can be
  confused with.
- Half of the differentiation comes from LSP semantic tokens, so a client that
  does not request them, or a user who sets `luam.semanticHighlighting` to
  false, gets the grammar layer only. In that layer an MTA native and a user
  function share a colour, as do a parameter and a local.
- The TextMate exports are permanently in that reduced state, because the format
  has no semantic-token equivalent. The editors page says so rather than hiding
  it.
- JetBrains is unserved. Its scheme format is `.icls`, its highlighting comes
  from a language plugin rather than from a grammar, and the community IDEs do
  not map LSP semantic tokens onto a colour scheme without one. An `.icls` that
  coloured nothing Luam-specific would be a worse promise than shipping nothing.
- Semantic highlighting adds per-keystroke work in the language server. It is
  served from the analysis the document already produced and never forces a
  re-parse.
- Two roles the plan named are absent, and both for the same reason: nothing in
  the compiler can identify them today. There is no `static` and no type
  parameter in the symbol index, so a role for either would be a rule that never
  applies. They join the table when the language grows them.
- Several roles the plan named as sharing a style were separated, because a
  shared style inside one confusion set is exactly what the contract forbids:
  `self` and `super` move one step off the vararg, and the environment of an MTA
  native is carried by value step rather than by hue, because hue is already
  spoken for by the rule above.
- A name in a declaration head takes the hue of what it emits, not of the
  declaration it opens. `class Round` and `enum MatchState` are violet because
  both introduce a runtime table; `interface` and `type` names are cyan because
  neither survives. The same identifier therefore reads violet at `class Round`,
  cyan at `: Round`, and violet again at `new Round()`, which is R2 rather than
  an inconsistency. `extends` on a class and its parent are violet because
  inheritance emits; `extends` on an interface and every `implements` target are
  cyan because they do not. An earlier draft of the table read a declaration
  head as a type position and painted the class name cyan; the layer tag was
  what lied, so the mechanical R2 check could not see it. The check now asserts
  the tag against the semantic selector that reaches the role, which is the
  evidence the compiler already produces.
