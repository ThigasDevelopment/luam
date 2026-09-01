# ADR-045: A class registry replaces instantiating a class the code names at runtime

**Status:** Accepted

**Context:**
A ported resource built its whole loading order on two moves the language cannot express. A class name was bound to a factory value — `RedisAdapter = new "RedisAdapter"` — and the global table was then walked to construct everything by naming convention:

```lua
for name, value in pairs(_G) do
    if name:find("Adapter") then
        _G[name] = value(self)
    end
end
```

Three modules did this: `Core.loadAdapters`, `EventsModule` and `ListenersModule`.

In Luam, `new` is an operator over a class **name**, resolved at check time. There is no value that stands for a class and no way to instantiate one the program names at runtime. The runtime library already exposes `getClass(name)` and `getClasses()`, so the capability exists below the language and is unreachable from it.

CLAUDE.md settles whether Luam should ship the pattern: there is no framework, and auto-loading is a reference sketch in `examples/framework`, not part of the language. It does not settle whether a resource that already has one can be ported, which is what this record decides.

**Options considered:**
- **Do nothing.** Rejected: the gap is real, three modules of a real resource hit it, and nothing recorded what to write instead.
- **Type `getClass(name)` as an opaque table and document the pattern as untyped.** Rejected as the answer, kept as the escape hatch. It ports the resource with `any` at the boundary, which means the constructor arity is unchecked, the constructed type is `any`, and every reader of `self.events[name]` sees `any`. The whole point of the port is to get those three facts back.
- **A `classof Name` expression producing a first-class, constructible class value.** Rejected. A class value already exists in the checker for a static read (ADR-028), but it carries no constructor: making it constructible means a `new` whose class is not known at check time, and the constructor arity and the constructed type both go with it. That is not a small addition to ADR-028; it is the dynamic `new` this language deliberately does not have, reached through a longer spelling.
- **Dynamic `new expression`.** Rejected for the same reason, stated plainly.
- **An explicit registry the author writes: a table of class values, iterated normally.** Accepted.

**Decision:**
A resource that constructed classes by scanning `_G` writes a registry instead: one table, listing the classes it loads, built with `new` at the point each entry is created. The list is the thing `_G` scanning was avoiding, and it is what makes the result checkable.

```luam
class RedisAdapter {
    constructor = function (core: Core)
    end
}

class Core {
    adapters: table<string, RedisAdapter> = {}

    loadAdapters = function (): void
        self.adapters['redis'] = new RedisAdapter(self)
    end
}
```

Each `new` is checked: the constructor arity, the argument types, and the type of the value the registry holds. Iterating the registry with `pairs` types the value, so a later `self.adapters[name]:connect()` resolves.

`getClass` and `getClasses` stay as they are — typed, completed by the editor, and returning `any`. They are the **untyped escape hatch**, for the case where the set of classes genuinely is not known when the code is written. `examples/framework/loader.luam` is the worked example of that route and says so; every value it produces is `any`, and it is not the form this record recommends.

No language surface was added. A project that does not use a registry emits byte-identical Lua, because nothing changed in the compiler.

**Consequences:**
- Positive: the type surface is kept whole. The constructor arity, the constructed type and the registry's value type are all checked, which is exactly what the `_G` scan gave up.
- Positive: nothing was added to the language, the emitter or `class.lua`. The decision costs no surface and cannot drift.
- Positive: the loading order becomes data the author can read. A registry is a list of what loads; a `_G` scan is a naming convention nobody can grep for.
- Negative: the author lists their classes once, and adding a class means adding a line. That is the trade this record accepts, and it is the whole cost.
- Negative: a resource whose class set really is dynamic — loaded from a config, or produced by another resource — has no typed route. It uses `getClass`, and everything it produces is `any`. That boundary is stated here rather than papered over.
