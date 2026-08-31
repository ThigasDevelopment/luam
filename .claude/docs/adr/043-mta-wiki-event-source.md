# ADR-043: Generate the MTA event handler signatures from the wiki snapshot

**Status:** Accepted

**Extends:** [ADR-029](029-mta-wiki-catalog-source.md)

**Context:**
[ADR-029](029-mta-wiki-catalog-source.md) moved the function catalog to a
committed wiki snapshot and demoted `mtasa-lua-types` to a tiebreaker. It left
one surface behind: the event handler signatures still came entirely from the
frozen package, parsed out of its `server/event` and `client/event` interface
declarations. The snapshot already carried all 221 event pages, but the
generator read them only for prose, keying the parameter documentation off the
names the upstream declarations happened to use.

Measured on 2026-08-31 against the snapshot's 221 event pages:

- The catalog declared 203 events — 79 server, 124 client. 18 were missing:
  16 server and 2 client, among them `onAccountCreate`, `onExplosion`,
  `onShutdown`, `onPlayerTeamChange`, `onPlayerTeleport`,
  `onResourceStateChange`, and `onClientCoreCommand`. An event MTA fires but the
  catalog does not declare has no handler signature, so the checker types every
  one of its parameters as `any`.
- 7 signatures were short of the wiki's parameter list. `onVehicleExplode`
  declared no parameters against the wiki's two. `onPlayerWasted`, `onPedWasted`
  and `onClientPlayerWasted` were missing `animGroup` and `animID`;
  `onDebugMessage` was missing `r`, `g` and `b`; `onPlayerPrivateMessage` was
  missing `content`.
- 4 element parameters had degraded to `any`, from two distinct defects in the
  upstream type mapper. `onChatMessage` declares `Resource | Element`, and
  `mapUnion` returns `any` for any union whose members are not identical. The
  three pickup events declare `Pickup`, which `server/structure.d.ts` aliases to
  `Userdata`, and `mapReference` resolves a type alias before it checks the
  element hierarchy — so the alias won over the element type that
  `element-types.ts` already declared.
- 4 more carried parameter names the wiki has since renamed, which the generated
  documentation then attached to the wrong argument: `isMain`,
  `loss`, `bodypart` and `weapon` against the wiki's `isMainFrame`,
  `lossOrStealth`, `bodyPart` and `weaponID`.

None of this was visible. The event tests asserted the counts the frozen source
produced, so they passed on every number above.

The wiki event pages parse as reliably as the function pages, and in a simpler
shape: the `Parameters` section holds one `<syntaxhighlight lang="lua">` block
carrying a bare comma-separated list, with the same three bracket notations
ADR-029 already handles. All 221 pages carry the section. Their type vocabulary
is closed and small — 20 spellings, every one of which the existing wiki type
mapper already knew apart from `double`.

**Options considered:**
- **Keep `mtasa-lua-types` primary for events** — it is the same dead source
  ADR-029 rejected, three and a half years behind MTA. Rejected.
- **Fix only the two type-mapper defects** — recovers the 4 `any` parameters and
  nothing else. The 18 missing events and the 7 short signatures stay, and the
  source stays frozen, so the same gap reopens with the next MTA release.
  Rejected.
- **Hand-write the 28 corrections in `catalog-overrides.ts`** — a manual list
  that has to be re-measured against the wiki on every MTA release, which is the
  maintenance shape ADR-029 rejected for functions. Rejected as the primary
  source; retained as the escape hatch for the two pages below.
- **Wiki snapshot primary, upstream retained for what the wiki omits** — the
  wiki is a strict superset here: every one of the 203 declared events is on it,
  under the same side, so the retained path is empty today. Accepted.

**Decision:**
Event handler signatures are parsed from the committed snapshot's event pages by
`scripts/wiki-event-parser.ts`, alongside the declarations. A page's side comes
from its `{{Server event}}` or `{{Client event}}` template — all 221 carry
exactly one — and its parameters from the Lua block in its `Parameters` section,
mapped by the same `mapWikiType` the function catalog uses. Names come from the
wiki, so the generated parameter documentation lines up with the signature by
construction rather than by the arity coincidence the previous lookup relied on.

A page that declares no parameters in prose — `No parameters.`, `''None''`,
`This event has no parameters.` — yields an empty signature. A page whose
`Parameters` section carries neither a Lua block nor one of those wordings is
reported by name and fails the run, the same guard ADR-029 put on the Syntax
sections. Two pages fail it today: `onPlayerChangesProtectedData` lists its
parameters only as description bullets, and `onPlayerTriggerEventThreshold`
documents `eventName` inside a release template. Both are declared in
`EVENT_SIGNATURE_OVERRIDES` in `catalog-overrides.ts`, each with the reason it
is there.

`mtasa-lua-types` keeps the role it has for declarations: it supplies any event
the wiki does not list, and can never contribute one the wiki does. That path
retains nothing today and exists so a blanked or vandalised page cannot delete
an event from a user's type information.

**Consequences:**
- Positive: the catalog covers all 221 events MTA's curated lists name, against
  203, and every event page the snapshot carries is declared.
- Positive: 11 signatures gained the parameters or the element types the frozen
  source had lost, and 4 more carry the names the wiki uses today. The two
  type-mapper defects no longer reach events at all.
- Positive: events refresh on the schedule `catalog-refresh.yml` already runs.
  A new MTA event reaches the catalog with its parameters, not as a name.
- Positive: `double` is now mapped, which also corrects `onClientSoundBeat`.
  The spelling reached the function catalog through the same table.
- Negative: an event whose wiki page loses its Lua block fails the generation
  rather than falling back to the frozen declaration. This is deliberate — the
  previous behaviour is what hid the 18 missing events — but it means a wiki
  edit can block a refresh until an override is written.
- Negative: the two overridden pages are hand-maintained. The override keeps
  winning if the page grows a Lua block upstream, so generation reports both the
  hand-written signatures and the ones the wiki has caught up with, the same way
  it already reports the declaration overrides the wiki made redundant. Removing
  one is still a manual decision.
- Negative: `onPlayerWasted`, `onPedWasted`, `onClientPlayerWasted`,
  `onDebugMessage`, `onVehicleExplode` and `onPlayerPrivateMessage` gained
  required parameters. A handler already written against the shorter signature
  keeps compiling, since Luam accepts a handler that reads fewer arguments than
  the event passes, but hover and completion now show arguments that were absent
  before.
- Negative: the two type-mapper defects this ADR routes around still stand for
  the upstream path the OOP surface and the tiebreaker read. `Pickup`,
  `TextItem`, `TextDisplay` and `Request` remain aliased to `Userdata` on the
  server side there.
