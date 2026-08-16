# Runtime Helpers

Lua 5.1 helper modules copied into a generated MTA resource. Every file is
standalone: it declares globals or extends a standard library and never
requires another file. The compiler never bundles these files — it records
which helpers the generated code needs and the CLI copies them.

## Modules

| Helper | File | Injection | Features |
| ------ | ---- | --------- | -------- |
| `class` | `lua/class.lua` | automatic | classes, inheritance, instantiation, `super`, enums |
| `math` | `lua/math.lua` | automatic | number extensions Lua 5.1 does not ship (`math.clamp`) |
| `string` | `lua/string.lua` | automatic | template strings, string extensions (`string.trim`, `string.startsWith`, `string.endsWith`) |
| `table` | `lua/table.lua` | automatic | table extensions (`table.size`, `table.isEmpty`, `table.keys`, `table.values`, `table.includes`) |
| `threads` | `lua/threads.lua` | manual | coroutine-based threads (`sleep`, `Threads`) |

`automatic` helpers are copied when the compiler reports them in
`requiredHelpers`. `threads` is opt-in: no language feature requires it, so a
resource includes it only when the developer asks for it.

Rewrites that land on the Lua 5.1 standard library (`string.upper`,
`math.floor`, and similar) require no helper and are never copied.

## Load Order

Helpers must load before the scripts that depend on them. `meta.xml` lists the
copied helpers first, in the order returned by the catalog.

## Catalog

`src/helpers.ts` maps every language feature to the helper it requires and
resolves the file that ships it:

```ts
import { helperForFeature, resolveHelperUrl } from '@luam/runtime/src/helpers';

const helper = helperForFeature('class-declaration');
const source = resolveHelperUrl(helper);
```

The helper names mirror the `RuntimeHelper` union the compiler emitter reports.

## Class Runtime

`class.lua` declares the globals the emitted Lua calls:

- `class 'Name' { ... }` registers a class.
- `class 'Name' :extends 'Parent' { ... }` registers a subclass. A method that
  overrides a parent method may call `super(...)`.
- `new 'Name' (...)` builds an instance and calls `constructor`.
- `enum { 'A', 'B' }` returns a table of zero-based values.
- `bind(func, self)`, `getClass(name)`, and `getClasses()` are available to
  handwritten Lua.

Interfaces are compile-only. The compiler validates `implements` contracts
statically and never emits interface declarations, so the runtime carries no
interface registry.
