# Client HUD

Text drawn every frame, toggled with a key, and cleaned up when the resource
stops.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- A running MTA server and a client to join with.

## File tree

```
luam-docs-client-hud/
├── luam.json
└── src/
    └── client/
        └── hud.luam
```

## Source

<<< @/snippets/client-hud/luam.json

<<< @/snippets/client-hud/src/client/hud.luam

## What to notice

- **`draw` is a named local.** `onClientRender` fires every frame, so the handler
  must be removable — `removeEventHandler` needs the same function value that was
  added. An anonymous function cannot be removed.
- **The caption is a template string.** `${name}` and `${health}` are locals, so
  the checker verified both names before the string existed.
- **`localPlayer` is client-only.** Using it from `src/server` is
  `check-environment-api`; so is `dxDrawText`.
- **Cleanup on `onClientResourceStop`.** Without it, a restarted resource leaves
  the old render handler attached.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/client-hud.check.txt{text}

`meta.xml` declares the client wildcard, with caching off:

```xml
<script src="src/client/**/*.lua" type="client" cache="false" />
```

In game, the top-left corner shows `Thigas — 100 HP`, and `F7` toggles it.

## A common error

Moving this file to `src/server` produces one error per client-only name — six for
this file, not one for the file:

```
src/server/hud.luam:9:45 error check-environment-api: API "localPlayer" is client-only and is not available in a "server" file.
src/server/hud.luam:10:40 error check-environment-api: API "localPlayer" is client-only and is not available in a "server" file.
src/server/hud.luam:13:5 error check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
src/server/hud.luam:16:16 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
src/server/hud.luam:18:16 error check-environment-event: Event "onClientResourceStop" is client-only and cannot be used in a "server" file.
src/server/hud.luam:19:23 error check-environment-event: Event "onClientRender" is client-only and cannot be used in a "server" file.
```

Two names are **absent** from that list: `getElementHealth` and `getPlayerName`
are shared, so they resolve on either side. `bindKey` is absent too — it is shared
in the catalog. Only genuinely client-only names fail, which is why moving a file
never produces a single blanket error. The fix is the folder, or a `#!client`
directive on the first line.

## Security note

Client scripts are downloaded to every player's machine and can be read there.
A HUD is fine; a threshold that decides whether an action is allowed is not — keep
that decision on the server. See [Security boundaries](/en/mta/security).
