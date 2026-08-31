import { resolveCallExtension, resolvePropertyExtension } from './extensions';
import { emitExpression } from './expressions';
import type { HybridSourceEdit } from './hybrid-source-map';
import { isPreservableExpression, type ExpressionTypes, type StaticAccess } from './preserve-guards';
import type { PreserveInput } from './preserve-input';
import { createEmitState } from './state';

import type { Expression, Statement } from '@compiler/parser/ast';

function children(expression: Expression): Expression[] {
    switch (expression.kind) {
        case 'member-expression':
            return [expression.object];
        case 'index-expression':
            return [expression.object, expression.index];
        case 'call-expression':
            return [expression.callee, ...expression.args];
        case 'new-expression':
            return [...expression.args];
        case 'table-expression':
            return expression.fields.flatMap((field) => (field.key === null ? [field.value] : [field.key, field.value]));
        case 'binary-expression':
            return [expression.left, expression.right];
        case 'unary-expression':
            return [expression.operand];
        case 'group-expression':
            return [expression.expression];
        default:
            return [];
    }
}

function isOwnFailure(expression: Expression, types: ExpressionTypes, statics: StaticAccess): boolean {
    switch (expression.kind) {
        case 'template-literal':
        case 'new-expression':
            return true;
        case 'member-expression':
            return statics.has(expression) || resolvePropertyExtension(types.get(expression.object) ?? null, expression.property) !== null;
        case 'call-expression':
            if (expression.method === null && expression.callee.kind === 'identifier' && expression.callee.name === 'super') {
                return true;
            }

            return (
                expression.callee.kind === 'member-expression' &&
                resolveCallExtension(types.get(expression.callee.object) ?? null, expression.callee.property) !== null
            );
        default:
            return false;
    }
}

function holdsFunction(expression: Expression): boolean {
    return expression.kind === 'function-expression' || children(expression).some(holdsFunction);
}

function collect(input: PreserveInput, expression: Expression, found: Expression[]): boolean {
    if (isPreservableExpression(expression, input.types, input.staticAccess)) {
        return true;
    }

    if (isOwnFailure(expression, input.types, input.staticAccess)) {
        found.push(expression);

        return true;
    }

    return children(expression).every((child) => collect(input, child, found));
}

function statementExpressions(statement: Statement): Expression[] | null {
    switch (statement.kind) {
        case 'local-statement':
            return [...statement.values];
        case 'assignment-statement':
            return statement.operator === '=' ? [...statement.targets, ...statement.values] : null;
        case 'call-statement':
            return [statement.expression];
        case 'return-statement':
            return [...statement.values];
        case 'if-statement':
            return statement.clauses.map((clause) => clause.condition);
        default:
            return null;
    }
}

export function expressionEdits(input: PreserveInput, statement: Statement): HybridSourceEdit[] | null {
    const slots = input.development ? statementExpressions(statement) : null;

    if (slots === null) {
        return null;
    }

    const found: Expression[] = [];

    if (!slots.every((slot) => collect(input, slot, found)) || found.length === 0) {
        return null;
    }

    const edits: HybridSourceEdit[] = [];

    for (const expression of found) {
        const span = input.spans.get(expression);

        if (span === undefined || holdsFunction(expression)) {
            return null;
        }

        const state = createEmitState(input.types, input.references, input.generatedMembers, input.staticAccess);
        const replacement = emitExpression(state, expression);

        if (replacement.includes('\n') || input.source.slice(span.start, span.end).includes('\n')) {
            return null;
        }

        edits.push({ start: span.start, end: span.end, replacement });
    }

    return edits;
}
