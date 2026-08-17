import type { ClassInfo, DeclarationRegistry, EnumInfo, EventInfo, GlobalInfo, InterfaceInfo } from './registry';

export interface AmbientDeclarations {
    classes: readonly ClassInfo[];
    interfaces: readonly InterfaceInfo[];
    enums: readonly EnumInfo[];
    globals: readonly GlobalInfo[];
    events: readonly EventInfo[];
}

export const EMPTY_AMBIENT: AmbientDeclarations = { classes: [], interfaces: [], enums: [], globals: [], events: [] };

export function ambientFromRegistry(registry: DeclarationRegistry): AmbientDeclarations {
    return {
        classes: registry.allClasses(),
        interfaces: registry.allInterfaces(),
        enums: registry.allEnums(),
        globals: registry.allGlobals(),
        events: registry.allEvents(),
    };
}

function withoutNames<T extends { name: string }>(entries: readonly T[], excluded: readonly T[]): T[] {
    const names = new Set(excluded.map((entry) => entry.name));

    return entries.filter((entry) => !names.has(entry.name));
}

export function ownDeclarations(registry: DeclarationRegistry, ambient: AmbientDeclarations | undefined): AmbientDeclarations {
    const all = ambientFromRegistry(registry);

    if (ambient === undefined) {
        return all;
    }

    return {
        classes: withoutNames(all.classes, ambient.classes),
        interfaces: withoutNames(all.interfaces, ambient.interfaces),
        enums: withoutNames(all.enums, ambient.enums),
        globals: withoutNames(all.globals, ambient.globals),
        events: withoutNames(all.events, ambient.events),
    };
}

function mergeByName<T extends { name: string }>(sources: readonly (readonly T[])[]): T[] {
    const merged = new Map<string, T>();

    for (const source of sources) {
        for (const info of source) {
            merged.set(info.name, merged.get(info.name) ?? info);
        }
    }

    return [...merged.values()];
}

export function mergeAmbient(sources: readonly AmbientDeclarations[]): AmbientDeclarations {
    return {
        classes: mergeByName(sources.map((source) => source.classes)),
        interfaces: mergeByName(sources.map((source) => source.interfaces)),
        enums: mergeByName(sources.map((source) => source.enums)),
        globals: mergeByName(sources.map((source) => source.globals)),
        events: mergeByName(sources.map((source) => source.events)),
    };
}
