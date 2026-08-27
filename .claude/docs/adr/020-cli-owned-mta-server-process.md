# ADR-020: Let the CLI own an opt-in local MTA server process

**Status:** Accepted

**Context:**
`luam dev` already builds, syncs, restarts, watches, and follows logs, but it assumes an MTA server is running. Developers must manage a second terminal and process. The CLI must support an existing local MTA installation without taking ownership of unrelated or remote servers.

**Options considered:**
- Always start MTA from `luam dev`. This gives the shortest workflow but breaks projects that connect to an already running server and risks port conflicts.
- Add only `luam server`. This cleanly exposes the MTA console but still requires two commands for the integrated development workflow.
- Add `luam server` and opt-in `luam dev --start-server`. Both commands reuse one process supervisor, preserve existing behavior, and support one-command development when requested.
- Download and manage an MTA installation from the CLI. This improves onboarding but adds release selection, integrity verification, extraction, upgrades, and platform packaging to a process-lifecycle feature.

**Decision:**
Add a shared local process supervisor, expose it through `luam server`, and integrate it into `luam dev` only when `--start-server` is present. Resolve the executable inside the configured `serverPath`, allow a contained manifest override for nonstandard layouts, run without a shell, wait for readiness, and use the owned console for refresh and resource restart commands. Stop only the child owned by the current invocation. Do not download or update MTA in this scope.

**Consequences:**
- Positive: developers can run the full local loop with one command without changing current projects.
- Positive: process behavior is testable independently from command orchestration and from a real MTA installation.
- Positive: `luam server` retains an interactive MTA console for standalone use.
- Positive: the CLI cannot accidentally stop a server it did not launch.
- Negative: readiness depends on observable MTA startup behavior and needs fixtures for supported releases.
- Negative: Windows and Linux require different executable discovery and shutdown fallback behavior.
- Negative: installation and updates remain a separate manual concern.
