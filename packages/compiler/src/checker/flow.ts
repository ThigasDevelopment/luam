import { createUnion, isAssignable, NIL_TYPE, type Type } from './types';

export interface FlowState {
    facts: Map<string, Type>;
    reachable: boolean;
}

export function createFlow(): FlowState {
    return { facts: new Map(), reachable: true };
}

export function cloneFlow(state: FlowState): FlowState {
    return { facts: new Map(state.facts), reachable: state.reachable };
}

export function applyFacts(state: FlowState, facts: ReadonlyMap<string, Type>): void {
    for (const [path, type] of facts) {
        state.facts.set(path, type);
    }
}

export function forgetPath(state: FlowState, path: string): void {
    for (const key of [...state.facts.keys()]) {
        if (key === path || key.startsWith(`${path}.`) || path.startsWith(`${key}.`)) {
            state.facts.delete(key);
        }
    }
}

export function joinFlows(states: readonly FlowState[]): FlowState {
    const live = states.filter((state) => state.reachable);
    const [first, ...rest] = live;

    if (first === undefined) {
        return { facts: new Map(), reachable: false };
    }

    const facts = new Map<string, Type>();

    for (const [path, type] of first.facts) {
        const others = rest.map((state) => state.facts.get(path));

        if (others.some((other) => other === undefined)) {
            continue;
        }

        facts.set(path, createUnion([type, ...(others as Type[])]));
    }

    return { facts, reachable: true };
}

function optionsOf(declared: Type): readonly Type[] {
    if (declared.kind === 'union') {
        return declared.options;
    }

    return declared.kind === 'optional' ? [declared.element, NIL_TYPE] : [];
}

export function assignmentFact(narrowed: Type, declared: Type): Type | null {
    const matched = optionsOf(declared).filter((option) => isAssignable(narrowed, option));
    const [only] = matched;

    return matched.length === 1 && only !== undefined ? only : null;
}
