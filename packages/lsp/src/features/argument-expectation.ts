import { descriptorToType } from '@compiler/checker/api-types';
import { mtaMember, mtaStaticMember } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { firstValueOf, isAssignable, type Type } from '@compiler/checker/types';
import { isAvailableIn } from '@mta-types/api-declaration';
import { findDeclaration } from '@mta-types/catalog';
import { elementAncestors } from '@mta-types/element-hierarchy';
import { isLibrary, LIBRARY_MEMBERS } from '@mta-types/library-members';
import type { CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { resolveReceiver, type ReceiverTarget } from '@lsp/features/completion-context';
import { eventArgumentExpectation } from '@lsp/features/event-signature';
import { calleeSegments, type CallFrame } from '@lsp/features/source-context';
import { matchesReferenceKind, type SymbolDeclaration } from '@lsp/symbols/symbol';

export interface ArgumentExpectation {
    analysis: DocumentAnalysis;
    type: Type;
}

const MATCHING_RANK = '0';

const PROVIDING_RANK = '1';

const UNRELATED_RANK = '2';

const ELEMENT_ROOT = 'Element';

export function localType(analysis: DocumentAnalysis, offset: number, name: string): Type | null {
    const scopeId = analysis.index.scopes.innermostAt(offset);
    const accept = (candidate: SymbolDeclaration): boolean => matchesReferenceKind(candidate, 'value');

    return analysis.index.scopes.resolve(scopeId, name, offset, accept)?.type ?? null;
}

function apiType(analysis: DocumentAnalysis, name: string): Type | null {
    const declaration = findDeclaration(name, analysis.environment);

    if (declaration === null || !isAvailableIn(declaration.environment, analysis.environment)) {
        return null;
    }

    return descriptorToType(declaration.type);
}

function memberType(analysis: DocumentAnalysis, target: ReceiverTarget, member: string): Type | null {
    if (target.kind === 'record') {
        return target.record.members.get(member) ?? null;
    }

    if (target.kind === 'static-class') {
        return mtaStaticMember(target.name, member)?.type ?? null;
    }

    if (target.kind !== 'class') {
        return null;
    }

    if (analysis.compilerOptions.oop && isMtaElementName(analysis.declarations, target.name)) {
        return mtaMember(target.name, member)?.type ?? null;
    }

    return analysis.declarations.lookupMember(target.name, member)?.type ?? null;
}

function calleeType(analysis: DocumentAnalysis, offset: number, segments: readonly string[]): Type | null {
    const first = segments[0];

    if (first === undefined) {
        return null;
    }

    if (segments.length === 1) {
        return localType(analysis, offset, first) ?? apiType(analysis, first);
    }

    const member = segments.at(-1) ?? '';
    const receiver = segments.slice(0, -1);
    const root = receiver[0];

    if (receiver.length === 1 && root !== undefined && isLibrary(root)) {
        const descriptor = LIBRARY_MEMBERS[root][member];

        return descriptor === undefined ? null : descriptorToType(descriptor);
    }

    const target = resolveReceiver(analysis, offset, receiver);

    return target === null ? null : memberType(analysis, target, member);
}

const BLOCK_OPENERS: ReadonlySet<string> = new Set(['function', 'if', 'do']);

function insideNestedFunction(analysis: DocumentAnalysis, frame: CallFrame, offset: number): boolean {
    const stack: string[] = [];

    for (const token of analysis.tokens) {
        if (token.kind !== 'keyword' || token.position.offset < frame.open || token.position.offset >= offset) {
            continue;
        }

        if (BLOCK_OPENERS.has(token.value)) {
            stack.push(token.value);
        } else if (token.value === 'end') {
            stack.pop();
        }
    }

    return stack.includes('function');
}

export function expectedArgument(analysis: DocumentAnalysis, offset: number, frame: CallFrame | null, allowNested = false): ArgumentExpectation | null {
    if (frame === null || !frame.isCall) {
        return null;
    }

    if (!allowNested && insideNestedFunction(analysis, frame, offset)) {
        return null;
    }

    const event = eventArgumentExpectation(analysis, offset, frame);

    if (event !== null && event.kind !== 'any' && event.kind !== 'unknown') {
        return { analysis, type: event };
    }

    const { segments } = calleeSegments(analysis.text, frame.open);
    const callee = calleeType(analysis, offset, segments);

    if (callee === null || callee.kind !== 'function') {
        return null;
    }

    const parameter = callee.parameters[frame.argument];

    if (parameter === undefined || parameter.kind === 'any' || parameter.kind === 'unknown') {
        return null;
    }

    return { analysis, type: parameter };
}

function unwrap(type: Type): Type {
    if (type.kind === 'optional') {
        return unwrap(type.element);
    }

    return type.kind === 'tuple' ? unwrap(firstValueOf(type)) : type;
}

function classAncestors(analysis: DocumentAnalysis, name: string): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    let current = analysis.declarations.lookupClass(name)?.superClass ?? null;

    while (current !== null && !visited.has(current)) {
        visited.add(current);
        ancestors.push(current);
        current = analysis.declarations.lookupClass(current)?.superClass ?? null;
    }

    return ancestors;
}

