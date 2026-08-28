# Formatting

The language server formats a `.luam` file, so format-on-save works in every
editor the extension supports. This page is the style it produces — a contract,
not a description of whatever the implementation happens to do.

The formatter rewrites **whitespace only**. It never moves a construct, never
reorders anything, and never re-wraps a line. Where you put a line break is your
decision; where the indentation and the spaces go is the formatter's.

## Indentation

Four spaces, one level per line that opens something:

```luam
class Wallet {
    balance: number = 0

    deposit = function (amount: number): void
        if amount > 0 then
            self.balance += amount
        end
    end
}
```

A line that opens more than one thing still gains one level. That is what keeps
a callback argument at the depth a reader expects:

```luam env=server
addEventHandler('onPlayerJoin', root, function ()
    outputChatBox('welcome', root)
end)
```

A line that starts by closing something loses one level, so `end`, `until`, `}`,
`)`, `]`, `else` and `elseif` line up with the line that opened the block.

## Line breaks and blank lines

Line breaks are preserved. A run of blank lines collapses to one, a file never
starts with a blank line, and every file ends with exactly one newline. Trailing
whitespace is removed. The file's existing line ending — `LF` or `CRLF` — is
kept.

## Spacing

| Rule | Written |
| --- | --- |
| A keyword is followed by a space | `function (amount: number)`, `not visible` |
| A name binds tight to its parentheses | `draw()`, `new Wallet()`, `type(value)`, `fun(string): void` |
| No space before `,` `;` `)` `]` | `dxDrawText(caption, margin, margin)` |
| A table literal breathes, an empty one does not | `{ x = 0, y = 0 }`, `{}` |
| A type annotation's `:` takes a space after, none before | `local health: number = 100` |
| A method call's `:` takes no space at all | `slot:describe()` |
| The optional marker binds to the name | `local tag?: string = nil` |
| Type arguments bind tight, comparison does not | `Nullable<string>`, `a < b` |
| A binary operator takes a space on both sides | `self.balance += amount`, `base .. name` |
| A unary operator takes none after | `-count`, `#items` |
| Members and decorators bind tight | `self.balance`, `@Getter` |

## Comments

A comment keeps the line it was written on. A comment on its own line is
indented with the block that contains it; a trailing comment stays on the line
it documents, one space after the code. A block comment's interior is never
touched, because its content is yours:

```luam
# how a slot is picked
local slot = pick()    # the first free one
```

A `#!` directive is a comment, so it keeps its place at the top of the file.

## What is never touched

- The inside of a string, a template string, or a block comment.
- Where you broke a line. A long argument list stays as you wrote it.
- The order of anything.

## When nothing is formatted

A file that does not parse yields **no edits**. Format-on-save cannot mangle a
file you are halfway through typing.

The formatter also re-reads what it produced and compares it against what it
read. If a single token or comment differs, it returns no edits rather than a
result it cannot vouch for.

## Formatting a selection

Range formatting reformats the complete lines the selection touches and leaves
every other line alone. It runs the same rules with the indentation the lines
before the selection established.

## Turning it on

In VS Code, with [the extension](/en/tooling/editors) installed:

```json
{
    "[luam]": {
        "editor.defaultFormatter": "luam.luam",
        "editor.formatOnSave": true
    }
}
```

Not everyone wants a formatter. `luam.formatting` turns it off entirely — the
language server stops being asked, so `Shift+Alt+F` and format-on-save both go
quiet, and another tool can own the layout.

There is no `luam format` command. The editor is the surface; what a pipeline
should enforce is a separate question.
