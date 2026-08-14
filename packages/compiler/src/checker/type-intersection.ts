import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { CheckContext } from './context';
import { createObjectType, typeToString, type Type } from './types';

function namedMembers(context: CheckContext, name: string): ReadonlyMap<string, Type> | null {
    if (context.declarations.lookupInterface(name) === null && context.declarations.lookupClass(name) === null) {
        return null;
    }

    return new Map(context.declarations.collectMembers(name).map((member) => [member.name, member.type]));
}

function partMembers(context: CheckContext, part: Type): ReadonlyMap<string, Type> | null {
    if (part.kind === 'record') {
        return part.members;
    }

    return part.kind === 'named' ? namedMembers(context, part.name) : null;
}

export function mergeIntersection(context: CheckContext, parts: readonly Type[], position: SourcePosition): Type {
    const members = new Map<string, Type>();

    for (const part of parts) {
        const collected = partMembers(context, part);

        if (collected === null) {
            const message = `"${typeToString(part)}" is not an object type, so it cannot take part in an intersection.`;

            context.report('check-invalid-intersection', message, position);

            continue;
        }

        for (const [name, type] of collected) {
            const existing = members.get(name);

            if (existing !== undefined && typeToString(existing) !== typeToString(type)) {
                const message = `Intersection declares "${name}" as both "${typeToString(existing)}" and "${typeToString(type)}".`;

                context.report('check-conflicting-intersection-member', message, position);

                continue;
            }

            members.set(name, type);
        }
    }

    return createObjectType(members);
}
