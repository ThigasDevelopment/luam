# ADR-036: Read a native `config.lua` for literal data, never execute it

**Status:** Accepted

**Context:**
[ADR-022](022-opaque-native-configuration.md) keeps a native `config.lua` opaque: it is copied into the resource verbatim and never compiled, because reading it for meaning would mean either running project code inside a build or shipping a second Lua frontend. The consequence is that every value in it is `any` until someone writes a declaration file by hand, and that file drifts from the data it describes.

That decision closed with the note that a future extractor might write the declaration file from literal data, as a command rather than a build step. This records what that extractor is.

**Options considered:**
- Parse and analyze arbitrary Lua 5.1. It would cover everything, and it is a second frontend and a second checker to keep correct forever.
- Leave declarations entirely manual. Already possible, and the drift is the problem.
- Read only the literal subset, and report the rest.

**Decision:**
Ship `luam config`, a command the author runs and whose output the author commits. It is **not** part of `check` or `build`, and `config.lua` keeps being copied verbatim.

The command **reads** the file with a small dedicated scanner. It never loads, executes, or requires it, so no project code runs during extraction. Luam's own lexer is not reused, because `config.lua` is Lua and uses `--` comments the Luam lexer rejects.

The accepted subset is a top-level assignment — `NAME = value`, with or without `local` — of:

- a string, number, boolean, or `nil` literal;
- a table constructor with named keys, bracketed string keys, positional entries, or nesting of those.

Inference: a keyed table becomes an object type, a positional one an array of the unified element type, a positional one with mixed element types `any[]`, a mixed keyed-and-positional table `table`, an empty table `table`, and `nil` becomes `any`. A repeated name keeps its last value.

Everything else — a call, a concatenation, a function, a loop, an index — is reported with its line and column and stops the walk. The names read before it are still declared, so a file that is mostly literal still produces most of its declarations.

Limits are fixed: 256 KB of source, eight levels of table nesting, 512 entries per table. `--source` and `--out` are resolved against the project root and refused if they escape it.

The generated file opens with a marker naming the source, and the command refuses to overwrite a file that does not carry it. Output is deterministic: the same input produces the same bytes.

**Consequences:**
- Positive: the common case — a `config.lua` of literal settings — gets typed declarations without anyone hand-writing them, and re-running the command is the whole update path.
- Positive: the extraction is auditable. It is a file you read, a file you commit, and a diff you review.
- Negative: the declaration is a snapshot. Change `config.lua` and it is stale until the command runs again; nothing checks that it still matches.
- Negative: the subset is small on purpose. A `config.lua` that computes anything at all needs a hand-written declaration for the computed part.
- Negative: the scanner is a second, tiny reader of Lua text. It is deliberately not a parser — it recognizes a shape and refuses everything else — but it is still a place where Lua syntax is described twice.
