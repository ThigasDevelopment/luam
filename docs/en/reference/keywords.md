# Keywords

Every word in this page is reserved by the lexer: none of them can name a
variable, a parameter or a function. Luam reserves the 21 Lua 5.1 keywords and
adds 11 of its own.

The one place a reserved word is still allowed is a **property name** — after a
`.` or a `:`, as a table field key, and as a class, interface or enum member.
That keeps `Threads.new(...)`, `element.type` and `constructor = function (...)` valid.

## Lua 5.1 keywords

These 21 words are reserved exactly as in Lua 5.1.

| Keyword | Role | Page |
| --- | --- | --- |
| `and` | Boolean operator | [Operators](/en/reference/operators) |
| `break` | Exits the innermost loop | [Lua foundations](/en/language/syntax) |
| `do` | Opens a block | [Lua foundations](/en/language/syntax) |
| `else` | Alternative branch | [Lua foundations](/en/language/syntax) |
| `elseif` | Chained branch | [Lua foundations](/en/language/syntax) |
| `end` | Closes a block | [Lua foundations](/en/language/syntax) |
| `false` | Boolean literal | [Types](/en/language/types) |
| `for` | Numeric and generic loops | [Lua foundations](/en/language/syntax) |
| `function` | Function declaration and expression | [Functions](/en/language/functions) |
| `if` | Conditional | [Lua foundations](/en/language/syntax) |
| `in` | Generic `for` clause | [Lua foundations](/en/language/syntax) |
| `local` | Declares a local binding | [Types](/en/language/types) |
| `nil` | The absent value | [Types](/en/language/types) |
| `not` | Boolean negation | [Operators](/en/reference/operators) |
| `or` | Boolean operator | [Operators](/en/reference/operators) |
| `repeat` | Post-tested loop | [Lua foundations](/en/language/syntax) |
| `return` | Returns from a function | [Functions](/en/language/functions) |
| `then` | Opens an `if` body | [Lua foundations](/en/language/syntax) |
| `true` | Boolean literal | [Types](/en/language/types) |
| `until` | Closes a `repeat` loop | [Lua foundations](/en/language/syntax) |
| `while` | Pre-tested loop | [Lua foundations](/en/language/syntax) |

::: tip Lua 5.1 has no `goto`
`goto` became a keyword in Lua 5.2. Luam targets 5.1, so `goto` is an ordinary
identifier here. `continue` is the one jump Luam adds, and it is lowered rather
than mapped onto `goto` — see [Lua foundations](/en/language/syntax).
:::

## Keywords Luam adds

These 11 words are reserved on top of Lua 5.1.

| Keyword | Role | Page |
| --- | --- | --- |
| `continue` | Skips to the next iteration of the innermost loop | [Lua foundations](/en/language/syntax) |
| `class` | Opens a class declaration | [Classes](/en/language/classes) |
| `extends` | Names the parent of a class | [Classes](/en/language/classes) |
| `implements` | Names the interfaces a class satisfies | [Classes](/en/language/classes) |
| `constructor` | Names the constructor inside a class body | [Classes](/en/language/classes) |
| `new` | Instantiates a class | [Classes](/en/language/classes) |
| `interface` | Opens an interface declaration | [Enums and interfaces](/en/language/enums-and-interfaces) |
| `enum` | Opens an enum declaration | [Enums and interfaces](/en/language/enums-and-interfaces) |
| `type` | Opens a type alias | [Types](/en/language/types) |
| `declare` | Opens a declaration in a `.d.luam` file | [Declaration files](/en/language/declaration-files) |
| `export` | Precedes a top-level `function` | [Exports](/en/language/exports) |

Porting Lua that uses one of them as a variable is a syntax error, and the fix is
a rename:

```luam
local exported: number = 1

print(exported)
```

Two terms stay contextual. `fun` names a function type in type position only, so
a variable called `fun` still compiles — see
[Functions](/en/language/functions). `event` is read as a keyword only directly
after `declare`, in `declare event 'name'(...)`, so `local event = 1` is still an
ordinary local — see [APIs and events](/en/mta/apis-and-events).

## Property names are exempt

A reserved word after a `.` or a `:`, as a table field key, or as a member name
inside a class, interface or enum body is read as a plain name:

```luam
local pool: table = { new = 1, type = 2, class = 3 }

print(pool.new, pool.type, pool.class)
```

`constructor` is the one exception inside a class body: it names the
constructor, so it has to be a method. Declaring it as a field is
`check-invalid-constructor`.

## `static` is contextual

`static` is a modifier only inside a class body, and only when a member name
follows it on the same line. Everywhere else it is an ordinary name, so a local
named `static` and a class field named `static` both keep working. See
[Static members](/en/language/classes#static-members).

## `self` and `super` are contextual

Neither is reserved by the lexer, so both stay ordinary names outside a class.
`self` is bound automatically inside a class method and inside a
`function Name:method()` declaration; anywhere else it reads a global that is
`nil`, which is `check-invalid-self`. Declaring your own `local self` is legal
and silences the check.

`super` only exists as `super(...)`, the parent implementation of the
method it appears in. Outside a class method it is `check-invalid-super`, and a
parent without that method is `check-unknown-super-method`. See
[Classes](/en/language/classes).

## `type` stays callable

`type` is a Lua 5.1 standard global. Reserving the word does not remove the
function, so `type(value)` keeps working — a reserved word followed directly by
`(` is read as a call:

```luam
local kind: string = type(1)
```

`type X = ...` is still the type alias, because an alias always has a name and an
`=` after the keyword.

## Type names are not keywords

`string`, `number`, `boolean`, `table`, `any` and `void` are **type names**
resolved in type position. In expression position they are ordinary identifiers,
which is why `table.concat` and `string.format` still work.

MTA element types — `Player`, `Vehicle`, `Element` and the rest — come from the
generated catalog rather than from the grammar. See
[APIs and events](/en/mta/apis-and-events).

## Decorator names

`@Getter` and `@Setter` are recognized after `@` in a decorator position only.
They are not identifiers you can shadow, and an unknown name there is
`check-unknown-decorator`. See [Decorators](/en/language/decorators).

## Runtime globals

`sleep`, `Threads`, `Async`, `env` and `process` are **globals declared by the
runtime**, not keywords. Naming one pulls its helper into the build; shadowing
one with your own local is legal Lua and simply hides it.
