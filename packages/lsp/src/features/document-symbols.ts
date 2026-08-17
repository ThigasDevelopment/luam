import { SymbolKind, type DocumentSymbol } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { toWordRange } from '@lsp/support/lsp-position';
import type { SymbolDeclaration, SymbolKind as LuamSymbolKind } from '@lsp/symbols/symbol';

const SYMBOL_KINDS: Readonly<Record<LuamSymbolKind, SymbolKind>> = {
    local: SymbolKind.Variable,
    parameter: SymbolKind.Variable,
    function: SymbolKind.Function,
    global: SymbolKind.Variable,
    class: SymbolKind.Class,
    interface: SymbolKind.Interface,
    enum: SymbolKind.Enum,
    'type-alias': SymbolKind.TypeParameter,
    field: SymbolKind.Field,
    method: SymbolKind.Method,
    'enum-member': SymbolKind.EnumMember,
    event: SymbolKind.Event,
};

function documentSymbol(declaration: SymbolDeclaration, children?: DocumentSymbol[]): DocumentSymbol {
    const range = toWordRange(declaration.position, declaration.name);

    const symbol: DocumentSymbol = {
        name: declaration.name,
        detail: declaration.detail,
        kind: SYMBOL_KINDS[declaration.kind],
        range,
        selectionRange: range,
    };

    if (children !== undefined) {
        symbol.children = children;
    }

    return symbol;
}

export function documentSymbols(analysis: DocumentAnalysis): DocumentSymbol[] {
    const visible = analysis.index.declarations.filter((declaration) => !declaration.isSynthetic);
    const roots = visible.filter((declaration) => declaration.container === null && declaration.kind !== 'parameter' && declaration.kind !== 'local');

    return roots.map((declaration) => {
        const children = visible.filter((candidate) => candidate.container === declaration.name).map((candidate) => documentSymbol(candidate));

        return documentSymbol(declaration, children.length === 0 ? undefined : children);
    });
}
