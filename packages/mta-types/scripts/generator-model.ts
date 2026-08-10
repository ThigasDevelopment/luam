import type { ApiEnvironment } from '#mta-types/api-declaration';
import type { TypeDescriptor } from '#mta-types/type-descriptor';

export interface ParsedDeclaration {
    name: string;
    category: string;
    type: TypeDescriptor;
}

export interface CatalogEntry {
    name: string;
    category: string;
    environment: ApiEnvironment;
    type: TypeDescriptor;
}

export interface ElementTypeEntry {
    name: string;
    parent: string | null;
}

export interface UpstreamCatalog {
    declarations: readonly ParsedDeclaration[];
    events: readonly string[];
}

export interface GeneratedFile {
    path: string;
    contents: string;
}

export class GeneratorError extends Error {
    constructor(file: string, detail: string) {
        super(`${file}: ${detail}`);
        this.name = 'GeneratorError';
    }
}
