import type { TypeDescriptor } from './type-descriptor';

export type ApiEnvironment = 'server' | 'client' | 'shared';

export type ApiSource = 'lua' | 'mta' | 'extension' | 'project';

export interface ApiDeclaration {
    name: string;
    environment: ApiEnvironment;
    source: ApiSource;
    type: TypeDescriptor;
}

export type ApiCatalog = Readonly<Record<string, TypeDescriptor>>;

export function declareAll(catalog: ApiCatalog, environment: ApiEnvironment, source: ApiSource): ApiDeclaration[] {
    return Object.entries(catalog).map(([name, type]) => ({ name, environment, source, type }));
}

export function isAvailableIn(declared: ApiEnvironment, environment: ApiEnvironment): boolean {
    return declared === 'shared' || declared === environment;
}

export function isVisibleIn(declared: ApiEnvironment, environment: ApiEnvironment): boolean {
    return environment === 'shared' || isAvailableIn(declared, environment);
}
