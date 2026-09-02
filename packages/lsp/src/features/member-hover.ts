import { typeToString, type Type } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import type { MemberExpression } from '@compiler/parser/ast';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { declaredShape, inferredShape, markdown } from '@lsp/features/declaration-shape';
import { memberMarkdown } from '@lsp/features/documentation-text';
import { shapeMembers } from '@lsp/features/type-shape';
import { toRange } from '@lsp/support/lsp-position';
import { locateWord, positionAt } from '@lsp/support/source-text';

const OPAQUE = new Set(['any', 'unknown', 'table']);

export interface MemberAccess {
    expression: MemberExpression;
    type: Type;
    start: number;
}

function ownerName(received: Type): string | null {
    const owner = received.kind === 'optional' ? received.element : received;

    if (owner.kind === 'record' || owner.kind === 'named') {
        return owner.name;
    }

    return OPAQUE.has(owner.kind) ? null : typeToString(owner);
}

function shapeOf(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], type: Type): string | null {
    const visible = others.filter((other) => canReference(analysis.environment, other.environment));
    const sources = [analysis, ...visible];

    for (const resolve of [declaredShape, inferredShape]) {
        for (const source of sources) {
            const shape = resolve(source, type);

            if (shape !== null) {
                return shape;
            }
        }
    }

    return null;
}

function narrowNote(analysis: DocumentAnalysis, owner: Type, property: string, type: Type): string[] {
    const declared = shapeMembers(analysis, owner)?.get(property) ?? null;

    if (declared === null || typeToString(declared) === typeToString(type)) {
        return [];
    }

    return ['', `narrowed from \`${typeToString(declared)}\``];
}

function contents(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], owner: Type, name: string, property: string, type: Type): string {
    const signature = `${name}.${property}: ${typeToString(type)}`;
    const head = owner.kind === 'record' ? (memberMarkdown(name, property, signature, '') ?? markdown(signature)) : markdown(signature);
    const shape = shapeOf(analysis, others, type);
    const body = shape === null ? [] : ['', '**Instance**', '', markdown(shape)];

    return [head, ...body, ...narrowNote(analysis, owner, property, type)].join('\n');
}

export function memberAccessAt(analysis: DocumentAnalysis, offset: number): MemberAccess | null {
    for (const [expression, type] of analysis.types) {
        if (expression.kind !== 'member-expression' || OPAQUE.has(type.kind)) {
            continue;
        }

        const start = locateWord(analysis.text, expression.position.offset, expression.property);

        if (start === null || offset < start || offset > start + expression.property.length) {
            continue;
        }

        return { expression, type, start };
    }

    return null;
}

export function memberHover(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[] = []): Hover | null {
    const access = memberAccessAt(analysis, offset);

    if (access === null) {
        return null;
    }

    const { expression, type, start } = access;
    const owner = analysis.types.get(expression.object);
    const name = owner === undefined ? null : ownerName(owner);

    if (owner === undefined || name === null) {
        return null;
    }

    return {
        contents: { kind: 'markdown', value: contents(analysis, others, owner, name, expression.property, type) },
        range: toRange(positionAt(analysis.starts, start), expression.property.length),
    };
}

export function methodHover(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[] = []): Hover | null {
    for (const [expression] of analysis.types) {
        if (expression.kind !== 'call-expression' || expression.method === null) {
            continue;
        }

        const start = locateWord(analysis.text, expression.position.offset, expression.method);

        if (start === null || offset < start || offset > start + expression.method.length) {
            continue;
        }

        const received = analysis.types.get(expression.callee);
        const receiver = received === undefined || received.kind !== 'optional' ? received : received.element;

        if (receiver === undefined || receiver.kind !== 'named') {
            continue;
        }

        const member = analysis.declarations.lookupMember(receiver.name, expression.method);

        if (member === null) {
            continue;
        }

        return {
            contents: { kind: 'markdown', value: contents(analysis, others, receiver, receiver.name, expression.method, member.type) },
            range: toRange(positionAt(analysis.starts, start), expression.method.length),
        };
    }

    return null;
}
