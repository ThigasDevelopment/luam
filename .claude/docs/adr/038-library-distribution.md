# ADR-038: Distribute Luam libraries as npm packages vendored into the resource

**Status:** Accepted

**Context:**
A Luam project has exactly one way to use code it did not write: the resource
export contract of [ADR-033](033-resource-export-abi.md), documented in
[exports.md](../../../docs/en/language/exports.md). That contract describes a
*runtime* boundary between two deployed MTA resources, and it is checked. It is
not a way to *obtain* code. There is no `luam add`, no manifest field naming an
external package, and no convention for publishing a library. A developer who
writes a pathfinding module and wants to share it posts it on a forum, and the
developer who wants it copies the files in.

Three constraints bound every option.

- **The network contract.** The compiler packages make no network calls, and a
  build with no network still succeeds. The CLI has exactly two allowed calls,
  neither of which may become a requirement for compiling. Any model where
  fetching a dependency happens inside `build` is out before it is evaluated.
- **MTA has no module system.** There is no `import` between files, and a
  resource is a flat set of scripts the server loads into one global namespace.
  A library is therefore either vendored into the consuming resource or deployed
  as its own resource and reached through exports. Those two have very different
  type stories, and only the first is a distribution model.
- **Luam already has a manifest.** `.luam.manifest` is a closed set of typed
  domains, each with one owner ([ADR-017](017-manifest-domain-contract.md)), and
  it is where a dependency would be declared.

One fact narrows the field further: **every Luam developer already has Node and
npm.** The CLI is installed with `npm install --global`, Node 20 is a documented
prerequisite, and the release artifact is an npm package. A distribution model
built on npm therefore adds no machine requirement to anybody who can run
`luam` at all.

**Options considered:**

- **npm packages, resolved from `node_modules` at compile time.** The registry,
  the version solver, the lockfile, the integrity checking, the mirroring, the
  yanking policy and the abuse response all already exist and are somebody
  else's job. Fetching is `npm install`, a step the developer runs, entirely
  outside `build`. The cost is that a Luam project that consumes a library gains
  a `package.json` and a `node_modules` directory, which today it does not have,
  and that the ecosystem's supply-chain hazards — install scripts above all —
  become Luam's hazards too.
- **Git URLs resolved by a `luam add`.** Frees a library author from publishing
  anywhere and works against private repositories with no extra infrastructure.
  It also requires Luam to own a resolver, a lockfile format, an integrity
  model, a cache and a credential story, and puts an outbound fetch inside the
  CLI for something npm already does better. Rejected: a large surface built to
  avoid a dependency the machine already has.
- **A vendored `libs/` directory with a lockfile.** Nothing is fetched, ever,
  and the build is offline by construction. It is also the status quo with
  bookkeeping added: there is no update path, no version, and no way to tell a
  patched copy from an original. Rejected as ceremony around copying files.
- **A registry Luam operates.** Would give the ecosystem a home page, a
  namespace and a search. It would also make the project responsible for
  uptime, storage, moderation and takedowns for as long as the ecosystem lives,
  in exchange for solving a problem npm has already solved. Rejected on cost.
- **Exports only — do nothing.** A legitimate answer: a library becomes its own
  MTA resource, the consumer lists it in `dependencies`, and ADR-033 checks the
  calls. It is genuinely the right shape for a service with state — a bank, a
  vehicle registry. It is the wrong shape for a pure function, because it turns
  every call into a cross-resource `call` and makes a five-line helper a
  deployment unit. Rejected as *the* answer, kept as *an* answer.

**Decision:**
**A Luam library is an npm package. The package manager fetches it; the compiler
reads it from disk and vendors it into the consuming resource.**

*What a library is.* An npm package whose `package.json` carries a `luam` field
naming its source patterns per environment, in the same shape as the manifest's
`sources` domain. Its code is `.luam` compiled from source, `.lua` copied
verbatim, or both, and it may ship `.d.luam` declaration files
([ADR-005](005-declaration-files.md)) for the Lua it does not compile. The
package's own `luam` field is the only place its layout is described; a
consumer's `sources` patterns are project-root relative and never reach inside
`node_modules`.

*How a project declares one.* A new manifest domain, `libraries`, listing
package names. Nothing is implicit: a package present in `node_modules` and
absent from `libraries` is not compiled, because a build must be a function of
reviewed files rather than of install state. A name in `libraries` with no
package on disk is a configuration error naming the package and the install
command — not a fetch.

`dependencies` is untouched and keeps its meaning: MTA resources written as
`<include>`. The two are different questions and stay different fields.

*Where the code lands.* Vendored, because MTA leaves no other choice. In tree
layout a library compiles to `libs/<package>/<environment>/`, beside the
`lib/<environment>/` runtime helpers of
[ADR-008](008-generated-manifest-standard.md); in bundle layout its modules are
concatenated into the environment bundle ahead of the project's own
([ADR-016](016-flat-bundle-concatenation.md)). A scoped name is flattened —
`@scope/name` becomes `scope-name` — so no `@` or nested scope directory reaches
an MTA path.

*How types reach the checker.* By compiling the library's source, not by
trusting a hand-written summary. A library's `.luam` files are parsed and
checked as part of the consuming project, so its types are exactly as precise as
its code, and a library that does not type-check fails the consumer's build
rather than degrading silently. `.d.luam` covers the verbatim-Lua half and emits
nothing, as it already does. There is no third artifact and no serialization
step: unlike ADR-033, the source is right there on disk.

