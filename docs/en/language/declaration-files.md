# Declaration files

A `.d.luam` file describes types for Lua the compiler does not own: `config.lua`,
a vendored library, a snippet copied from another resource. It is type checked,
contributes **nothing** to the generated resource, and takes its environment from
its path like any other source file.

```luam decl
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
declare legacyVersion: string
```

## `declare`

`declare NAME: Type` binds a global to a type. It is valid **only** inside a
`.d.luam` file; using it in ordinary source is
`check-declare-outside-declaration-file`.

Where a declaration and real source name the same global, the declaration wins
and the source is checked against it.

## `declare event`

`declare event 'name'(...)` gives a custom MTA event a typed contract, and every
handler and trigger of that name is checked against it:

```luam
declare event 'onMatchStart'(player: Player, round: number, ...tags: string)
```

Unlike `declare NAME: Type`, it is valid in ordinary source too, because it emits
nothing either way. A `.d.luam` file is still the natural home for the contracts
of a resource. See [APIs and events](/en/mta/apis-and-events).

## Declarations only

A declaration file holds declarations. A call, an assignment, or a loop is
`check-declaration-file-statement`:

```luam expect-error
declare Config: ConfigShape

outputDebugString('hello')   # check-declaration-file-statement
```

`export` has no effect in a declaration file either, because there is no emitted
code to export — that is `check-export-in-declaration-file`.

## Where to put one

Under a source directory, in the environment the described Lua runs in:

```
src/
├── shared/legacy.d.luam    describes globals both sides may use
└── server/admin.d.luam     describes server-only globals
```

`config.lua` is a shared script in the generated resource, so a declaration file
for it belongs in `src/shared`.

## Typing `config.lua`

`config.lua` is copied verbatim and never parsed, so the compiler does not know
what is inside it. A declaration file is how you get completion and checking for
it:

```lua
Config = {
    greeting = 'Welcome to the server.',
    limit = 32,
}
```

```luam decl
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
```

From then on `Config.greeting` is a `string`, and `Config.greting` is an error.

See [config.lua and .env](/en/mta/configuration).

## A complete example

<<< @/snippets/language/src/shared/legacy.d.luam
