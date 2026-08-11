# APIs and events

## The catalog

The MTA surface is a **generated** catalog, produced from the MTA wiki and
shipped inside the compiler. It is the single source of truth for what a
`server`, `client` or `shared` file may use.

| Kind | Count |
| --- | --- |
| API declarations | 1294 |
| Events | 203 |
| Element types | 57 |

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

```luam
addEventHandler('onPlayerJoin', root, function()
    local player: Player = source

    outputChatBox(getPlayerName(player) .. ' joined.', root)
end)
```

## Events

An event name is checked against the catalog and against the file's environment:

```luam
# src/server/join.luam
addEventHandler('onPlayerJoin', root, function() end)      # ok
addEventHandler('onClientRender', root, function() end)    # check-environment-event
```

| Environment | Typical events |
| --- | --- |
| `server` | `onPlayerJoin`, `onPlayerQuit`, `onResourceStart`, `onPlayerChat` |
| `client` | `onClientRender`, `onClientResourceStart`, `onClientKey` |

An event the catalog does not know is not an error — custom events created with
`addEvent` keep working.

## An unknown name is not an error

The catalog is a pinned snapshot, so it can lag an MTA release. A name it does not
know resolves to `any`: the call compiles, and you lose completion and argument
checking for it only. That is deliberate — a newer MTA function must never block
a build.

## A complete example

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam
