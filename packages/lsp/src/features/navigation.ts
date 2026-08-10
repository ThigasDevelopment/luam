import type { Location, TextEdit, WorkspaceEdit } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import {
    externalDefinitions,
    externalOccurrences,
    localDefinition,
    localOccurrences,
    targetAt,
    type SymbolLocation,
} from '@lsp/features/symbol-lookup';
import { toWordRange } from '@lsp/support/lsp-position';

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toLocation(location: SymbolLocation): Location {
    return { uri: location.analysis.uri, range: toWordRange(location.position, location.name) };
}

function deduplicate(locations: readonly SymbolLocation[]): SymbolLocation[] {
    const seen = new Set<string>();
    const unique: SymbolLocation[] = [];

    for (const location of locations) {
        const key = `${location.analysis.uri}:${location.position.offset}`;

        if (!seen.has(key)) {
            seen.add(key);
            unique.push(location);
        }
    }

    return unique;
}

export function definitionAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): Location[] {
    const target = targetAt(analysis, offset);

    if (target === null) {
        return [];
    }

    const local = localDefinition(target);

    if (local !== null && !target.isGlobal) {
        return [toLocation(local)];
    }

    const found = local === null ? [] : [local];

    return deduplicate([...found, ...externalDefinitions(target, others)]).map(toLocation);
}

export function occurrencesAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): SymbolLocation[] {
    const target = targetAt(analysis, offset);

    if (target === null) {
        return [];
    }

    const local = localOccurrences(target);

    if (!target.isGlobal) {
        return deduplicate(local);
    }

    const unresolved = analysis.index.references
        .filter((reference) => reference.name === target.name && analysis.index.resolve(reference) === null)
        .map((reference) => ({ analysis, name: reference.name, position: reference.position }));

    return deduplicate([...local, ...unresolved, ...externalOccurrences(target, others)]);
}

export function referencesAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): Location[] {
    return occurrencesAt(analysis, offset, others).map(toLocation);
}

export function renameAt(
    analysis: DocumentAnalysis,
    offset: number,
    others: readonly DocumentAnalysis[],
    newName: string,
): WorkspaceEdit | null {
    if (!IDENTIFIER_PATTERN.test(newName)) {
        return null;
    }

    const occurrences = occurrencesAt(analysis, offset, others);

    if (occurrences.length === 0) {
        return null;
    }

    const changes: Record<string, TextEdit[]> = {};

    for (const occurrence of occurrences) {
        const edits = changes[occurrence.analysis.uri] ?? [];

        edits.push({ range: toWordRange(occurrence.position, occurrence.name), newText: newName });
        changes[occurrence.analysis.uri] = edits;
    }

    return { changes };
}
