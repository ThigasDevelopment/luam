import { declareAll, isAvailableIn, type ApiDeclaration, type ApiEnvironment } from './api-declaration';
import { LUA_GLOBALS } from './lua-standard';
import { LUAM_RUNTIME_GLOBALS } from './luam-runtime';
import { MTA_CLIENT_GLOBALS } from '@mta-types/generated/api/mta-client';
import { MTA_SERVER_GLOBALS } from '@mta-types/generated/api/mta-server';
import { MTA_SHARED_GLOBALS } from '@mta-types/generated/api/mta-shared';

const DECLARATIONS: readonly ApiDeclaration[] = [
    ...declareAll(LUA_GLOBALS, 'shared', 'lua'),
    ...declareAll(LUAM_RUNTIME_GLOBALS, 'shared', 'extension'),
    ...declareAll(MTA_SHARED_GLOBALS, 'shared', 'mta'),
    ...declareAll(MTA_SERVER_GLOBALS, 'server', 'mta'),
    ...declareAll(MTA_CLIENT_GLOBALS, 'client', 'mta'),
];

const BY_NAME: ReadonlyMap<string, ApiDeclaration> = new Map(DECLARATIONS.map((declaration) => [declaration.name, declaration]));

export function allDeclarations(): readonly ApiDeclaration[] {
    return DECLARATIONS;
}

export function globalsFor(environment: ApiEnvironment): ApiDeclaration[] {
    return DECLARATIONS.filter((declaration) => isAvailableIn(declaration.environment, environment));
}

export function findDeclaration(name: string): ApiDeclaration | null {
    return BY_NAME.get(name) ?? null;
}

export function declarationEnvironment(name: string): ApiEnvironment | null {
    return BY_NAME.get(name)?.environment ?? null;
}

export function isApiAvailable(name: string, environment: ApiEnvironment): boolean {
    const declaration = BY_NAME.get(name);

    return declaration === undefined || isAvailableIn(declaration.environment, environment);
}
