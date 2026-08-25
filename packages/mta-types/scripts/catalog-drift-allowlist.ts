export interface DeferredGroup {
    reason: string;
    names: readonly string[];
}

export const DEFERRED_FUNCTIONS: Readonly<Record<string, DeferredGroup>> = {};

export const DEFERRED_ENVIRONMENTS: Readonly<Record<string, DeferredGroup>> = {};

export function deferredNames(groups: Readonly<Record<string, DeferredGroup>>): ReadonlyMap<string, string> {
    const names = new Map<string, string>();

    for (const [theme, group] of Object.entries(groups)) {
        for (const name of group.names) {
            names.set(name, `${theme}: ${group.reason}`);
        }
    }

    return names;
}
