# Operators

## Arithmetic

| Operator | Meaning |
| --- | --- |
| `+` | Addition |
| `-` | Subtraction, and unary negation |
| `*` | Multiplication |
| `/` | Division |
| `%` | Modulo |
| `^` | Exponentiation |

## Comparison

| Operator | Meaning |
| --- | --- |
| `==` | Equal |
| `~=` | **Not equal.** `!=` is `lex-foreign-operator`. |
| `<` | Less than |
| `<=` | Less than or equal |
| `>` | Greater than |
| `>=` | Greater than or equal |

## Logical

| Operator | Meaning |
| --- | --- |
| `and` | Returns the first false value, or the last value |
| `or` | Returns the first true value, or the last value |
| `not` | Boolean negation |

`nil` and `false` are the only false values. An `or` default such as
`tonumber(x) or 0` produces the union `number? | number`, because Luam does no
narrowing — see [Limitations](/en/reference/limitations).

## String and table

| Operator | Meaning |
| --- | --- |
| `..` | Concatenation |
| `#` | Length, when written with **no space** before its operand |
| `[ ]` | Index |
| `.` | Member access, and [object extensions](/en/language/extensions) |
| `:` | Method call |

```luam
local total: number = #names   # length
# names                        # comment
```

## Compound assignment

| Operator | Equivalent |
| --- | --- |
| `+=` | `x = x + v` |
| `-=` | `x = x - v` |
| `*=` | `x = x * v` |
| `/=` | `x = x / v` |
| `..=` | `x = x .. v` |

## Increment and decrement

| Operator | Equivalent |
| --- | --- |
| `++` | `x = x + 1` |
| `--` | `x = x - 1` |

Both are **statements**, not expressions. `local y = x++` is
`parse-invalid-increment`.

`--` is the decrement operator, which is why comments moved to `#`. Writing a
Lua-style `-- comment` is `lex-foreign-comment`.

## Type punctuation

| Punctuation | Meaning | Page |
| --- | --- | --- |
| `:` | Introduces a type or a return type | [Types](/en/language/types) |
| `?` | Optional: allows `nil` | [Types](/en/language/types) |
| `\|` | Union | [Types](/en/language/types) |
| `[]` | Array of the preceding type | [Types](/en/language/types) |
| `<>` | Type parameters on a `type` alias | [Types](/en/language/types) |
| `fun(...)` | Function type | [Functions](/en/language/functions) |
| `=` in `type X = Y` | Type alias | [Types](/en/language/types) |

## Comments

| Form | Meaning |
| --- | --- |
| `# text` | Line comment. Hash followed by a space or end of line. |
| `#* text *#` | Block comment. |
| `#value` | Length operator. No space. |

Unterminated forms are `lex-unterminated-comment`.

## Strings

| Form | Meaning |
| --- | --- |
| `'text'`, `"text"` | String literals |
| `[[text]]` | Long bracket string, as in Lua |
| `` `text ${name}` `` | [Template string](/en/language/template-strings) |
| `${name:fallback}` | Interpolation with a default |

## Other punctuation

| Punctuation | Meaning |
| --- | --- |
| `...` | Variadic parameter and expression |
| `@` | Introduces a [decorator](/en/language/decorators) |
| `{ }` | Table constructor, and class, interface and enum bodies |
| `( )` | Grouping and call arguments |
| `;` | Optional statement separator |
| `,` | Separates list elements |

## Precedence

Precedence and associativity follow Lua 5.1 exactly, lowest to highest:

```
or
and
<  >  <=  >=  ~=  ==
..                     (right associative)
+  -
*  /  %
not  #  - (unary)
^                      (right associative)
```

Compound assignment, `++` and `--` are statements and therefore take no part in
expression precedence.
