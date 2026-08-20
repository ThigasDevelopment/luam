# Object extensions

An extension is a member that reads like a property or a method on a value and
compiles to a plain library call. They exist so common operations stop needing a
helper function in every resource.

```luam
local size: number = items.count       # table.size(items)
local trimmed: string = label.trim     # string.trim(label)
local safe: number = ratio.clamp(0, 1) # math.clamp(ratio, 0, 1)
```

## Table extensions

| Extension | Form | Result | Compiles to |
| --- | --- | --- | --- |
| `count` | property | `number` | `table.size` |
| `isEmpty` | property | `boolean` | `table.isEmpty` |
| `keys` | property | `table` | `table.keys` |
| `values` | property | `table` | `table.values` |
| `includes(value)` | call | `boolean` | `table.includes` |

## String extensions

| Extension | Form | Result | Compiles to |
| --- | --- | --- | --- |
| `trim` | property | `string` | `string.trim` |
| `length` | property | `number` | `string.len` |
| `upper` | property | `string` | `string.upper` |
| `lower` | property | `string` | `string.lower` |
| `startsWith(prefix)` | call | `boolean` | `string.startsWith` |
| `endsWith(suffix)` | call | `boolean` | `string.endsWith` |

## Number extensions

| Extension | Form | Result | Compiles to |
| --- | --- | --- | --- |
| `abs` | property | `number` | `math.abs` |
| `ceil` | property | `number` | `math.ceil` |
| `floor` | property | `number` | `math.floor` |
| `max(other)` | call | `number` | `math.max` |
| `min(other)` | call | `number` | `math.min` |
| `clamp(low, high)` | call | `number` | `math.clamp` |

## Property or call

A **property** extension takes no arguments and is written without parentheses:
`items.count`, not `items.count()`. A **call** extension takes arguments:
`items.includes('a')`. Using the wrong form is `check-extension-form`, because
the other form does not exist: calling a property extension would call its
result, and reading a call extension would never run it.

## Runtime helpers

`table.size`, `string.trim` and `math.clamp` are not in Lua 5.1, so the compiler
includes their helper only when generated code uses the feature. Bundle output
places it inside the environment bundle; tree output writes files such as
`lib/<environment>/table.lua`. Extensions that map onto a standard function,
such as `label.upper` or `ratio.floor`, need no helper at all.

## Indexing is unaffected

`lookup['count']` is still an ordinary table read. The extension applies to the
`.` member form only, so a table with a real `count` key keeps working through
the bracket form.

## A complete example

<<< @/snippets/language/src/shared/extensions.luam
