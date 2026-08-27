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
        staticMethods: declaration.staticMethods.filter((member) => isAvailableIn(member.environment, environment)),
        constructor:
            declaration.constructor !== null && isAvailableIn(declaration.constructor.environment, environment) ? declaration.constructor : null,
    }));
}

export function oopClassEnvironment(name: string): ApiEnvironment | null {
    const declaration = BY_NAME.get(name);

    if (declaration === undefined) {
        return null;
    }

    const constructor = declaration.constructor === null ? [] : [declaration.constructor.environment];
    const environments = new Set([...declaration.members, ...declaration.staticMethods].map((member) => member.environment).concat(constructor));

    if (environments.size === 1) {
        const [only] = environments;

        return only ?? 'shared';
    }

    return 'shared';
}

export function oopClassAncestors(name: string): string[] {
    const ancestors: string[] = [];

    let current = BY_NAME.get(name)?.parent ?? null;

    while (current !== null && !ancestors.includes(current)) {
        ancestors.push(current);
        current = BY_NAME.get(current)?.parent ?? null;
    }

    return ancestors;
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

export function findOopStaticMethod(className: string, method: string): OopMember | null {
    return BY_NAME.get(className)?.staticMethods.find((entry) => entry.name === method) ?? null;
}
