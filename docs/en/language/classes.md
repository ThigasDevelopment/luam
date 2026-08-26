# Classes

A class declares fields, a constructor and methods. The class body uses braces.
Constructors and methods use `name = function (...) ... end`; Luam injects the
typed `self` parameter automatically.

```luam
class Account {
    name: string
    balance: number = 0

    constructor = function (name: string)
        self.name = name
    end

    deposit = function (amount: number): void
        self.balance += amount
    end

    describe = function (): string
        return self.name .. ': ' .. tostring(self.balance)
    end
}
```

## Fields

A field is a name, a type, and an optional default:

```luam static
name: string          # no default; set it in the constructor
balance: number = 0   # default applied to every instance
```

A field with neither a default nor an assignment in the constructor is still
declared — it simply starts as `nil`.

## Instances

`new` calls the constructor:

```luam expect-error
local account = new Account('Thigas')

account:deposit(50)

print(account.balance)
```

Fields are read with `.`, methods are called with `:` — the Lua rule, unchanged.
An unknown member is `check-unknown-member`; `new` on a name that is not a class
is `check-unknown-class`.

## Inheritance

```luam expect-error
class PremiumAccount extends Account {
    tier: number = 1

    constructor = function (name: string, tier: number)
        super(name)
        self.tier = tier
    end

    deposit = function (amount: number): void
        super(amount * 2)
    end
}
```

- `super(...)` in the **constructor** calls the parent constructor.
- `super(...)` in a **method** calls the parent method of the same name.
- `super()` outside a class is `check-invalid-super`; naming a parent method
  that does not exist is `check-unknown-super-method`.
- `self:super(...)` is not valid; call `super(...)` directly.

## Declaration order

A class is a **type everywhere in its file** and a **value from the line its
declaration runs**. `extends` may name a parent written further down, and a
function may instantiate a class declared after it:

```luam static
class VIPAccount extends Account {
    tier: number = 1
}

class Account {
    balance: number = 0
}
```

Two rules follow from the second half:

- Instantiating a class before its declaration has run is
  `check-class-before-declaration`, and that only happens where the code is a
  top-level effect — a top-level statement or a field initializer. Inside a
  function body, `new` on a class declared further down is fine.
- A reference written above the declaration sees the class but not its members
  yet, so a member reads as `any` and the constructor arity is not checked.

An inheritance cycle — `A extends B` with `B extends A`, or a class extending
itself — is `check-class-cycle`.

## Interfaces

`implements` asks the checker to verify every member of an interface exists:

```luam static
class Round implements Describable {
    label: string = 'round'

    describe = function (): string
        return self.label
    end
}
```

See [Enums and interfaces](/en/language/enums-and-interfaces).

## What is emitted

A class compiles to a call into the `class` runtime helper, included only when
the resource actually declares a class. Bundle output places it inside the
environment bundle; tree output writes `lib/<environment>/class.lua`. Interfaces
and annotations contribute nothing.

## Native classes

`Threads` and `Async` are runtime classes Luam ships. They use the same
`new`:

```luam
local tasks = new Async(100)
```

The helper behind a native class is injected only when the class is named. A
project class may not extend a native class — that is
`check-native-class-inheritance`.

MTA's own OOP classes (`Player`, `File`, `Vehicle` …) are a separate surface,
gated behind `"oop": true`. See [OOP API](/en/mta/oop).

## Not supported

- Static members.
- Declared metamethods.
- Generic classes. (Generic **type aliases** work — see
  [Types](/en/language/types).)

## A complete example

<<< @/snippets/language/src/shared/classes.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `new Missing()` | `check-unknown-class` |
| `account.deposit(1)` where `deposit` is a method | `check-unknown-member` |
| `super()` in a plain function | `check-invalid-super` |
| two classes with one name in a file | `check-duplicate-class` |
