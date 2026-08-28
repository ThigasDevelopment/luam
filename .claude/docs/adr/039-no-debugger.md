# ADR-039: Ship no debugger, and keep the CLI out of a running server

**Status:** Accepted

**Context:**
Luam has never addressed debugging in its own right. The only place the product
says anything about it is the closing line of the development-logs entry in
[limitations.md](../../../docs/en/reference/limitations.md): evaluating an
expression on a running server "is a debugger, and it needs its own protocol and
its own security decision." That sentence is an aside at the end of an entry
about something else, and it carries none of the four labels the page uses to
tell a reader what will change from what will not. A developer reading it cannot
tell whether a debugger is coming.

It is worth being precise about what a developer already has, because the gap is
narrower than "there is no debugger" suggests.

- **Structured logs with authored positions.** `luam dev` follows the local
  `server.log` and prints server records and relayed client `outputDebugString`
  calls as one stream, and `luam dev --start-server` runs the server in the
  developer's own terminal.
- **Positions that map back to `.luam`.** The resource map from milestone 18 and
  `luam trace` turn a generated `src/server.lua:42` — or a whole error log piped
  in — back into the line the developer wrote.
- **Executable tests.** [ADR-037](037-test-execution-host.md) runs `luam test`
  on a Lua 5.1 interpreter discovered on the machine, with every MTA call for
  the file's environment replaced by a recording stub. Project code runs, is
  asserted against, and reports failures at `.luam` positions.
- **A checker that runs before any of it.** Most of what a step debugger is used
  to discover in an untyped Lua codebase — a nil field, a misspelled member, a
  wrong argument — is a diagnostic here.

What is missing is the live half: a breakpoint, stepping, and reading or
evaluating an expression in a process that is currently running the game.

Three constraints bound every option.

- **The CLI never opens a connection to an MTA server.** This is stated in
  [CLAUDE.md](../../CLAUDE.md) and it is not incidental: the `transport` manifest
  domain that configured a server connection was *removed*, and `ensure` writing
  files with `dev --start-server` driving a server the CLI owns is what replaced
  it. [24.12](../../plans/24.12-remote-development-bridge.md) — a remote
  development bridge, fully planned — is recorded as **not planned** for exactly
  this reason. A debugger is a connection to a running server by definition, so
  shipping one reverses the same decision a third time.
- **A debug protocol on a live server is remote code execution against it.** An
  MTA server is a multiplayer process with players connected to it. Anything
  that evaluates an expression inside it can call every MTA API the resource
  can, and an exposed port is a server takeover, not a leaked stack frame. Any
  design has to answer who may attach, over what, and what happens when the port
  is reachable — before it is worth writing.
- **MTA publishes nothing to interoperate with.** It offers a debug console with
  `debugscript` levels, writes `server.log`, and gives a script
  `outputDebugString` and the Lua 5.1 `debug` library inside the resource
  sandbox. There is no debug protocol, no breakpoint primitive, and no way to
  suspend one resource: a Lua debug hook that stops on a line stops the thread
  the server is running, which freezes the game for every connected player. Luam
  would not be adopting an ecosystem convention; it would be inventing one and
  asking server operators to load it.

**Options considered:**

- **Reaffirm: ship no debugger, and label the boundary.** Costs one section on
  the limitations page and closes the question in writing. The developer keeps
  logs, mapped positions, tests and the checker, and loses nothing they have
  today. The cost is that the missing live half stays missing, and a developer
  arriving from an editor with a debugger has to hear "no" with a reason instead
  of a roadmap entry.
- **A Debug Adapter Protocol server in the CLI, attached to a live MTA server.**
  The shape an editor already understands: breakpoints in the `.luam` file,
  stepping, a variables pane, an evaluate box. It requires a debug agent shipped
  inside the developer's resource, a channel out of the server process, an
  authentication story, and the CLI dialling it — reviving `transport` under a
  new name. It also cannot deliver the primitive it exists for: pausing on a
  breakpoint stops the shared server thread, so the debug session is a frozen
  server. Rejected on the invariant and on the platform, either of which is
  fatal alone.
