# Exports

`export` marks a top-level function as callable by **other MTA resources**. The
keyword is erased from the generated Lua; what it produces is an entry in
`meta.xml`.

```luam
export function getScore(player: Player): number
    return getElementHealth(player)
end
```

```xml
<export function="getScore" type="server" http="false" />
```

## Calling an export

From another resource, in plain Lua:

```lua
local score = exports['luam-docs-exported-function']:getScore(player)
```

The export's `type` follows the file's environment, so a function in
`src/server` is exported to the server side and a function in `src/client` to the
client side.

## HTTP access

Add the contextual `http` modifier to let MTA's HTTP server call the function:

```luam
export http function getPlayerCount(): number
    return getPlayerCount()
end
```

```xml
<export function="getPlayerCount" type="server" http="true" />
```

Without the modifier, the compiler always emits `http="false"`. Outside an
`export` directive, `http` remains an ordinary identifier. Remote access also
depends on the `resource.<name>.http` ACL right and the server's authentication
configuration.

## Rules

| Rule | Diagnostic when broken |
| --- | --- |
| `export` applies to a top-level function only. | `check-export-not-top-level` |
| The function must be a plain global name, not a table member. | `check-export-member` |
| A `.d.luam` file emits no code, so it cannot export. | `check-export-in-declaration-file` |
| Two files may not export the same name. | `project-duplicate-export` |
| `export` may not be applied to a `local function`. | `parse-export-local` |

```luam static
export function api.getScore(): number   # check-export-member
```

## `export` is reserved

`export` is a reserved word, so it cannot name a variable. Porting Lua that uses
it as an identifier means renaming it. It is still allowed as a property name:

```luam
local settings: table = { export = true }

print(settings.export)
```

See [Keywords](/en/reference/keywords).

## The export contract

A build that exports anything writes a contract beside the resource — one JSON
file per resource, in the directory
[`contracts`](/en/reference/configuration-fields) names, defaulting to
`.luam/contracts`. It records each export's name, side, HTTP flag, parameter
names and types, minimum argument count and return type. It is not part of the
runnable resource; nothing is copied into `build/<name>`.

```json
{
    "abi": 1,
    "resource": "core",
    "exports": [
        {
            "name": "getBalance",
            "side": "server",
            "http": false,
            "parameters": [{ "name": "id", "type": "string" }],
            "minimumArguments": 1,
            "variadic": false,
            "returns": "number"
        }
    ]
}
```

A project that declares `core` in `dependencies` and finds `core.abi.json` in
that directory gets its calls checked — arguments, argument count, return type
and the side the export runs on:

```luam static
local balance: number = call(getResourceFromName('core'), 'getBalance', 'thigas')
local same: number = exports.core:getBalance('thigas')
```

Passing a `number` where the contract says `string` is `check-type-mismatch`,
naming an export the contract does not declare is
`check-unknown-resource-export`, and calling a client-only export from a server
file is `check-resource-export-side`.

Point several projects at one shared directory and the whole workspace checks
across resources. A contract that is missing, unreadable, or names another
resource is skipped with `build-invalid-contract`; the build carries on and
those calls stay unchecked.

## What is not verified

A call whose resource name or export name is computed at runtime is never
checked, with or without a contract — there is nothing to resolve. Neither is a
call into a resource with no contract on disk. See
[Limitations](/en/reference/limitations).

## A complete example

<<< @/snippets/language/src/server/exports.luam
