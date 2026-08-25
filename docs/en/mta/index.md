# MTA

Luam is built for Multi Theft Auto specifically. It knows which API belongs to
which side, which events exist, what a resource looks like on disk, and where the
boundary between a server and a player's machine is.

| Page | What it covers |
| --- | --- |
| [Environments](/en/mta/environments) | How `server`, `client` and `shared` are decided and enforced. |
| [APIs and events](/en/mta/apis-and-events) | The generated catalog, element types, and event scoping. |
| [OOP API](/en/mta/oop) | `player:getName()`, static methods, and callable constructors. |
| [Resources and meta.xml](/en/mta/resources) | What a build writes, and how the manifest is generated. |
| [config.lua and .env](/en/mta/configuration) | The two settings files and who owns each. |
| [Security boundaries](/en/mta/security) | What a client can see, and what must stay on the server. |

## The catalog

The compiler ships a generated catalog of the MTA surface:

| Kind | Count |
| --- | --- |
| API declarations | 1413 |
| Events | 203 |
| Element types | 58 |
| OOP classes | 58 |
| OOP methods | 656 |
| OOP static methods | 120 |
| OOP constructors | 47 |

The Lua 5.1 standard library is declared alongside it. The catalog is generated
from the MTA wiki, so it can lag a release: a name the catalog does not know stays
`any`, which means a missing declaration never blocks a build.

## The rule that catches the most bugs

Every file is `server`, `client` or `shared`, and that decides which APIs and
events resolve:

```luam static
#!client

dxDrawText('hud', 10, 10)     # ok
kickPlayer(target, 'afk')     # error: kickPlayer is server-only
```

`server` and `client` files may use `shared` declarations. A `shared` file may use
only `shared` ones. `server` and `client` never see each other.
