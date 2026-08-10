import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import type { SymbolDeclaration, SymbolReference } from '@lsp/symbols/symbol';

export interface SymbolTarget {
    name: string;
    analysis: DocumentAnalysis;
    declaration: SymbolDeclaration | null;
    reference: SymbolReference | null;
    isGlobal: boolean;
}

export interface SymbolLocation {
    analysis: DocumentAnalysis;
    name: string;
    position: SourcePosition;
}

const GLOBAL_KINDS: ReadonlySet<string> = new Set(['global', 'function', 'class', 'interface', 'enum', 'enum-member', 'type-alias']);

export function isGlobalDeclaration(declaration: SymbolDeclaration): boolean {
    return GLOBAL_KINDS.has(declaration.kind);
}

export function targetAt(analysis: DocumentAnalysis, offset: number): SymbolTarget | null {
    const reference = analysis.index.findReferenceAt(offset);
    const declaration = analysis.index.declarationFor(offset);
    const name = reference?.name ?? declaration?.name ?? null;

    if (name === null) {
        return null;
    }

    const isGlobal = declaration === null || isGlobalDeclaration(declaration);

    return { name, analysis, declaration, reference, isGlobal };
}

export function declarationsIn(analysis: DocumentAnalysis, name: string): SymbolDeclaration[] {
    return analysis.index.declarations.filter((declaration) => declaration.name === name && isGlobalDeclaration(declaration));
}

export function localDefinition(target: SymbolTarget): SymbolLocation | null {
    if (target.declaration === null) {
        return null;
    }

    return { analysis: target.analysis, name: target.declaration.name, position: target.declaration.position };
}

export function externalDefinitions(target: SymbolTarget, others: readonly DocumentAnalysis[]): SymbolLocation[] {
    const found: SymbolLocation[] = [];

    for (const analysis of others) {
        for (const declaration of declarationsIn(analysis, target.name)) {
            found.push({ analysis, name: declaration.name, position: declaration.position });
        }
    }

    return found;
}

export function localOccurrences(target: SymbolTarget): SymbolLocation[] {
    const { analysis, declaration } = target;

    if (declaration === null) {
        return [];
    }

    const occurrences: SymbolLocation[] = [{ analysis, name: declaration.name, position: declaration.position }];

    for (const reference of analysis.index.referencesTo(declaration)) {
        if (reference.position.offset !== declaration.position.offset) {
            occurrences.push({ analysis, name: reference.name, position: reference.position });
        }
    }

    return occurrences;
}

export function externalOccurrences(target: SymbolTarget, others: readonly DocumentAnalysis[]): SymbolLocation[] {
    const found: SymbolLocation[] = [];

    for (const analysis of others) {
        for (const declaration of declarationsIn(analysis, target.name)) {
            found.push(...localOccurrences({ ...target, analysis, declaration }));
        }

        for (const reference of analysis.index.references) {
            if (reference.name === target.name && analysis.index.resolve(reference) === null) {
                found.push({ analysis, name: reference.name, position: reference.position });
            }
        }
    }

    return found;
}
