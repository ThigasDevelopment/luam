import { normalizePath } from '@compiler/environment/environment';

export const SOURCE_EXTENSION = '.luam';

export const DECLARATION_EXTENSION = '.d.luam';

export function isDeclarationPath(path: string): boolean {
    return normalizePath(path).endsWith(DECLARATION_EXTENSION);
}

export function isSourcePath(path: string): boolean {
    return normalizePath(path).endsWith(SOURCE_EXTENSION);
}
