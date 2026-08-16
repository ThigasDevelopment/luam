# Decorators

Decorators generate typed class APIs. They take no arguments and apply to a class,
field, or method only where listed below.

```luam
@Getter
class Profile {
    @Setter
    nickname: string = 'Luam'

    @Getter
    @Setter
    banned: boolean = false

    level: number = 1
}
```

## Where a decorator may sit

| Position | Effect |
| --- | --- |
| On a **class** | Applies to every field of the class. |
| On a **field** | Applies to that field only. |

A class decorator and a field decorator combine, so the example above generates
a getter for every field and a setter for `nickname` and `banned`.

## Confirmed API

| Decorator | Target | Generated behavior |
| --- | --- | --- |
| `@Getter` | class, field | `getField()` or `isField()` |
| `@Setter` | class, field | `setField(value)` |
| `@FluentSetter` | field | `withField(value)` returning `self` |
| `@Lazy` | field | Caching getter; the field must have an initializer |
| `@Observable` | field | Setter plus `onFieldChanged(listener)` |
| `@ReadOnly` | field | Rejects writes outside methods of its own class |
| `@Deprecated` | field, method | Warning when the member is used |
| `@Override` | method | Requires an identical superclass method signature |
| `@ToString` | class | Shallow `toString()` |
| `@Equals` | class | Shallow `equals(other)` |
| `@Clone` | class | Shallow `clone()` |
| `@Serializable` | class | `toTable()` containing shallow field values |
| `@Deserialize` | class | `fromTable(values)` assigning shallow field values |
| `@Builder` | class | `ClassNameBuilder`, `withField(value)`, and `build()` |

A decorator on anything else — a method, a statement, a function — is
`check-decorator-target`. An unknown name is `check-unknown-decorator`, the same
decorator twice on one target is `check-duplicate-decorator`, and a combination
that cannot be satisfied is `check-decorator-conflict`. Decorators take no
arguments; `@Getter(1)` is `parse-decorator-arguments`.

## Generated names

| Field | Type | Getter | Setter |
| --- | --- | --- | --- |
| `nickname` | `string` | `getNickname()` | `setNickname(value)` |
| `level` | `number` | `getLevel()` | `setLevel(value)` |
| `banned` | `boolean` | `isBanned()` | `setBanned(value)` |
| `isReady` | `boolean` | `isReady()` | `setReady(value)` |

A boolean getter is prefixed with `is` rather than `get`. A boolean field whose
name already starts with `is` followed by a capital keeps its own name as the
getter, so `isReady` does not become `isIsReady`.

## Types are preserved

The accessors are typed from the field, so the checker verifies both directions:

```luam
local nickname: string = profile:getNickname()   # string
local banned: boolean = profile:isBanned()       # boolean

profile:setNickname('Thigas')                    # string expected
```

Passing the wrong type to a generated setter is `check-type-mismatch`, exactly as
for a hand-written method.

## Reactive fields and fluent configuration

`@FluentSetter` returns the same instance, `@Lazy` computes the field on first
access, and `@Observable` notifies every registered listener:

```luam
class Session {
    @FluentSetter
    timeout: number = 30

    @Lazy
    token: string = tostring(getTickCount())

    @Observable
    connected: boolean = false
}

local session = new Session()
session:withTimeout(60):withTimeout(90)

local token: string = session:getToken()

session:onConnectedChanged(function (connected: boolean)
    print('connected', connected)
end)
session:setConnected(true)
```

The initializer of a `@Lazy` field is not emitted as an initial class value. The
getter runs it once while the field is `nil` and reuses the result on subsequent
accesses.

## Object utilities

The class decorators can be combined. They all operate shallowly: a table stored
in a field remains the same table in the clone and in the serialized table.

```luam
@ToString
@Equals
@Clone
@Serializable
@Deserialize
class Point {
    x: number = 0
    y: number = 0
}

local point = new Point()
point:fromTable({ x = 10, y = 20 })

local text: string = point:toString()
local copy: Point = point:clone()
local same: boolean = point:equals(copy)
local values: table = point:toTable()
```

## Typed builder

`@Builder` creates a companion class with one `withField` method per field and a
`build()` method that returns the original class:

```luam
@Builder
class Account {
    name: string = ''
    balance: number = 0
}

local account: Account = new AccountBuilder()
    :withName('Thigas')
    :withBalance(100)
    :build()
```

## Static validation

`@ReadOnly`, `@Deprecated`, and `@Override` do not need to add behavior to the
generated Lua. They make the checker validate how code uses the class:

```luam
class Entity {
    describe = function (): string
        return 'entity'
    end
}

class Player extends Entity {
    @ReadOnly
    id: number = 1

    @Deprecated
    oldName = function (): string
        return 'player'
    end

    @Override
    describe = function (): string
        return 'player'
    end
}
```

Using `player:oldName()` produces the `check-deprecated-use` warning. Assigning
`player.id = 2` outside a `Player` method is `check-readonly-assignment`. An
`@Override` method missing from the superclass or using a different signature is
`check-invalid-override`.

## A complete example

<<< @/snippets/language/src/shared/decorators.luam

## In the editor

Generated members are ordinary members: completion after `:` lists them, hover
shows their signature, and go-to-definition lands on the field or class that
generated them. Typing `@` also suggests every known decorator.
