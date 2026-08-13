# Shared function

One function, written once in `src/shared`, called from both the server and the
client.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).

## File tree

```
luam-docs-shared-function/
├── .luam.manifest
└── src/
    ├── shared/labels.luam
    ├── server/greet.luam
    └── client/greet.luam
```

## Source

<<< @/snippets/shared-function/.luam.manifest{js}

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

<<< @/snippets/shared-function/src/client/greet.luam

## Why this works

`src/shared` resolves to the `shared` environment, so its globals are visible to
both the server and the client files. The compiler knows that without any import
statement — the folder is the declaration.

The reverse is enforced too: a `shared` file may use only `shared` APIs. That is
why `labels.luam` contains no `outputChatBox` (server) and no `dxDrawText`
(client). Moving either call into the shared file is `check-environment-api`.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/shared-function.check.txt{text}

`meta.xml` declares one wildcard per environment, in shared, server, client
order:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

A shared script is downloaded by clients, so **anything a player must not see
does not belong in `src/shared`**. See
[Security boundaries](/en/mta/security).

On the server, a joining player produces:

```
[luam-docs] Thigas joined.
```

## A common error

Calling a shared function from a client file works. Calling a **server** global
from a client file does not:

```
src/client/greet.luam:4:5 error project-environment-import: "announceJoin" is declared in the "server" module "src/server/greet.luam" and cannot be used from a "client" file.
```

Move the function into `src/shared` — or, if it must stay server-side, send a
message with `triggerClientEvent` instead.
