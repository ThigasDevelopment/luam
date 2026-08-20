# OOP API

MTA can expose its API in object form: `player:getName()` instead of
`getPlayerName(player)`. Luam types that surface, and gates it behind one
configuration flag.

## Turning it on

```luam
name = 'my-resource'
compilerOptions = { oop = true }
```

`compilerOptions.oop` is `false` by default. With it on the compiler:

- writes `<oop>true</oop>` into `meta.xml`, above `<info>` — which is what makes
  the object form exist at runtime;
- types the object surface, so `player:getName()` returns `string` and a typo is
  a build error.

With it off, the same call is `check-oop-disabled`, and the message names the
procedural function to use instead.

::: tip The emitted Lua is identical either way
The compiler never rewrites an OOP call into its procedural form. The option decides
what the checker accepts and what the manifest declares, nothing else.
:::

## The surface

| Kind | Count |
| --- | --- |
| Classes | 57 |
| Instance methods | 652 |
| Static methods | 118 |
| Constructors | 46 |

```luam env=server oop
function describePlayer(player: Player): string
    local name: string = player:getName()
    local money: number = player:getMoney()

    return `${name} ${money}`
end
```

Inheritance works as MTA defines it: an instance method declared on `Element` is
available on a `Vehicle`, and completion after `:` lists inherited members too.

## Static methods and constructors

```luam env=server oop
local player = Player.getRandom()
local exists: boolean = File.exists('data.json')
local handle = File('data.json')
```

A class that MTA makes callable can be used as a constructor directly —
`File(path)`. Calling a class that is not callable is
`check-not-callable-class`; passing the wrong arguments to a callable one is
`check-native-constructor`.

::: warning `File(path)` and `File.new(path)` are not the same
`File(path)` opens an existing file read/write and creates it when missing.
`File.new(path)` **truncates** an existing file, so use it only when destructive
creation is what you want. Use `fileOpen(path, true)` when read-only access is
required.
:::

## Which form should I use?

Both compile to the same Lua. The object form is shorter and gives better
completion; the procedural form works with `compilerOptions.oop` off and matches most existing
MTA code. Pick one per project and stay with it — mixing them is legal but makes
a codebase harder to read.

## A complete example

<<< @/snippets/oop-api/.luam.manifest{js}

<<< @/snippets/oop-api/src/server/admin.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `player:getName()` with `compilerOptions.oop` off | `check-oop-disabled` |
| `player:getNmae()` | `check-unknown-member` |
| `class Mine extends Player` | `check-native-class-inheritance` |
| `Player('x')` where `Player` is not callable | `check-not-callable-class` |
