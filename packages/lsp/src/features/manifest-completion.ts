import { ENV_GLOBAL, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import type { ManifestField } from '@compiler/manifest/manifest-field';
import { MANIFEST_MODES } from '@compiler/manifest/manifest-fields';
import type { CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { environmentItem, fieldItem, valueItem } from '@lsp/features/manifest-items';
import { fieldAt, manifestRoot, rootFields } from '@lsp/features/manifest-field-table';
import { manifestScopeAt, type ManifestScope } from '@lsp/features/manifest-scope';

const INJECTED: readonly string[] = ['mode', 'env', 'root'];

const ENV_PREFIX = /env\.[A-Za-z0-9_]*$/;

const MODE_COMPARISON = /\bmode\s*[=~]=\s*$/;

export function environmentKeys(project: ProjectDeclarations): string[] {
    const declaration = project.globals.find((global) => global.name === ENV_GLOBAL);

    return declaration?.type.kind === 'record' ? declaration.type.members.map((member) => member.name) : [];
}

function fieldsFor(document: string, path: readonly string[]): readonly ManifestField[] {
    if (path.length === 0) {
        return rootFields(document);
    }

    return fieldAt(document, path)?.members ?? [];
}

function fieldItems(document: string, scope: ManifestScope): CompletionItem[] {
    return fieldsFor(document, scope.path)
        .filter((field) => !scope.assigned.has(field.name))
        .map(fieldItem);
}

function pendingField(document: string, scope: ManifestScope): ManifestField | null {
    return scope.pending === null ? null : fieldAt(document, [...scope.path, scope.pending]);
}

function closedSetItems(field: ManifestField | null, quoted: boolean): CompletionItem[] {
    if (field === null || field.values === null) {
        return [];
    }

    return field.values.map((value) => valueItem(value, `${field.name} value`, quoted));
}

const LIBRARY_PATH: readonly string[] = ['environment', 'libraries'];

function isLibraryList(scope: ManifestScope): boolean {
    return scope.path.length === LIBRARY_PATH.length && scope.path.every((segment, index) => segment === LIBRARY_PATH[index]);
}

function libraryItems(analysis: DocumentAnalysis, quoted: boolean): CompletionItem[] {
    return analysis.installedLibraries.map((name) => valueItem(name, 'installed library', quoted));
}

function stringItems(analysis: DocumentAnalysis, scope: ManifestScope): CompletionItem[] {
    const before = analysis.text.slice(0, scope.stringStart ?? 0);

    if (MODE_COMPARISON.test(before)) {
        return MANIFEST_MODES.map((mode) => valueItem(mode, 'build mode', false));
    }

    if (isLibraryList(scope)) {
        return libraryItems(analysis, false);
    }

    return closedSetItems(pendingField(analysis.path, scope), false);
}

function valueItems(field: ManifestField | null): CompletionItem[] {
    if (field === null) {
        return INJECTED.map((name) => valueItem(name, 'manifest value', false));
    }

    if (field.type.kind === 'boolean') {
        return [valueItem('true', 'boolean', false), valueItem('false', 'boolean', false)];
    }

    return [...closedSetItems(field, true), ...INJECTED.map((name) => valueItem(name, 'manifest value', false))];
}

export function manifestCompletion(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
    const scope = manifestScopeAt(analysis.text, offset, manifestRoot(analysis.path));

    if (scope.inComment) {
        return [];
    }

    if (ENV_PREFIX.test(analysis.text.slice(0, offset))) {
        return environmentKeys(analysis.project).map(environmentItem);
    }

    if (scope.inString) {
        return stringItems(analysis, scope);
    }

    if (isLibraryList(scope)) {
        return libraryItems(analysis, true);
    }

    return scope.pending === null ? fieldItems(analysis.path, scope) : valueItems(pendingField(analysis.path, scope));
}
