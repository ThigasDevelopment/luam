import { typeToString, type Type } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { containerShape, markdown } from '@lsp/features/declaration-shape';
import { memberMarkdown } from '@lsp/features/documentation-text';
import { toRange } from '@lsp/support/lsp-position';
import { locateWord, positionAt } from '@lsp/support/source-text';

const OPAQUE = new Set(['any', 'unknown', 'table']);

function ownerName(owner: Type): string | null {
    if (owner.kind === 'record' || owner.kind === 'named') {
        return owner.name;
    }

    return OPAQUE.has(owner.kind) ? null : typeToString(owner);
}

function shapeOf(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], type: Type): string | null {
    if (type.kind !== 'named') {
        return null;
    }

    const visible = others.filter((other) => canReference(analysis.environment, other.environment));

    for (const source of [analysis, ...visible]) {
        const shape = containerShape(source, type.name);

        if (shape !== null) {
            return shape;
        }
    }

    return null;
}

function contents(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], owner: Type, name: string, property: string, type: Type): string {
    const signature = `${name}.${property}: ${typeToString(type)}`;
    const head = owner.kind === 'record' ? (memberMarkdown(name, property, signature, '') ?? markdown(signature)) : markdown(signature);
    const shape = shapeOf(analysis, others, type);

    return shape === null ? head : [head, '', '**Instance**', '', markdown(shape)].join('\n');
}

export function memberHover(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[] = []): Hover | null {
    for (const [expression, type] of analysis.types) {
        if (expression.kind !== 'member-expression' || OPAQUE.has(type.kind)) {
            continue;
        }

        const start = locateWord(analysis.text, expression.position.offset, expression.property);

        if (start === null || offset < start || offset > start + expression.property.length) {
            continue;
        }

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

    return null;
}
