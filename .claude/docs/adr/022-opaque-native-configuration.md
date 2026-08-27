# ADR-022: Keep a native `config.lua` opaque to compilation

**Status:** Accepted

**Context:**
MTA resources conventionally ship a `config.lua` written in plain Lua and loaded as a shared script before everything else. Luam supports that convention by reading the file as text, copying it into the resource unchanged, and writing a `<script src="config.lua" type="shared"/>` entry ahead of the compiled sources. The compiler never looks inside it, so a global the file defines is an unresolved name that degrades to `any`, and the documented way to get types for it is a declaration file. The question this records is whether that opacity is a gap or a boundary.

**Options considered:**
- **Execute `config.lua` at build time and read the resulting globals.** It would give exact values with no extra front end, and it would also run arbitrary Lua from the project tree during a build, in a compiler that ships no Lua interpreter and makes no network calls precisely so that a build is inert. Rejected on security grounds alone.
- **Parse the file with a full Lua 5.1 front end and infer types.** This puts a second language implementation inside the compiler whose only consumer is one conventional file. The inference is also weaker than it looks: `config.lua` files in the wild build tables in loops, assign through `_G`, and set metatables, none of which a static reader can resolve into a useful type. Rejected as a large surface for a small and unreliable result.
- **Keep the file opaque and describe it with a declaration file.** The author states the shape once, the checker enforces it everywhere, and the statement is reviewable because it is committed source. The cost is that the declaration and the file can disagree, and nothing detects it.
- **Keep the file opaque, and offer an optional extractor for a deliberately small static subset.** A separate command reads only bounded literal data — string, number, boolean, and nested literal tables assigned to a name at the top level — and writes a `.d.luam` the author reviews and commits. It never runs during compilation. This is the direction of the configuration declarations task.

**Decision:**
`config.lua` is never parsed as Luam, never parsed as Lua, and never executed by the compiler or the CLI. It is copied verbatim and listed in the generated manifest as a shared script. Types for its contents come from a declaration file that the author writes or generates.

An optional extractor may generate that declaration file from a restricted literal subset. It is a command the author runs, its output is a committed file, and a failure to understand a construct is reported rather than guessed. Compilation itself stays unaffected: no build reads the contents of `config.lua` for meaning.

**Consequences:**
- Positive: a build cannot be made to execute project Lua, which keeps the compiler inert and offline by construction.
- Positive: `config.lua` keeps working exactly as MTA users already expect, including files copied in from an existing resource.
- Positive: the type information for configuration is explicit, reviewable, and diffable rather than inferred from a file that changes at runtime.
- Negative: a declaration file can drift from the configuration it describes, and only a mismatch that reaches the type checker will surface it.
- Negative: authors who want types without writing them must wait for the extractor, and even then a dynamic `config.lua` will remain outside what it accepts.
