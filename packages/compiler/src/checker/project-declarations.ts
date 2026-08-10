import type { EnvEntry, EnvValueKind } from '@compiler/project/env-file';
import type { ApiDeclaration, ApiEnvironment } from '@mta-types/api-declaration';
import { BOOLEAN, NUMBER, record, STRING, type RecordMember, type TypeDescriptor } from '@mta-types/type-descriptor';

export interface ProjectDeclarations {
    globals: readonly ApiDeclaration[];
}

export const EMPTY_PROJECT_DECLARATIONS: ProjectDeclarations = { globals: [] };

export const PROCESS_GLOBAL = 'process';

export const PROCESS_ENV = 'process.env';

export const ENV_GLOBAL = 'env';

const VALUE_TYPES: Readonly<Record<EnvValueKind, TypeDescriptor>> = { boolean: BOOLEAN, number: NUMBER, string: STRING };

function envMembers(entries: readonly EnvEntry[]): RecordMember[] {
    const members = new Map<string, RecordMember>();

    for (const entry of entries) {
        members.set(entry.key, { name: entry.key, type: VALUE_TYPES[entry.kind] });
    }

    return [...members.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export function environmentDeclaration(entries: readonly EnvEntry[], origin: string): ApiDeclaration {
    const env = record(PROCESS_ENV, envMembers(entries), origin);
    const process = record(PROCESS_GLOBAL, [{ name: ENV_GLOBAL, type: env }], origin);

    return { name: PROCESS_GLOBAL, environment: 'server', source: 'project', type: process };
}

export function envDeclaration(entries: readonly EnvEntry[], origin: string): ApiDeclaration {
    const env = record(ENV_GLOBAL, envMembers(entries), origin);

    return { name: ENV_GLOBAL, environment: 'server', source: 'project', type: env };
}

export function projectDeclarations(entries: readonly EnvEntry[] | null, origin: string): ProjectDeclarations {
    if (entries === null) {
        return EMPTY_PROJECT_DECLARATIONS;
    }

    return { globals: [environmentDeclaration(entries, origin), envDeclaration(entries, origin)] };
}

export function projectEnvironments(declarations: ProjectDeclarations): ReadonlyMap<string, ApiEnvironment> {
    return new Map(declarations.globals.map((declaration) => [declaration.name, declaration.environment]));
}
