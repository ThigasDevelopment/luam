import { SymbolKind, type WorkspaceSymbol } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { toWordRange } from '@lsp/support/lsp-position';
import type { SymbolDeclaration, SymbolKind as LuamSymbolKind } from '@lsp/symbols/symbol';

const EXPOSED: Readonly<Partial<Record<LuamSymbolKind, SymbolKind>>> = {
    class: SymbolKind.Class,
    interface: SymbolKind.Interface,
    enum: SymbolKind.Enum,
    'type-alias': SymbolKind.TypeParameter,
    function: SymbolKind.Function,
    global: SymbolKind.Variable,
    event: SymbolKind.Event,
};

function isExposed(declaration: SymbolDeclaration): boolean {
    return !declaration.isSynthetic && declaration.container === null && EXPOSED[declaration.kind] !== undefined;
}

function matches(name: string, query: string): boolean {
    return query.length === 0 || name.toLowerCase().includes(query.toLowerCase());
}

function symbolOf(analysis: DocumentAnalysis, declaration: SymbolDeclaration): WorkspaceSymbol {
    return {
        name: declaration.name,
        kind: EXPOSED[declaration.kind] ?? SymbolKind.Variable,
        containerName: analysis.environment,
        location: { uri: analysis.uri, range: toWordRange(declaration.position, declaration.name) },
    };
}

export function workspaceSymbols(analyses: readonly DocumentAnalysis[], query: string): WorkspaceSymbol[] {
    const found: WorkspaceSymbol[] = [];

    for (const analysis of analyses) {
        for (const declaration of analysis.index.declarations) {
            if (isExposed(declaration) && matches(declaration.name, query)) {
                found.push(symbolOf(analysis, declaration));
            }
        }
    }

    return found;
}
