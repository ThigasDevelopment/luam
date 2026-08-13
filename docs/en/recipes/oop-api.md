# OOP API

MTA's object form — `player:getName()` — typed by the compiler and declared in
`meta.xml`.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- MTA:SA 1.5+, which is where the OOP API exists.

## File tree

```
luam-docs-oop-api/
├── .luam.manifest
└── src/
    └── server/
        └── admin.luam
```

## Source

<<< @/snippets/oop-api/.luam.manifest{js}

<<< @/snippets/oop-api/src/server/admin.luam

## What to notice

- **`"oop": true` is required.** It writes `<oop>true</oop>` into `meta.xml`,
  which is what makes the object form exist at runtime, and it tells the checker
  to type the object surface. Without it, `player:getName()` is
  `check-oop-disabled`.
- **Return types are real.** `player:getName()` is `string` and
  `player:getMoney()` is `number`, so the annotations on the locals are checked
  rather than assumed.
- **A typo is a build error.** `player:getNmae()` is `check-unknown-member`.
- **The emitted Lua is unchanged.** The compiler never rewrites an OOP call into
  its procedural form; `oop` decides what the checker accepts and what the
  manifest declares.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/oop-api.check.txt{text}

`meta.xml` starts with the OOP flag:

```xml
<oop>true</oop>
<info ... />
<script src="src/server/**/*.lua" />
```

## Static methods and constructors

The same flag types static members and callable classes:

```luam
local player = Player.getRandom()
local exists: boolean = File.exists('data.json')
local handle = File('data.json')
```

::: warning `File.new` truncates
`File(path)` opens an existing file read/write and creates it when missing.
`File.new(path)` **truncates** an existing file. Use `fileOpen(path, true)` when
read-only access is required.
:::

## A common error

Extending an MTA class from a project class:

```
src/server/admin.luam:1:1 error check-native-class-inheritance: A project class cannot extend the native class "Player".
```

Compose instead: hold the element in a field of your own class.