*How the environment is declared.* By the library, per file, through its own
`luam` field — a library is `shared`, `server`, `client`, or ships more than one
half. The consumer does not get to reassign it. Once resolved, a library file is
an ordinary file of that environment: a `server` library symbol used from a
client file is the environment error that already exists
([ADR-023](023-file-level-environments.md)), with no new rule.

*Transitive dependencies do not exist.* Luam reads the packages the manifest
names and stops. This is deliberate, not an omission deferred: Lua 5.1 has one
flat global namespace, so two versions of one library cannot coexist in a
resource, and a resolver would spend its whole surface producing conflicts it
has no way to resolve. Instead a library *declares* what it needs, in a
`requires` list inside its `luam` field, and a consumer whose `libraries` omits
one gets a diagnostic naming the missing package. The developer resolves the
graph, with the compiler telling them exactly what is missing. npm still
installs the package graph; Luam simply does not walk it.

*Collisions are reported, not resolved.* Every top-level name a library declares
becomes a global in the consuming resource. Two libraries claiming one name, or
a library claiming a name the project defines, is a diagnostic naming both
sources. Last-write-wins in a flat namespace is the failure mode this model has
to own, and the answer is to make it loud at compile time rather than mysterious
at runtime.

*`meta.xml` ordering is explicit and deterministic.* Library scripts are emitted
as enumerated `<script>` entries — never wildcards, since the compiler owns
those paths — in a section of their own placed after the runtime library and
before `config.lua`, the pinned `loadOrder` entries and the source wildcards.
Libraries appear in the order the `libraries` array declares, and a library's own
files in the order its `luam` field declares. Runtime helpers keep their place
first: a library that names `Threads` or `Async` feeds the same requirement set
the reference trigger already computes, so a helper a library needs is emitted
once, ahead of everything, exactly as a helper the project needs is.

*Fetching happens in the package manager, never in a build.* `npm install` — or
`pnpm`, or whatever the developer uses — is the only step that touches the
network, and it is a step a person runs. `build`, `check`, `ensure`, `dev` and
`test` read `node_modules` from the disk. A machine with no network and a
populated `node_modules` builds byte-identically. The CLI's two allowed outbound
calls are unchanged, and no third is introduced.

*Luam operates no infrastructure.* No registry, no index, no mirror, no
package host. Discovery is npm's search plus a `luam` keyword convention that
costs nothing and obliges nobody. The consumer's lockfile is the package
manager's, committed and reviewed like any other lockfile.

*Library source is untrusted input.* It is compiled, never executed — the
compiler stays inert, and nothing in this decision changes that. Every path a
library's `luam` field names is contained to the package directory, in the same
way the `contracts` directory is contained to the project. The real exposure is
one this decision inherits rather than creates: npm install scripts run with the
developer's privileges before Luam sees anything, and that is the package
manager's boundary, not the compiler's. The implementing milestone documents it
rather than pretending otherwise.

*This is orthogonal to ADR-033, and both stay.* ADR-033 is a runtime boundary
between two deployed resources, crossed by `call`, checked through a published
contract, with the provider's code running in the provider's process. This is a
compile-time source boundary: the library's code is compiled into the consumer
and ships as part of one resource. The question "call code running elsewhere"
and the question "obtain code to ship" are different, and a project will
routinely do both. A stateful service is still a resource with exports; a pure
module is a library.

*Deferred to the implementing milestone.* Whether a `luam add` convenience
exists at all. If it does, it spawns the developer's package manager and appends
to `libraries` — Luam opens no socket of its own — and it is never invoked by
`build`, `check`, `ensure`, `dev` or `test`. The primitive is `npm install`; a
wrapper is ergonomics, and shipping none is an acceptable outcome.

*The milestone that builds this* adds the `libraries` manifest domain and its
validation, package discovery and the `luam` package field, compilation of
library sources into the project graph with their own environments, the
collision and missing-requirement diagnostics, the vendored output layout in
both tree and bundle form, the `meta.xml` section and its ordering, library
sources hashed into the incremental cache base key the way contracts already
are, a published example library, and the authoring and consuming documents in
both language trees.

**Consequences:**

- Positive: versioning, integrity, lockfiles and a registry arrive for free from
  a tool every Luam developer already has installed, and the project runs
  nothing.
- Positive: a library's types are its source, so they cannot drift from it, and
  a broken library fails the consumer's build rather than degrading to `any`.
- Positive: fetching is a step a person runs. A build with no network still
  succeeds, and the compiler packages still make no calls.
- Positive: `meta.xml` ordering stays deterministic and reviewable, because
  library scripts are enumerated rather than matched by a pattern.
- Negative: a Luam project that consumes a library gains a `package.json` and a
  `node_modules` directory it did not have before. `luam init` still scaffolds
  neither.
- Negative: the flat Lua global namespace is not fixed by this, only policed. A
  library must still choose names carefully, and a collision is the consumer's
  problem to resolve by not using one of them.
- Negative: no transitive resolution. A library with three requirements makes
  the consumer list four packages, and the compiler's help stops at telling them
  which.
- Negative: npm's supply-chain risks become Luam's. An install script runs
  before the compiler is involved, and no decision made here can constrain it.
- Negative: a library is vendored, so every consuming resource carries its own
  copy. Two resources on one server that use the same library ship it twice, and
  the export model remains the answer when that matters.
