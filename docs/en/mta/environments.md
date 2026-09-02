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

```luam env=client
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
| `shared` | everything — the shared declarations and both sides |

`server` and `client` never see each other, and using the other side's API is an
error that stops the build.

```luam env=client
# src/server/admin.luam
outputChatBox('hi', player)   # ok, outputChatBox is shared
dxDrawText('hud', 10, 10)     # check-environment-api, error
```

A `shared` file is different. It runs on both sides, so it sees everything and the
checker says nothing about which side a name belongs to:

```luam env=shared
# src/shared/util.luam
outputDebugString('hello')    # outputDebugString is shared
kickPlayer(player)            # kickPlayer is server-only — accepted, no diagnostic
```

The file is `shared` because you said so — through its folder, the `sources`
mapping or a `#!shared` directive. The compiler takes that as the decision it is
and does not ask again on every line.

What it does **not** do is verify the runtime branch. Nothing stops `kickPlayer`
from being reached on the client, where it does not exist, and that fails at
runtime with an attempt to call a `nil` value. In a shared file, keeping each
side-restricted call behind the right branch is yours to get right.

The editor is where the side still shows up: completion badges a side-restricted
name with `(client)` or `(server)`, and hover names its side. You see it when you
pick the name rather than after you have written the line.

## Deciding the side at runtime

A module that has to work on both sides asks which side it is on and branches. The
usual test is whether `localPlayer` is an element, which is only true on the client:

```luam env=shared
# src/shared/network.luam
class Network {
    isClient: boolean = false

    constructor = function ()
        self.isClient = isElement(localPlayer)
    end

    emit = function (name: string, target: Element): void
        if self.isClient then
            triggerServerEvent(name, target)
        else
            triggerClientEvent(target, name, target)
        end
    end
}
```

That file compiles clean — no error, no warning. The types are real, so the checking
you care about is still there: `localPlayer` is a `Player`, and both trigger
functions keep their signatures, so `triggerServerEvent()` with no arguments is
still `check-argument-count`.

What the compiler cannot do is verify the branch. `self.isClient` is a field, not an
expression it can reason about; if the branch is wrong — inverted, or bypassed by
another method — the call reaches the wrong side and fails at runtime.

If you do not need both sides in one file, prefer two files. This exists for the
module that genuinely cannot be split.

## Globals follow the same rule

A global declared by another file is visible only when the environments are
compatible. A `server` file sees globals from `shared` modules and from other
`server` modules, never from `client` modules. Breaking that is
`project-environment-import`.

This rule does **not** relax for a `shared` file: importing a `server` or `client`
module from `shared` stays an error. An import resolves when the chunk loads, so no
runtime branch can undo it.

This is why a shared helper is the right home for anything both sides need:

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

## Events are scoped too

`onPlayerJoin` is a server event and `onClientRender` is a client one. Handling an
event from the wrong side is `check-environment-event` — an error in a `server` or
`client` file, and nothing at all in a `shared` one:

```luam env=client
# src/server/main.luam
addEventHandler('onClientRender', root, draw)   # check-environment-event, error
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

A `shared` file gets both sides. The shared APIs come first, as the standard list;
the server and client ones follow as complements, each carrying its side in the
item detail — so a name with no side badge is safe on both sides. Hover on one of
them shows the full signature plus a line naming its side. This is the only place
the side is reported in a shared file, which is why it is worth reading.

## What reaches meta.xml

The environment decides the `type` attribute of the generated `<script>` entry:

```xml
<script src="src/shared/**/*.lua" type="shared" cache="false" />
<script src="src/server/**/*.lua" />
<script src="src/client/**/*.lua" type="client" cache="false" />
```

A server entry carries neither attribute because both equal the MTA default. See
[Resources and meta.xml](/en/mta/resources).
