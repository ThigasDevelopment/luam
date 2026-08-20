# The language

Luam is Lua 5.1 with static types. Blocks still end with `end`, inequality is
still `~=`, and tables are still tables. What the language adds is checked at
build time and then erased, so the Lua you ship is the Lua you would have
written.

```luam static
local name: string = 'Thigas'
local target?: Player = nil
local key: string | number = 1
local scores: number[] = {}

type PlayerId = number

enum GameState { LOBBY, PLAYING }

interface Command {
    name: string
    execute(player: Player): void
}

class VIPPlayer extends Player implements Command {
    level: number = 1
}
```

## What is checked, and what is emitted

| Feature | Emitted Lua |
| --- | --- |
| Type annotations | Nothing. Erased. |
| `type` aliases | Nothing. Erased. |
| `interface` | Nothing. Verified by the checker only. |
| `enum` | A table, and only when the enum is used. |
| `class` | A constructor call into the `class` runtime helper. |
| `@Getter` / `@Setter` | Real accessor methods on the class. |
| Template strings | String concatenation through the `string` helper. |
| `++`, `--`, `+=` | `x = x + 1`, and so on. |
| Object extensions | A call into `table`, `string` or `math`. |
| `export` | Nothing in the Lua. An `<export>` entry in `meta.xml`. |

## Pages

| Page | What it covers |
| --- | --- |
| [Lua foundations](/en/language/syntax) | The Lua that stayed the same, and the three things that changed. |
| [Types](/en/language/types) | Annotations, optionals, unions, arrays, aliases, generics. |
| [Functions](/en/language/functions) | Declarations, function types, multi-return, variadics. |
| [Template strings](/en/language/template-strings) | Interpolation, defaults, and the scope rule. |
| [Enums and interfaces](/en/language/enums-and-interfaces) | Zero-based enums and compile-only contracts. |
| [Classes](/en/language/classes) | Fields, constructors, inheritance, `super`, `new`. |
| [Decorators](/en/language/decorators) | `@Getter` and `@Setter` on a field or a whole class. |
| [Object extensions](/en/language/extensions) | `items.count`, `name.trim`, `ratio.clamp(a, b)`. |
| [Exports](/en/language/exports) | `export function`, and what reaches `meta.xml`. |
| [Declaration files](/en/language/declaration-files) | `.d.luam` and `declare` for Lua you do not own. |
| [Strictness](/en/language/strictness) | `#!strict`, `#!nonstrict` and `#!nocheck`. |

## Reserved words

`class`, `constructor`, `declare`, `enum`, `export`, `extends`, `implements`,
`interface`, `new` and `type` are **reserved**, on top of the 21 Lua 5.1
keywords. None of them can name a variable, a parameter or a function.

They stay valid as property names — after a `.` or a `:`, as a table field key,
and as a class, interface or enum member:

```luam
local pool: table = { new = 1, type = 2, class = 3 }

print(pool.new, pool.type, pool.class)
```

`fun` is the only term that stays contextual. See
[Keywords](/en/reference/keywords).

## Porting existing Lua

Rename a `.lua` file to `.luam` and put `#!nocheck` on the first line. The build
passes while you annotate module by module. See
[Strictness](/en/language/strictness).
