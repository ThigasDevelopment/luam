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

## Static members

`static` puts a field or a method on the **class** instead of on its instances:

```luam
class Counter {
    static total: number = 0

    static bump = function (amount: number): number
        Counter.total = Counter.total + amount

        return Counter.total
    end

    label: string = 'counter'
}
```

Reach a static by naming the class, an instance member through a value:

| Written | Resolves to | Wrong form |
| --- | --- | --- |
| `Counter.total` | the static field | `counter.total` is `check-static-receiver` |
| `Counter.bump(1)` | the static method | `Counter:bump(1)` is `check-static-receiver` |
| `counter.label` | the instance field | `Counter.label` is `check-unknown-member` |

The rules that follow from that split:

- A static method has no `self` — writing one is `check-invalid-self` — and no
  `super(...)`, which is `check-invalid-super`.
- One name cannot be both static and instance in the same class; that is
  `check-duplicate-class-member`.
- Statics are **inherited and shared**: `Child.origin` reads the slot
  `Base.origin` holds, and writing through either name is visible through both.
  A static that shadows an inherited one must carry the same type, or it is
  `check-invalid-override`.
- A static field initializer runs once, when the class declaration runs.

`static` is only a modifier when a member name follows it on the same line, so a
field named `static` and a local named `static` both keep working.

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

## Type parameters

A class takes type parameters the way a [type alias](/en/language/types#aliases)
and a [function](/en/language/functions#generic-functions) do. Every use of the parameter inside the class — a field, a parameter, a
return type — is replaced by the argument at the point of use:

```luam
class Box<T> {
    value: T

    constructor = function (value: T)
        self.value = value
    end

    read = function (): T
        return self.value
    end
}

local text: Box<string> = new Box<string>('ready')
local value: string = text:read()
```

`new Box('ready')` infers `Box<string>` from the constructor argument, so the
type arguments are worth writing only when inference has nothing to work from.
The wrong count is `check-generic-arity`, and two different specializations of
the same class do not assign to each other.

`extends` takes arguments too, either forwarding a parameter or pinning it:

```luam static
class Labelled<T> extends Box<T> {
    label: string = ''
}

class Tag extends Box<string> {
    prefix: string = ''
}
```

A parameter can carry a constraint, which every argument must satisfy — a class
that extends it, implements it, or matches it structurally. Anything else is
`check-generic-constraint`:

```luam static
class Holder<T extends Shape> {
    item: T
}
```

None of it reaches the output. One class emits one implementation whatever it is
specialized to; the parameters and the arguments are erased with every other
annotation. Nesting one specialization inside another more than eight levels
deep is `check-generic-depth` — name the inner type with an alias instead.

## Metamethods

A class answers a Lua operator by declaring the metamethod under its own name:

```luam
class Money {
    amount: number = 0

    constructor = function (amount: number)
        self.amount = amount
    end

    __tostring = function (): string
        return tostring(self.amount)
    end

    __eq = function (other: Money): boolean
        return self.amount == other.amount
    end

    __add = function (other: Money): Money
        return new Money(self.amount + other.amount)
    end
}
```

| Metamethod | Beside `self` | Returns | Answers |
| --- | --- | --- | --- |
| `__tostring` | — | `string` | `tostring` and string coercion |
| `__eq` | one | `boolean` | `==` |
| `__lt`, `__le` | one | `boolean` | `<`, `>`, `<=`, `>=` |
| `__len` | — | `number` | `#` |
| `__concat` | one | any | `..` |
| `__unm` | — | any | unary `-` |
| `__add`, `__sub`, `__mul`, `__div`, `__mod`, `__pow` | one | any | the matching operator |

The wrong parameter count or return type is `check-invalid-metamethod`. A method
whose name starts with `__` and is not on the list — a blocked one, or a
misspelling — is `check-blocked-metamethod`. A **field** named with the same
prefix is untouched.

A metamethod is inherited like any other member, and a child that declares the
same one overrides it. It is not part of the member surface: completion does not
offer it, and `tostring(instance)` is how it is reached rather than
`instance:__tostring()`. See [Limitations](/en/reference/limitations) for what
stays blocked.

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

- The three metamethods [Limitations](/en/reference/limitations) names.

## A complete example

<<< @/snippets/language/src/shared/classes.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `new Missing()` | `check-unknown-class` |
| `account.deposit(1)` where `deposit` is a method | `check-unknown-member` |
| `super()` in a plain function | `check-invalid-super` |
| two classes with one name in a file | `check-duplicate-class` |
