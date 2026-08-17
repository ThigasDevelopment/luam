import type { ApiEnvironment } from '#mta-types/api-declaration';
import type { ApiDocumentation } from '#mta-types/api-documentation';
import type { FunctionDescriptor, TypeDescriptor } from '#mta-types/type-descriptor';

export interface ParsedDeclaration {
    name: string;
    category: string;
    type: TypeDescriptor;
    documentation: ApiDocumentation;
}

export interface CatalogEntry {
    name: string;
    category: string;
    environment: ApiEnvironment;
    type: TypeDescriptor;
    documentation: ApiDocumentation;
}

export interface ElementTypeEntry {
    name: string;
    parent: string | null;
}

export interface ParsedEventHandler {
    name: string;
    type: FunctionDescriptor;
}

export interface UpstreamCatalog {
    declarations: readonly ParsedDeclaration[];
    events: readonly ParsedEventHandler[];
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
