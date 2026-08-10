import { isAvailableIn, type ApiEnvironment } from '@mta-types/api-declaration';
import { allOopClasses } from '@mta-types/oop-surface';

import { descriptorToType } from './api-types';
import { DeclarationRegistry, type MemberInfo } from './registry';

const MTA_POSITION = { line: 0, column: 0, offset: 0 };

let cache: DeclarationRegistry | null = null;

function buildRegistry(): DeclarationRegistry {
    const registry = new DeclarationRegistry();

    for (const declaration of allOopClasses()) {
        const members = new Map<string, MemberInfo>();

        for (const member of declaration.members) {
            members.set(member.name, {
                name: member.name,
                type: descriptorToType(member.type),
                isMethod: member.kind === 'method',
                position: MTA_POSITION,
                environment: member.environment,
                procedural: member.procedural,
            });
        }

        registry.declareClass({ name: declaration.name, superClass: declaration.parent, interfaces: [], members, position: MTA_POSITION });
    }

    return registry;
}

export function clearMtaClassCache(): void {
    cache = null;
}

export function mtaClassRegistry(): DeclarationRegistry {
    cache ??= buildRegistry();

    return cache;
}

export function mtaMember(className: string, member: string): MemberInfo | null {
    return mtaClassRegistry().lookupMember(className, member);
}

export function mtaMembersFor(className: string, environment: ApiEnvironment): MemberInfo[] {
    const members = mtaClassRegistry().collectMembers(className);

    return members.filter((member) => member.environment !== undefined && isAvailableIn(member.environment, environment));
}
