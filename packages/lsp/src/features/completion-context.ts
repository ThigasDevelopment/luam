import { descriptorToType } from '@compiler/checker/api-types';
import { mtaMember } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import type { RecordType, Type } from '@compiler/checker/types';
import { isAvailableIn } from '@mta-types/api-declaration';
import { findDeclaration } from '@mta-types/catalog';
import { isLibrary, type LibraryName } from '@mta-types/library-members';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { isIdentifierChar } from '@lsp/support/source-text';
import { matchesReferenceKind, type SymbolDeclaration } from '@lsp/symbols/symbol';

export type ReceiverTarget =
    | { kind: 'library'; library: LibraryName }
    | { kind: 'class'; name: string }
    | { kind: 'enum'; name: string }
    | { kind: 'record'; record: RecordType }
    | { kind: 'native'; receiver: 'table' | 'string' | 'number' };

export interface CompletionContext {
    trigger: '.' | ':' | null;
    segments: string[];
}

function scanIdentifier(text: string, from: number): number {
    let start = from;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    return start;
}

export function isStatementStart(text: string, offset: number): boolean {
    let cursor = scanIdentifier(text, offset) - 1;

    while (cursor >= 0 && (text[cursor] === ' ' || text[cursor] === '\t')) {
        cursor -= 1;
    }

    return cursor < 0 || text[cursor] === '\n' || text[cursor] === '\r' || text[cursor] === ';';
}

export function isDecoratorPosition(text: string, offset: number): boolean {
    const lineStart = Math.max(text.lastIndexOf('\n', offset - 1) + 1, 0);
    const before = text.slice(lineStart, offset);

    if (!/^\s*@[A-Za-z_]*$/.test(before)) {
        return false;
    }

    const after = text.slice(offset);

    if (/^[A-Za-z0-9_]*\s*(?:\r?\n\s*)+class\s+[A-Za-z_]/.test(after)) {
        return true;
    }

    const prefix = text.slice(0, lineStart);
    const classes = [...prefix.matchAll(/\bclass\s+[A-Za-z_][A-Za-z0-9_]*(?:\s+extends\s+[A-Za-z_][A-Za-z0-9_]*)?(?:\s+implements\s+[^\{]+)?\s*\{/g)];
    const latest = classes.at(-1);

    if (latest?.index === undefined) {
        return false;
    }

    const body = prefix.slice(latest.index);
    const opens = [...body.matchAll(/\{/g)].length;
    const closes = [...body.matchAll(/\}/g)].length;

    return opens > closes;
}

export function hasDecoratorPrefix(text: string, offset: number): boolean {
    const lineStart = Math.max(text.lastIndexOf('\n', offset - 1) + 1, 0);

    return /^\s*@[A-Za-z_]*$/.test(text.slice(lineStart, offset));
}

export function completionContext(text: string, offset: number): CompletionContext {
    const wordStart = scanIdentifier(text, offset);
    const separator = text[wordStart - 1];

    if (separator !== '.' && separator !== ':') {
        return { trigger: null, segments: [] };
    }

    const segments: string[] = [];

    let cursor = wordStart - 1;

    for (;;) {
        const start = scanIdentifier(text, cursor);

        if (start === cursor) {
            break;
        }

        segments.unshift(text.slice(start, cursor));

        const previous = text[start - 1];

        if (previous !== '.' && previous !== ':') {
            break;
        }

        cursor = start - 1;
    }

    return { trigger: separator, segments };
}

function fromType(analysis: DocumentAnalysis, type: Type | null): ReceiverTarget | null {
    if (type === null) {
        return null;
    }

    if (type.kind === 'named') {
        return analysis.declarations.lookupEnum(type.name) === null ? { kind: 'class', name: type.name } : { kind: 'enum', name: type.name };
    }

    if (type.kind === 'table' || type.kind === 'array') {
        return { kind: 'native', receiver: 'table' };
    }

    if (type.kind === 'string' || type.kind === 'number') {
        return { kind: 'native', receiver: type.kind };
    }

    if (type.kind === 'record') {
        return { kind: 'record', record: type };
    }

    return null;
}

function projectTarget(analysis: DocumentAnalysis, name: string): ReceiverTarget | null {
    const declaration = analysis.project.globals.find((global) => global.name === name);

    if (declaration === undefined || !isAvailableIn(declaration.environment, analysis.environment)) {
        return null;
    }

    return fromType(analysis, descriptorToType(declaration.type));
}

function catalogTarget(analysis: DocumentAnalysis, name: string): ReceiverTarget | null {
    const declaration = findDeclaration(name);

    if (declaration === null || !isAvailableIn(declaration.environment, analysis.environment)) {
        return null;
    }

    return fromType(analysis, descriptorToType(declaration.type));
}

function rootTarget(analysis: DocumentAnalysis, offset: number, name: string): ReceiverTarget | null {
    const accept = (candidate: SymbolDeclaration): boolean => matchesReferenceKind(candidate, 'value');
    const scopeId = analysis.index.scopes.innermostAt(offset);
    const declaration = analysis.index.scopes.resolve(scopeId, name, offset, accept);

    if (declaration === null) {
        if (isLibrary(name)) {
            return { kind: 'library', library: name };
        }

        return projectTarget(analysis, name) ?? catalogTarget(analysis, name);
    }

    if (declaration.kind === 'enum') {
        return { kind: 'enum', name: declaration.name };
    }

    if (declaration.kind === 'class') {
        return { kind: 'class', name: declaration.name };
    }

    return fromType(analysis, declaration.type);
}

function memberTarget(analysis: DocumentAnalysis, target: ReceiverTarget, name: string): ReceiverTarget | null {
    if (target.kind === 'record') {
        return fromType(analysis, target.record.members.get(name) ?? null);
    }

    if (target.kind !== 'class') {
        return null;
    }

    if (analysis.oop && isMtaElementName(analysis.declarations, target.name)) {
        return fromType(analysis, mtaMember(target.name, name)?.type ?? null);
    }

    const member = analysis.declarations.lookupMember(target.name, name);

    return member === null ? null : fromType(analysis, member.type);
}

export function resolveReceiver(analysis: DocumentAnalysis, offset: number, segments: readonly string[]): ReceiverTarget | null {
    const first = segments[0];

    if (first === undefined) {
        return null;
    }

    let target = rootTarget(analysis, offset, first);

    for (const segment of segments.slice(1)) {
        if (target === null) {
            return null;
        }

        target = memberTarget(analysis, target, segment);
    }

    return target;
}
