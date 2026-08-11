# Lua foundations

Luam is Lua 5.1. Statements, blocks, tables, metatables, scoping and the standard
library behave exactly as they do in MTA today. This page covers what stayed the
same, the three places where the syntax had to move, and the one statement Luam
adds.

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

## What Luam adds: `continue`

`continue` skips to the next iteration of the innermost `for`, `while` or
`repeat`:

```luam
for index = 1, 10 do
    if skip(index) then continue end

    print(index)
end
```

Lua 5.1 has neither `continue` nor `goto`, so the compiler lowers it. The body
becomes a `repeat ... until true` block, where `break` leaves only that block and
therefore lands on the next iteration:

```lua
for index = 1, 10 do
    repeat
        if skip(index) then
            break
        end
        print(index)
    until true
end
```

The wrapper costs nothing at runtime. A block emits no opcode in Lua 5.1, and a
constant `until true` emits no test, so the loop runs the same instructions it
would without the `repeat`. A loop that contains no `continue` is emitted exactly
as before — you only ever see the `repeat` where you asked for a `continue`.

When a real `break` shares the same loop level, the compiler keeps it apart with
a flag, so `break` still leaves the loop and `continue` still skips one turn:

```luam
for index = 1, 10 do
    if skip(index) then continue end
    if done(index) then break end

    print(index)
end
```

```lua
for index = 1, 10 do
    local __luam_break = false
    repeat
        if skip(index) then
            break
        end
        if done(index) then
            __luam_break = true
            break
        end
        print(index)
    until true
    if __luam_break then break end
end
```

Three rules apply, and each has its own diagnostic:

- `continue` only appears inside a loop, and a function body inside a loop is not
  the same level. Otherwise `check-invalid-continue`.
- `continue` is the last statement of its block, which is the Lua 5.1 rule for
  `break` too. Otherwise `check-invalid-continue`, or `check-invalid-break`.
- `continue` inside a `repeat` cannot jump over a local the `until` condition
  reads, because the wrapper would put that local out of scope. Declare the local
  above the loop, or use `while`.

```luam
repeat
    local found: boolean = search()

    if retry() then continue end
until found
```

That last one is `check-invalid-continue`: the `until` reads `found`, which
`continue` would skip.

## A complete example

<<< @/snippets/language/src/shared/syntax.luam

## Common errors

| You wrote | Diagnostic | Fix |
| --- | --- | --- |
| `-- comment` | `lex-foreign-comment` | Use `# comment`. |
| `a != b` | `lex-foreign-operator` | Use `a ~= b`. |
| `local x = y++` | `parse-invalid-increment` | Make `y++` its own statement. |
| `#count` meaning a comment | no error, wrong meaning | Add a space: `# count`. |
| `continue` outside a loop | `check-invalid-continue` | Move it inside the loop body. |
| `break print(x)` | `check-invalid-break` | Put `break` last in its block. |
