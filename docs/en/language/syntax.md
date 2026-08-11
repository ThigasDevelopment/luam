# Lua foundations

Luam is Lua 5.1. Statements, blocks, tables, metatables, scoping and the standard
library behave exactly as they do in MTA today. This page covers what stayed the
same, and the three places where the syntax had to move.

## What stayed the same

```luam
local rounds: number = 3

if rounds ~= 0 then
    rounds = rounds - 1
elseif rounds == 0 then
    rounds = 3
end

for index = 1, rounds do
    print(index)
end

while rounds > 0 do
    rounds = rounds - 1
end

repeat
    rounds = rounds + 1
until rounds >= 3
```

- Blocks end with `end`, not with a closing brace.
- Inequality is `~=`, never `!=`.
- `and`, `or` and `not` are the boolean operators.
- Concatenation is `..`, length is `#`, and tables are 1-based.
- `nil` and `false` are the only false values.

## What changed: comments

Lua's `--` comment would collide with the `--` decrement operator, so Luam moved
comments to `#`:

| Form | Meaning |
| --- | --- |
| `# text` | Line comment. The hash must be followed by a space or the end of the line. |
| `#* text *#` | Block comment. |
| `#items` | The **length operator**, with no space. |

```luam
# A line comment starts with a hash followed by a space.

#*
    A block comment opens with hash-star and closes with star-hash.
*#

local total: number = #names
```

Writing `--` where a comment was intended is `lex-foreign-comment`, and the
message tells you to use `#`.

## What changed: increment and compound assignment

```luam
score++          # score = score + 1
score--          # score = score - 1

health += 10     # health = health + 10
health -= 10
damage *= 2
damage /= 2
label ..= '!'
```

`++` and `--` are **statements**, not expressions: `local x = y++` does not
parse. That is `parse-invalid-increment`.

## What changed: type annotations

A `:` after a name introduces a type, and a `:` after a parameter list introduces
a return type:

```luam
local health: number = 100

function heal(player: Player, amount: number): void
    health += amount
end
```

Every annotation is erased. The emitted Lua is:

```lua
local health = 100

function heal(player, amount)
    health = health + amount
end
```

See [Types](/en/language/types).

## A complete example

<<< @/snippets/language/src/shared/syntax.luam

## Common errors

| You wrote | Diagnostic | Fix |
| --- | --- | --- |
| `-- comment` | `lex-foreign-comment` | Use `# comment`. |
| `a != b` | `lex-foreign-operator` | Use `a ~= b`. |
| `local x = y++` | `parse-invalid-increment` | Make `y++` its own statement. |
| `#count` meaning a comment | no error, wrong meaning | Add a space: `# count`. |