function matchesNamed(analysis: DocumentAnalysis, source: Type, name: string): boolean {
    if (source.kind !== 'named') {
        return false;
    }

    if (source.name === name) {
        return true;
    }

    if (source.name === ELEMENT_ROOT) {
        return true;
    }

    const interfaces = analysis.declarations.lookupClass(source.name)?.interfaces ?? [];

    if (interfaces.includes(name) || elementAncestors(source.name).includes(name) || classAncestors(analysis, source.name).includes(name)) {
        return true;
    }

    return elementAncestors(name).includes(source.name) || classAncestors(analysis, name).includes(source.name);
}

function matchesTarget(expectation: ArgumentExpectation, source: Type, target: Type): boolean {
    if (source.kind === 'any' || source.kind === 'unknown' || source.kind === 'nil' || source.kind === 'function') {
        return false;
    }

    if (target.kind === 'union') {
        return target.options.some((option) => matchesTarget(expectation, source, unwrap(option)));
    }

    if (source.kind === 'union') {
        return source.options.some((option) => matchesTarget(expectation, unwrap(option), target));
    }

    if (target.kind === 'named') {
        return matchesNamed(expectation.analysis, source, target.name);
    }

    return source.kind !== 'named' && isAssignable(source, target);
}

function matchesExpectation(expectation: ArgumentExpectation, value: Type | null): boolean {
    return value === null ? false : matchesTarget(expectation, unwrap(value), unwrap(expectation.type));
}

function conflictsWith(expectation: ArgumentExpectation, source: Type, target: Type): boolean {
    if (source.kind === 'any' || source.kind === 'unknown' || source.kind === 'nil') {
        return false;
    }

    if (target.kind === 'function') {
        return source.kind !== 'function';
    }

    if (source.kind === 'function') {
        return !matchesExpectation(expectation, source.returnType);
    }

    if (target.kind === 'union') {
        return target.options.every((option) => conflictsWith(expectation, source, unwrap(option)));
    }

    if (source.kind === 'union') {
        return source.options.every((option) => conflictsWith(expectation, unwrap(option), target));
    }

    if (target.kind === 'named') {
        return !matchesNamed(expectation.analysis, source, target.name);
    }

    return source.kind !== 'named' && !isAssignable(source, target);
}

export function conflictsWithExpectation(expectation: ArgumentExpectation | null, value: Type | null): boolean {
    if (expectation === null || value === null) {
        return false;
    }

    return conflictsWith(expectation, unwrap(value), unwrap(expectation.type));
}

function rankOf(expectation: ArgumentExpectation, value: Type | null): string {
    if (matchesExpectation(expectation, value)) {
        return MATCHING_RANK;
    }

    if (value !== null && value.kind === 'function' && matchesExpectation(expectation, value.returnType)) {
        return PROVIDING_RANK;
    }

    return UNRELATED_RANK;
}

export function withArgumentRank(item: CompletionItem, value: Type | null, expectation: ArgumentExpectation | null): CompletionItem {
    if (expectation === null) {
        return item;
    }

    return { ...item, sortText: `${rankOf(expectation, value)}${item.label}` };
}
