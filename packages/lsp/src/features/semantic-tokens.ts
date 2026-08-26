import type { Token } from '@compiler/lexer/token';
import { eventEnvironment } from '@mta-types/event-lookup';
import type { Range, SemanticTokens } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { catalogClassification, declarationClassification, typePositionClassification, typeOfKind, type Classification } from '@lsp/features/semantic-classify';
import { encodeTokens, sortTokens, type SemanticToken } from '@lsp/features/semantic-legend';
import { offsetAt, positionAt } from '@lsp/support/source-text';
import type { SymbolReference } from '@lsp/symbols/symbol';

const AFTER_NEW = /\bnew\s+$/;

const IN_DECLARATION_HEAD = /\b(?:extends|implements)\s+[A-Za-z0-9_,\s]*$/;

function currentLine(before: string): string {
    return before.slice(before.lastIndexOf('\n') + 1);
}

const DECORATOR_MARK = '@';

const LANGUAGE_NAMES: ReadonlySet<string> = new Set(['self', 'super']);

interface Placement {
    line: number;
    character: number;
    length: number;
}

function placement(analysis: DocumentAnalysis, offset: number, length: number): Placement | null {
    if (offset < 0 || offset > analysis.text.length || length <= 0) {
        return null;
    }

    const position = positionAt(analysis.starts, offset);

    return { line: position.line - 1, character: position.column - 1, length };
}

function push(tokens: SemanticToken[], seen: Set<number>, spot: Placement | null, offset: number, classification: Classification | null): void {
    if (spot === null || classification === null || seen.has(offset)) {
        return;
    }

    seen.add(offset);
    tokens.push({ line: spot.line, character: spot.character, length: spot.length, type: classification.type, modifiers: classification.modifiers });
}

function referenceClassification(analysis: DocumentAnalysis, reference: SymbolReference): Classification | null {
    if (LANGUAGE_NAMES.has(reference.name)) {
        return null;
    }

    const declaration = analysis.index.resolve(reference);

    if (reference.kind === 'type') {
        const before = analysis.text.slice(0, reference.position.offset);

        if (AFTER_NEW.test(before)) {
            return declaration === null ? { type: 'class', modifiers: [] } : { type: typeOfKind(declaration.kind), modifiers: [] };
        }

        if (IN_DECLARATION_HEAD.test(currentLine(before))) {
            return null;
        }

        return typePositionClassification(declaration, reference.name);
    }

    if (declaration !== null) {
        return { type: typeOfKind(declaration.kind), modifiers: declaration.isSynthetic ? ['generated'] : [] };
    }

    return reference.kind === 'member' ? null : catalogClassification(reference.name);
}

function collectCatalogTokens(analysis: DocumentAnalysis, tokens: SemanticToken[], seen: Set<number>): void {
    const source = analysis.tokens;

    for (let index = 0; index < source.length; index += 1) {
        const token = source[index] as Token;

        if (token.kind === 'string' && eventEnvironment(token.value) !== null) {
            const offset = token.position.offset;

            push(tokens, seen, placement(analysis, offset, token.end.offset - offset), offset, { type: 'event', modifiers: [] });

            continue;
        }

        const next = source[index + 1];

        if (token.kind === 'operator' && token.value === DECORATOR_MARK && next !== undefined && next.kind === 'identifier') {
            const offset = next.position.offset;

            push(tokens, seen, placement(analysis, offset, next.value.length), offset, { type: 'decorator', modifiers: ['erased'] });
        }
    }
}

export function semanticTokensFor(analysis: DocumentAnalysis): SemanticToken[] {
    const tokens: SemanticToken[] = [];
    const seen = new Set<number>();

    for (const declaration of analysis.index.declarations) {
        const offset = declaration.position.offset;

        if (LANGUAGE_NAMES.has(declaration.name) || declaration.isSynthetic) {
            continue;
        }

        push(tokens, seen, placement(analysis, offset, declaration.name.length), offset, declarationClassification(declaration));
    }

    for (const reference of analysis.index.references) {
        const offset = reference.position.offset;

        push(tokens, seen, placement(analysis, offset, reference.name.length), offset, referenceClassification(analysis, reference));
    }

    collectCatalogTokens(analysis, tokens, seen);

    return sortTokens(tokens);
}

function withinRange(analysis: DocumentAnalysis, range: Range): (token: SemanticToken) => boolean {
    const start = offsetAt(analysis.starts, range.start.line, range.start.character, analysis.text.length);
    const end = offsetAt(analysis.starts, range.end.line, range.end.character, analysis.text.length);

    return (token: SemanticToken): boolean => {
        const offset = (analysis.starts[token.line] ?? 0) + token.character;

        return offset >= start && offset <= end;
    };
}

export function semanticTokens(analysis: DocumentAnalysis, range: Range | null = null): SemanticTokens {
    const produced = semanticTokensFor(analysis);
    const selected = range === null ? produced : produced.filter(withinRange(analysis, range));

    return { data: encodeTokens(selected) };
}
