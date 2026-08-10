import { isAvailableIn, type ApiEnvironment } from './api-declaration';
import { MTA_OOP_CLASSES } from '@mta-types/generated/oop/mta-oop';
import type { OopClass, OopMember } from './oop-declaration';

const BY_NAME: ReadonlyMap<string, OopClass> = new Map(MTA_OOP_CLASSES.map((declaration) => [declaration.name, declaration]));

export function allOopClasses(): readonly OopClass[] {
    return MTA_OOP_CLASSES;
}

export function findOopClass(name: string): OopClass | null {
    return BY_NAME.get(name) ?? null;
}

export function oopClassesFor(environment: ApiEnvironment): OopClass[] {
    return MTA_OOP_CLASSES.map((declaration) => ({
        name: declaration.name,
        parent: declaration.parent,
        members: declaration.members.filter((member) => isAvailableIn(member.environment, environment)),
    }));
}

export function findOopMember(className: string, member: string): OopMember | null {
    const visited = new Set<string>();

    let current = BY_NAME.get(className);

    while (current !== undefined && !visited.has(current.name)) {
        const found = current.members.find((entry) => entry.name === member);

        if (found !== undefined) {
            return found;
        }

        visited.add(current.name);

        current = current.parent === null ? undefined : BY_NAME.get(current.parent);
    }

    return null;
}
