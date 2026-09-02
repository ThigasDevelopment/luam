import { declareAll, isAvailableIn, type ApiCatalog, type ApiDeclaration, type ApiEnvironment } from './api-declaration';
import { LUA_GLOBALS } from './lua-standard';
import { LUAM_RUNTIME_GLOBALS, LUAM_RUNTIME_SERVER_GLOBALS } from './luam-runtime';

import { MTA_CLIENT_GLOBALS } from '@mta-types/generated/api/mta-client';
import { MTA_SERVER_GLOBALS } from '@mta-types/generated/api/mta-server';
import { MTA_SHARED_GLOBALS } from '@mta-types/generated/api/mta-shared';

function exclusiveMta(catalog: ApiCatalog): ApiCatalog {
    return Object.fromEntries(Object.entries(catalog).filter(([name]) => MTA_SHARED_GLOBALS[name] === undefined));
}

const DECLARATIONS: readonly ApiDeclaration[] = [
    ...declareAll(LUA_GLOBALS, 'shared', 'lua'),
    ...declareAll(LUAM_RUNTIME_GLOBALS, 'shared', 'extension'),
    ...declareAll(LUAM_RUNTIME_SERVER_GLOBALS, 'server', 'extension'),
    ...declareAll(MTA_SHARED_GLOBALS, 'shared', 'mta'),
    ...declareAll(exclusiveMta(MTA_SERVER_GLOBALS), 'server', 'mta'),
    ...declareAll(exclusiveMta(MTA_CLIENT_GLOBALS), 'client', 'mta'),
];

const BY_NAME: ReadonlyMap<string, ApiDeclaration> = new Map(DECLARATIONS.map((declaration) => [declaration.name, declaration]));

const MTA_EXACT: Readonly<Record<ApiEnvironment, ApiCatalog>> = {
    shared: MTA_SHARED_GLOBALS,
    server: MTA_SERVER_GLOBALS,
    client: MTA_CLIENT_GLOBALS,
};

export function allDeclarations(): readonly ApiDeclaration[] {
    return DECLARATIONS;
}

export function globalsFor(environment: ApiEnvironment): ApiDeclaration[] {
    const resolved = new Map<string, ApiDeclaration>();

    for (const declaration of DECLARATIONS) {
        const exact = findDeclaration(declaration.name, environment);

        if (exact !== null && !resolved.has(exact.name)) {
            resolved.set(exact.name, exact);
        }
    }

    return [...resolved.values()];
}

export function findDeclaration(name: string, environment?: ApiEnvironment): ApiDeclaration | null {
    const declaration = BY_NAME.get(name);

    if (declaration === undefined || environment === undefined) {
        return declaration ?? null;
    }

    if (!isAvailableIn(declaration.environment, environment)) {
        return environment === 'shared' ? declaration : null;
    }

    if (declaration.source !== 'mta') {
        return declaration;
    }

    const type = MTA_EXACT[environment][name] ?? MTA_SHARED_GLOBALS[name];

    return type === undefined ? null : { ...declaration, type };
}

export function declarationEnvironment(name: string): ApiEnvironment | null {
    return BY_NAME.get(name)?.environment ?? null;
}

export function isApiAvailable(name: string, environment: ApiEnvironment): boolean {
    const declaration = BY_NAME.get(name);

    return declaration === undefined || isAvailableIn(declaration.environment, environment);
}