- **An eval-only channel, no breakpoints.** A smaller surface: a
  development-only resource endpoint that evaluates a string and returns the
  result, gated on a token. Strictly cheaper to build, and strictly the worst
  part of a debugger from a security standpoint — arbitrary code execution on a
  live game server is the whole feature rather than a side effect. 24.12 already
  recorded this option and already rejected it. Rejected again.
- **A debugger over the test host, never over a server.** `luam test` already
  runs project code in a process the CLI owns, offline, with stubbed MTA calls.
  A step debugger there would break no invariant, because there is no server and
  no connection. It is also the option with the least to offer: the interesting
  bugs in an MTA resource involve elements, events and other players, and the
  test host has none of those on purpose. Rejected for now, and recorded as the
  only direction that would not require amending the network invariant first.
- **Improve print debugging instead.** Compiler-assisted tracing — a helper that
  prints a value with its authored position, or a directive that logs every call
  in a function. Real value and no protocol, but it is a feature request, not an
  answer to "does Luam ship a debugger". Out of scope here; nothing in this ADR
  blocks it.

**Decision:**
**Luam ships no debugger. The CLI does not attach to a running MTA server, and
the boundary is recorded as a design boundary rather than as a gap.**

*What this closes.* Breakpoints, stepping, pausing a resource, inspecting a live
value, and evaluating an expression in a running server are not planned. Not
deferred to a later milestone, not waiting on demand — decided against, for the
reasons above.

*What answers the need instead.* `luam dev` for structured logs with source
positions, `luam trace` and the resource map for turning a runtime position back
into an authored one, `luam test` for running project code and asserting on it
off the server, and the checker for the class of mistake a debugger is most
often used to find. Every one of those already ships.

*The network invariant stands, unamended.* The compiler packages make no network
calls, the CLI's two allowed outbound calls are unchanged, and no third is
introduced. `transport` stays removed. 24.12 stays not planned. The rule in
CLAUDE.md — the CLI never opens a connection to an MTA server — is not weakened
by this decision; this decision is that rule applied to the one feature that
would have forced the question.

*The security model is not deferred, because there is nothing to secure.* This
is the substantive half of the decision. A live debug channel would have to
answer who may attach, over what transport, what may be evaluated, and what
happens when the port is reachable from outside the machine. The honest answer
to the last one is that an exposed debug port on a game server is a full
compromise of it, and no token scheme the project could ship changes what an
attacker does once attached. Refusing the channel is the security model.

*This constrains, and is constrained by,
[33.01](../../plans/33.01-luam-test-command.md).* A test runner and a debugger
both want to execute project code, and the product has now answered that
question once: project code runs in a process the CLI starts, on a discovered
Lua 5.1 interpreter, with MTA stubbed — never in the server. `luam test` is the
sanctioned way to run Luam code and watch what it does. A debugger asking for
the opposite — a live server, real elements, real players — is asking to reverse
ADR-037's boundary as well as CLAUDE.md's.

*What would have to happen to reopen this.* Two things, in order. First, the
platform: MTA would have to offer a way to suspend a resource without suspending
the server, or the debugger is a frozen game. Second, the product: shipping any
live channel requires amending the CLI-never-connects rule in CLAUDE.md
explicitly, as a recorded decision, before a line of it is written. The offline
test-host debugger is the one shape that needs neither, and it is where a future
attempt should start.

**Consequences:**

- Positive: the question is answered in writing, with a label a reader can act
  on. Whether a debugger is coming no longer depends on reading an aside at the
  end of an unrelated entry.
- Positive: the network invariant is reinforced rather than eroded. Three
  separate decisions — removing `transport`, shelving 24.12, and this — now
  point the same way, and the CLI still opens no socket to a server.
- Positive: no remote code execution surface is introduced against a live game
  server, and none has to be secured, documented, or supported.
- Positive: the work stays on the tools that already pay off. Logs, position
  mapping, the test runner and the checker cover most of what the missing
  feature would have been used for.
- Negative: a developer chasing a bug that only reproduces with real players, on
  a live server, still reads logs. There is no stepping, and this decision says
  there will not be.
- Negative: Luam is measured against TypeScript and Luau, and both have a
  debugger story. The comparison is unfavourable, and answering it is a
  paragraph on the limitations page rather than a feature.
- Negative: the position mapping from milestone 18 is most of a debugger's
  hardest problem and it stays unused for that purpose. If this is ever
  reopened, that work is still there.
