# Template strings

A template string is delimited by backticks and interpolates values with
`${...}`.

```luam expect-error
local greeting: string = `Welcome to ${serverName}!`
```

It compiles to plain concatenation through the `string` runtime helper, so the
generated Lua stays readable and MTA-compatible.

## Defaults

`${name:fallback}` uses the fallback when the value is `nil`:

```luam
local caption: string = `HUD ${title:untitled}`
```

The fallback is literal text up to the closing brace. It is not an expression.

A fallback also relaxes the scope rule below. `${title:untitled}` compiles even
where `title` is not declared, because the fallback already states that the value
may be missing. Without one, the name has to be in scope.

## Member paths

An interpolation may walk a table:

```luam expect-error
local line: string = `Player ${session.player}`
```

## The scope rule

::: warning An interpolation takes a name, not an expression
`${getPlayerName(player)}` is `check-unknown-template-root`. The compiler
resolves the root of the path in the current scope, so a call, an operator or a
literal inside `${...}` is rejected, with or without a fallback.
:::

Compute the value first:

```luam
local name: string = getPlayerName(player)
local uptime: number = getTickCount() - startedAt

outputChatBox(`${name} has been here ${uptime} ms`, root)
```

This is what makes the feature safe: every interpolated name is either a name the
checker has already seen or one you marked as optional with a fallback, so a typo
inside a string is a build error rather than a `nil` in the chat box.

## A complete example

<<< @/snippets/language/src/shared/template-strings.luam

## Emitted Lua

```luam expect-error
local greeting: string = `Welcome to ${serverName}!`
```

becomes concatenation of the literal parts with the interpolated values — no
runtime template parsing, and no `string.format` call to keep in sync with its
arguments.

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `` `${getName(p)}` `` | `check-unknown-template-root` |
| `` `${}` `` | `check-empty-interpolation` |
| `` `${name` `` | `lex-unterminated-interpolation` |
| `` `text `` with no closing backtick | `lex-unterminated-template` |
