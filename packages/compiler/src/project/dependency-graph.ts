import { canReference, type Environment } from '@compiler/environment/environment';

import { hashString } from './fingerprint';

const MAX_CLOSURE_SIZE = 512;

export interface GraphNode {
    path: string;
    environment: Environment;
    provides: ReadonlyMap<string, string>;
    requires: ReadonlySet<string>;
}

export interface DependencyGraph {
    closureOf(path: string): ReadonlySet<string> | null;
    keyOf(path: string): string | null;
    dependentsOf(names: ReadonlySet<string>): Set<string>;
    providedBy(paths: readonly string[]): Set<string>;
}

type OwnerIndex = Map<string, GraphNode[]>;

function indexOwners(nodes: readonly GraphNode[], environment: Environment): OwnerIndex {
    const owners: OwnerIndex = new Map();

    for (const node of nodes) {
        if (!canReference(environment, node.environment)) {
            continue;
        }

        for (const name of node.provides.keys()) {
            const existing = owners.get(name);

            if (existing === undefined) {
                owners.set(name, [node]);

                continue;
            }

            existing.push(node);
        }
    }

    return owners;
}

function walk(node: GraphNode, owners: OwnerIndex): Set<string> | null {
    const visited = new Set<string>();
    const pending = [...node.requires, ...node.provides.keys()];

    while (pending.length > 0) {
        const name = pending.pop();

        if (name === undefined || visited.has(name)) {
            continue;
        }

        visited.add(name);

        if (visited.size > MAX_CLOSURE_SIZE) {
            return null;
        }

        for (const owner of owners.get(name) ?? []) {
            for (const required of owner.requires) {
                if (!visited.has(required)) {
                    pending.push(required);
                }
            }
        }
    }

    return visited;
}

function ownerText(owners: OwnerIndex, name: string): string {
    const list = owners.get(name) ?? [];

    return `${name}=${list.map((owner) => `${owner.path}:${owner.provides.get(name) ?? ''}`).sort().join('+')}`;
}

export function createDependencyGraph(nodes: readonly GraphNode[]): DependencyGraph {
    const byPath = new Map(nodes.map((node) => [node.path, node]));
    const indexes = new Map<Environment, OwnerIndex>();
    const closures = new Map<string, ReadonlySet<string> | null>();
    const keys = new Map<string, string | null>();

    function ownersFor(environment: Environment): OwnerIndex {
        const cached = indexes.get(environment);

        if (cached !== undefined) {
            return cached;
        }

        const owners = indexOwners(nodes, environment);

        indexes.set(environment, owners);

        return owners;
    }

    function closureOf(path: string): ReadonlySet<string> | null {
        if (closures.has(path)) {
            return closures.get(path) ?? null;
        }

        const node = byPath.get(path);
        const closure = node === undefined ? null : walk(node, ownersFor(node.environment));

        closures.set(path, closure);

        return closure;
    }

    function keyOf(path: string): string | null {
        if (keys.has(path)) {
            return keys.get(path) ?? null;
        }

        const node = byPath.get(path);
        const closure = closureOf(path);

        if (node === undefined || closure === null) {
            keys.set(path, null);

            return null;
        }

        const owners = ownersFor(node.environment);
        const key = hashString([...closure].sort().map((name) => ownerText(owners, name)).join(';'));

        keys.set(path, key);

        return key;
    }

    return {
        closureOf,
        keyOf,
        dependentsOf: (names: ReadonlySet<string>): Set<string> => {
            const dependents = new Set<string>();

            for (const node of nodes) {
                const closure = closureOf(node.path);

                if (closure === null) {
                    dependents.add(node.path);

                    continue;
                }

                for (const name of names) {
                    if (closure.has(name)) {
                        dependents.add(node.path);

                        break;
                    }
                }
            }

            return dependents;
        },
        providedBy: (paths: readonly string[]): Set<string> => {
            const names = new Set<string>();

            for (const path of paths) {
                for (const name of byPath.get(path)?.provides.keys() ?? []) {
                    names.add(name);
                }
            }

            return names;
        },
    };
}
