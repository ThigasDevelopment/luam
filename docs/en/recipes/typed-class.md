# Typed class

A class with a constructor, an interface, inheritance, a `super` call and
generated accessors.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).

## File tree

```
luam-docs-typed-class/
├── .luam.manifest
└── src/
    └── shared/
        └── vehicle-slot.luam
```

## Source

<<< @/snippets/typed-class/.luam.manifest{js}

<<< @/snippets/typed-class/src/shared/vehicle-slot.luam

## What to notice

- **`implements Describable`** makes the checker verify `describe()` exists. A
  missing member is `check-unimplemented-interface`.
- **`@Getter` on the class, `@Setter` on one field.** The class decorator
  generates a getter for every field; the field decorator adds a setter for
  `model` only. See [Decorators](/en/language/decorators).
- **`self:super(owner, model)`** in the constructor calls the parent
  constructor; **`self:super()`** inside `describe` calls the parent method of
  the same name.
- **Declaration order matters.** `VehicleSlot` is declared before
  `ReservedSlot`, because `extends` resolves against classes declared earlier in
  the same file.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/typed-class.check.txt{text}

The build copies the class runtime helper, because the resource declares a class:

```
build/luam-docs-typed-class/
├── meta.xml
├── lib/class.lua
└── src/shared/vehicle-slot.lua
```

`describeSlots()` returns:

```
Thigas drives 541 | Admin drives 520 (event) | 541
```

## A common error

Declaring the child before the parent:

```
src/shared/vehicle-slot.luam:1:1 error check-unknown-class: Class "ReservedSlot" extends "VehicleSlot", which is not defined.
```

Move the parent declaration above the child.

## What is emitted

The interface disappears entirely. The classes become calls into
`lib/class.lua`, and the accessors become real methods — so
`slot:setModel(541)` at runtime is an ordinary method call, not a metatable
trick.
