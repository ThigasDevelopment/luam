# Environments

Every file resolves to exactly one environment — `server`, `client` or `shared` —
**before anything else runs**. That decision drives which MTA APIs exist, which
events exist, which globals from other files are visible, and where the compiled
file is declared in `meta.xml`.

## How the environment is decided

1. A `#!server`, `#!client` or `#!shared` directive on the file, if present.
2. Otherwise, the first path segment under a source directory:

| Path | Environment |
| --- | --- |
| `src/server/**` | `server` |
| `src/client/**` | `client` |
| `src/shared/**` | `shared` |

```luam
#!client

dxDrawText('hud', 10, 10)
```

A directive wins over the folder, which is what lets a single file live outside
the usual tree.

## What each environment may use

| File | May use |
| --- | --- |
| `server` | `server` declarations and `shared` declarations |
| `client` | `client` declarations and `shared` declarations |
| `shared` | `shared` declarations only |

`server` and `client` never see each other. `shared` is the strictest of the
three, because its code has to be valid on both sides.

```luam
# src/server/admin.luam
outputChatBox('hi', player)   # ok, outputChatBox is shared
dxDrawText('hud', 10, 10)     # check-environment-api
```

```luam
# src/shared/util.luam
outputDebugString('hello')    # ok, outputDebugString is shared
kickPlayer(player)            # check-environment-api: kickPlayer is server-only
```

## Globals follow the same rule

A global declared by another file is visible only when the environments are
compatible. A `server` file sees globals from `shared` modules and from other
`server` modules, never from `client` modules. Breaking that is
`project-environment-import`.

This is why a shared helper is the right home for anything both sides need:

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

## Events are scoped too

`onPlayerJoin` is a server event and `onClientRender` is a client one. Handling an
event from the wrong side is `check-environment-event`:

```luam
# src/server/main.luam
addEventHandler('onClientRender', root, draw)   # check-environment-event
```

See [APIs and events](/en/mta/apis-and-events).

## Unknown names stay `any`

A name the catalog does not know resolves to `any` rather than failing. A function
added in a newer MTA release than the pinned catalog snapshot therefore keeps
compiling — you lose completion and argument checking for it, not the build.

## In the editor

Completion is scoped exactly like the checker: `dxDrawText` never appears in a
server file and `kickPlayer` never appears in a client file. Hover reports the
environment of an MTA API, so you can see why a name is missing.

## What reaches meta.xml

The environment decides the `type` attribute of the generated `<script>` entry:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

A server entry carries neither attribute because both equal the MTA default. See
[Resources and meta.xml](/en/mta/resources).
