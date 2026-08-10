import { ELEMENT_TYPES } from '@mta-types/generated/element-types';

const BY_NAME: ReadonlyMap<string, string | null> = new Map(ELEMENT_TYPES.map((element) => [element.name, element.parent]));

export function isElementType(name: string): boolean {
    return BY_NAME.has(name);
}

export function elementAncestors(name: string): string[] {
    const ancestors: string[] = [];
    let current = BY_NAME.get(name) ?? null;

    while (current !== null) {
        ancestors.push(current);
        current = BY_NAME.get(current) ?? null;
    }

    return ancestors;
}
