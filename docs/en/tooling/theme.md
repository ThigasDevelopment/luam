# The Luam theme

`Luam Dark` and `Luam Light` ship with the extension. They exist because Luam
adds things to Lua that a Lua theme has no name for: an erased type layer, file
environments, decorators, and the MTA surface.

## The one rule

**Cyan is what the compiler erases.**

A cyan token has no counterpart in the emitted Lua — a type annotation, an
`interface`, a `type` alias, a decorator, a strictness directive. Learn that and
you can read a file's erased layer at a glance.

The rest of the palette names what a thing is rather than whether it survives:

| Hue | What it names |
| --- | --- |
| Blue | Your own code: locals, functions, and methods. |
| Violet | Vocabulary you were given: keywords, MTA natives, and the Lua standard library. |
| Gold | The name a class, interface, enum, or type alias introduces. |
| Salmon | Members reached through a dot, parameters, `self`, and `super`. |
| Green | Strings. |
| Orange | Numbers, booleans, `nil`, and escapes. |
| Cyan | The erased layer. |
| Grey | Punctuation, operators, and comments. |

## How the axes work

| Axis | What it carries |
| --- | --- |
| Hue | What the thing is. |
| Value step | Specificity — strong, base, muted, faint. |
| Style | Emphasis. Bold marks the few landmarks a page has; italic marks something you did not write. |

A word that introduces a name always recedes and the name always stands, so
`local ok`, `class Round`, and `interface Describable` all read the same shape.
The hue only says what the word beside it cannot: at `class Round` the keyword
already tells you what `Round` is, but at `: Round` nothing does, so the
annotation turns cyan.

## The environment tint

The directive on the first line is the one deliberate exception. `#!server`,
`#!client`, and `#!shared` take the strongest violet, in bold.

## Sample

<!--@include: ../../generated/theme-sample.md-->

## Every element

The table is generated from the role table the themes are built from, so it
cannot drift from what the editor paints.

<!--@include: ../../generated/theme-elements.en.md-->

## Readability

Body text sits at or above 4.5:1 against the editor background in both modes,
and ambient roles — comments, punctuation, type punctuation — at or above 3:1.
Two elements that can appear in the same position and differ only in weight stay
at least 1.6:1 apart from each other. Every floor is asserted by a test.

<!--@include: ../../generated/theme-contrast.en.md-->

## Choosing it

In VS Code and its forks: **File → Preferences → Theme → Color Theme**, then
`Luam Dark` or `Luam Light`. Installing the extension does not change your
colours; you pick the theme yourself.

For Zed, Neovim, and the TextMate family, see
[Editors](/en/tooling/editors).

## Turning semantic colour off

Half of what the theme differentiates — an MTA native against your own function,
a parameter against a local — comes from the language server rather than the
grammar. To fall back to the grammar layer only:

```json
{
    "luam.semanticHighlighting": false
}
```
