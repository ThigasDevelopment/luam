# APIs and events

## The catalog

The MTA surface is a **generated** catalog, produced from the MTA wiki and
shipped inside the compiler. It is the single source of truth for what a
`server`, `client` or `shared` file may use.

| Kind | Count |
| --- | --- |
| API declarations | 1413 |
| Events | 221 |
| Element types | 58 |

The Lua 5.1 standard library — `math`, `string`, `table`, `os`, `tostring`,
`tonumber` and the rest — is declared alongside it.

## Calling an API

Arguments and the return type are checked:

```luam
local name: string = getPlayerName(player)
local ok: boolean = setElementHealth(player, 100)
```

| Mistake | Diagnostic |
| --- | --- |
| Wrong side | `check-environment-api` |
| Too few arguments | `check-argument-count` |
| Wrong argument type | `check-type-mismatch` |

Optional arguments are declared as such, so a call that omits them is fine.
Variadic MTA functions accept any number of trailing arguments.

## Multi-return

Functions that return several values are typed per position:

```luam
local x, y, z = getElementPosition(element)
```

`x`, `y` and `z` are `number`. See [Functions](/en/language/functions).

## Element types

`Player`, `Vehicle`, `Ped`, `Marker`, `Blip`, `ColShape` and the rest of the 57
element types are usable as types, and they respect MTA's element hierarchy:

```luam
function highlight(element: Element): boolean
    return setElementAlpha(element, 180)
end

highlight(vehicle)   # a Vehicle is an Element
```

`source` inside a handler is untyped by itself, so annotate it when you want the
element's API:

```luam env=server
addEventHandler('onPlayerJoin', root, function ()
    local player: Player = source

    outputChatBox(getPlayerName(player) .. ' joined.', root)
end)
```

## Events

An event name is checked against the catalog and against the file's environment:

```luam env=server expect-error
# src/server/join.luam
addEventHandler('onPlayerJoin', root, function () end)      # ok
addEventHandler('onClientRender', root, function () end)    # check-environment-event
```

| Environment | Typical events |
| --- | --- |
| `server` | `onPlayerJoin`, `onPlayerQuit`, `onResourceStart`, `onPlayerChat` |
| `client` | `onClientRender`, `onClientResourceStart`, `onClientKey` |

An event the catalog does not know is not an error — custom events created with
`addEvent` keep working.

## Typed handlers

Every event in the catalog carries the signature of its handler, so a callback
written against a known name gets its parameters typed with no annotation:

```luam env=server
addEventHandler('onPlayerQuit', root, function (quitType, reason, responsibleElement)
    # quitType: string, reason: string, responsibleElement: Element
    outputChatBox(quitType .. ': ' .. reason, responsibleElement)
end)
```

The signature is resolved in the environment of the call, so `onClientRender` in
a client file and `onPlayerQuit` in a server file each get their own parameters.

The payload of a trigger is checked against the same signature:

```luam env=server expect-error
triggerEvent('onPlayerQuit', root, 'Quit', 'Timed out.', root)   # ok
triggerEvent('onPlayerQuit', root, 1, 'Timed out.', root)        # check-type-mismatch
triggerEvent('onPlayerQuit', root, 'Quit')                       # check-argument-count
```

`triggerClientEvent`, `triggerServerEvent` and their latent variants are checked
against the signature that belongs to the **target** side, in both argument
orders.

A name the compiler cannot resolve — a variable instead of a literal, or an event
nobody declared — keeps the permissive MTA signature. Nothing is blocked.

## Custom events

`addEvent` creates an event at runtime and carries no types. `declare event`
gives that name a contract, and the contract types every handler and every
trigger of it:

```luam
declare event 'onMatchStart'(player: Player, round: number, ...tags: string)

addEvent('onMatchStart', true)

addEventHandler('onMatchStart', root, function (player, round)
    outputChatBox(getPlayerName(player) .. ' started round ' .. round, root)
end)

function startMatch(player: Player): void
    triggerEvent('onMatchStart', root, player, 1, 'ranked')
end
```

A declaration emits nothing — it is erased like a type annotation — and it takes
its environment from the file path: a contract under `src/shared` covers both
sides, one under `src/client` types what `triggerClientEvent` sends. The same
name may carry a different contract on each side. Keeping contracts in a
`.d.luam` file puts them all in one place; see
[Declaration files](/en/language/declaration-files).

Parameters follow the rules of a function signature: `round?: number` is
optional, `...tags: string` is a typed variadic, and an unannotated parameter is
`any`.

| Mistake | Diagnostic |
| --- | --- |
| The same event declared twice | `check-duplicate-event` |
| An empty event name | `check-invalid-event-name` |
| Two parameters with one name | `check-duplicate-event-parameter` |
| A variadic parameter that is not last | `check-invalid-event-parameter` |
| A return type other than `void` | `check-event-return-type` |

## An unknown name is not an error

The catalog is a pinned snapshot, so it can lag an MTA release. A name it does not
know resolves to `any`: the call compiles, and you lose completion and argument
checking for it only. That is deliberate — a newer MTA function must never block
a build.

## A complete example

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam
