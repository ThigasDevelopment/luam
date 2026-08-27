# ADR-031: Carry narrowing facts through a syntax-directed flow state

**Status:** Accepted

**Context:**
[ADR-025](025-access-path-narrowing.md) keyed narrowing facts on stable access paths while keeping the lexical model that held them: a stack of `Map<string, Type>` frames pushed around a guarded block and popped at its end. It closed with the observation that "a later control-flow graph has to subsume both" mechanisms, the frame that pops and the prefix rule that deletes.

That model cannot express a fact that outlives the block that established it. A field refined in both arms of an `if` and read after it, a flag assigned in one branch and read in another, a `while` that fills a missing value — each is rejected, and the documented workaround is to restructure the code around a guard clause.

**Options considered:**
- Keep the lexical frames and special-case the shapes that matter. Every new shape is another special case, and the early-exit carry already needed one (`guardFacts`, plus an `alwaysExits` walker that re-derived reachability from the last statement of a block).
- Build an explicit control-flow graph: basic blocks, edges, a worklist, and a fixed point over the whole function. Luam has no `goto`, so every function's flow graph is exactly the shape of its statement tree. The graph would be constructed only to be walked in the order the checker already walks the tree.
- Thread a flow state through the existing syntax-directed traversal, with an explicit join at each merge point and an explicit reachability bit.

**Decision:**
Replace the frame stack with a single **flow state** — a map of stable access paths to types, plus a `reachable` bit — that the checker carries as it walks. The traversal is unchanged; what changes is that a block now *produces* a state instead of only consuming one.

- `if`/`elseif`/`else` forks the entry state per arm, applies the arm's facts, checks the arm, and **joins** the exit states. A path present in every reachable exit gets the union of its types there; a path missing from any of them is dropped back to its declared type.
- `return`, `break`, and `continue` clear the reachable bit. An unreachable exit contributes nothing to a join, which is what makes a guard clause carry — there is no separate early-exit rule any more.
- An assignment refines the path it wrote when the declared type is a union or an optional and the written type matches exactly one of its members. Any other assignment only drops the fact, as before. A table literal assigned to a `table<K, V>` records nothing: the structural type of the literal is not a member of the map type, and treating it as one lost the key and value types.
- A loop kills every path its body assigns *before* the body is checked, so the state on entry to the body is the same on every iteration and one pass is the fixed point. Facts established inside the body do not survive the loop. What survives a `while` is the negation of its condition.
- A function body is checked against a copy of the enclosing state and cannot write back to it, so a fact refined inside a closure never escapes to the code after it.
- A block drops the facts rooted at the names its own scope declared, so a shadowed name cannot carry a fact past its scope.

Every invalidation rule ADR-025 recorded stays exactly as it was, including the boundary it accepted: **an arbitrary call does not drop a fact.** Aliasing remains unsound and remains documented.

**Consequences:**
- Positive: joins, guard clauses, and loop invalidation are one mechanism instead of three. `guardFacts` and its `alwaysExits` walker are deleted.
- Positive: the `elseif` chain narrows like a chain of nested `if`s, which it did not before — only a single-clause `if` had its condition negated for the alternative.
- Positive: the fixed point is trivially bounded. The kill-before-check rule makes one pass exact, so no iteration cap and no pathological-case fallback are needed.
- Negative: a loop is more conservative than a real fixed point. A `for` body that only ever assigns on an unreachable path still loses the fact for the whole loop.
- Negative: a condition stored in a variable still does not narrow. The flow state keys types on paths, not propositions, so `local ready = self.connection ~= nil` records that `ready` is a boolean and nothing about `self.connection`. Tracking that needs facts about *conditions*, which is a separate model, and the daily answer — test the path where it is used — stays the documented one.
