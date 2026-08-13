# Event handler

Handlers for built-in MTA events on both sides, each scoped to the environment
that owns the event.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).

## File tree

```
luam-docs-event-handler/
├── .luam.manifest
└── src/
    ├── server/join-listener.luam
    └── client/render-listener.luam
```

## Source

<<< @/snippets/event-handler/.luam.manifest{js}

<<< @/snippets/event-handler/src/server/join-listener.luam

<<< @/snippets/event-handler/src/client/render-listener.luam

## What to notice

- **`source` is annotated.** Inside a handler, `source` carries no type by
  itself. `local player: Player = source` is what gives you `getPlayerName` with
  checking and completion.
- **Handler parameters are typed.** `onPlayerQuit` passes a reason, and
  annotating it as `string` makes the interpolation below it safe.
- **The interpolated value is a local.** `${getPlayerName(player)}` would be
  `check-unknown-template-root` — compute the name first.
- **`root` versus `resourceRoot`.** `root` covers every element on the server;
  `resourceRoot` covers only this resource, which is what a stop handler wants.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/event-handler.check.txt{text}

A joining player produces a chat line for everyone, and a leaving player writes a
line to `server.log`. The client counts frames and reports the total to the debug
console when the resource stops.

## A common error

Handling a client event from a server file:

```
src/server/join-listener.luam:3:1 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
```

Events are scoped exactly like APIs. Move the handler to `src/client`, or use the
server event that matches what you need.

## Custom events

An event the catalog does not know is not an error, so `addEvent` plus
`addEventHandler` keeps working:

```luam
addEvent('onMatchStarted', true)

addEventHandler('onMatchStarted', root, function(round: number)
    outputChatBox(`round ${round}`, root)
end)
```

## Security note

A handler for an event a client can trigger receives whatever that client chose
to send. The type annotation is erased at build time, so it is a compile-time
contract, not a runtime guard — validate the values before acting on them. See
[Security boundaries](/en/mta/security).
