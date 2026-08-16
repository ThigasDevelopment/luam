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

## A complete example

<<< @/snippets/language/src/shared/decorators.luam

## In the editor

Generated accessors are ordinary members: completion after `:` lists them, hover
shows their signature, and go-to-definition lands on the field that generated
them.
