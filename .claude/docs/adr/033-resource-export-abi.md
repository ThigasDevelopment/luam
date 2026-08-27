# ADR-033: Publish resource exports as a versioned JSON contract

**Status:** Accepted

**Context:**
`export` marks a top-level function as callable from another MTA resource and writes an `<export>` entry into `meta.xml`. `meta.xml` carries a name, a side, and an HTTP flag — nothing about the signature. A consumer's `call(getResourceFromName('core'), 'getBalance', ...)` was therefore never checked, and a provider could rename a parameter's type without any consumer noticing until runtime.

The compiler cannot read the provider's source: a dependency is another project, possibly another repository, possibly not written in Luam at all.

**Options considered:**
- Parse the dependency's source directly. Highest precision, and it requires knowing where that source is, that it is Luam, and that it is checkable — none of which a resource name implies.
- Have authors publish a `.d.luam` declaration file by hand. Portable, and it drifts: the declaration is written once and the code moves.
- Generate a versioned artifact from the build that already type-checked the exports.

**Decision:**
Generate a JSON contract. A build that exports anything writes one file per resource — `<resource>.abi.json` — into the directory the manifest's `contracts` field names, default `.luam/contracts`, and reads the same directory for the contracts of resources listed in `dependencies`.

- The artifact is versioned by an `abi` integer. A document at another version is not read.
- It records, per export: name, side, HTTP flag, ordered parameters with names and types, minimum argument count, whether it is variadic, and the return type. Types are serialized with `typeToString`, which is the language's own type syntax, and the consumer parses them back with the same annotation parser. A type the consumer cannot resolve degrades to `any` rather than failing the build.
- It is written **outside** the runnable resource. MTA never sees it, and `build/<name>` is unchanged.
- It is written only after checking succeeds, and only when the resource exports something.
- Serialization is deterministic: exports are sorted by name, so an unchanged project produces a byte-identical file.

The consumer checks a call when both the resource name and the export name are literal, in either MTA form — `call(getResourceFromName('core'), 'getBalance', ...)` and `exports.core:getBalance(...)`, indexed or dotted. Arguments, argument count, return type, and the side the export runs on are checked against the contract. Anything dynamic compiles unchanged and is not claimed to be verified.

A contract is **untrusted input**. It is read through a parser that caps document size, export count, parameter count, and type-string length; requires the exact `abi` version; requires export and parameter names to be identifiers and the resource name to be free of path characters; and rejects the whole document rather than accepting a partial one. The directory it is read from is a `contained-path`, so a manifest cannot point it outside the project. A rejected file is a warning and the build carries on with that resource unchecked.

Contracts take part in the incremental cache: they are hashed into the base key, so changing a provider's contract rechecks the consumers and nothing else.

**Consequences:**
- Positive: a cross-resource call is checked with the same rules as a local one, including the environment gate, and a provider's signature change surfaces in the consumer's next check.
- Positive: a workspace of Luam projects pointed at one shared `contracts` directory checks across all of them without any of them reading another's source.
- Positive: the artifact is readable and diffable, so it can be committed and reviewed like a lockfile.
- Negative: the contract can be stale. It is a file, and the build trusts the file it finds rather than recompiling the provider to confirm it.
- Negative: types cross the boundary as strings. A name that means something in the provider and nothing in the consumer becomes `any`, so a class or interface type is only as precise as the consumer's own declarations.
- Negative: nothing checks at runtime. The contract describes what the provider exported when it was built, not what is loaded on the server.
