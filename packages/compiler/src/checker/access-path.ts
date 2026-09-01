import type { Expression, Statement } from '@compiler/parser/ast';
import type { ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import type { Type } from './types';

export function pathOf(expression: Expression): string | null {
    if (expression.kind === 'identifier') {
        return expression.name;
    }

    if (expression.kind !== 'member-expression') {
        return null;
    }

    const object = pathOf(expression.object);

    return object === null ? null : `${object}.${expression.property}`;
}

export function assignedPath(target: Expression): string | null {
    const direct = pathOf(target);

    if (direct !== null) {
        return direct;
    }

    return target.kind === 'member-expression' || target.kind === 'index-expression' ? assignedPath(target.object) : null;
}

export function pathType(context: CheckContext, expression: Expression): Type | null {
    if (expression.kind === 'identifier') {
        return context.binder.lookup(expression.name)?.type ?? null;
    }

    return expression.kind === 'member-expression' ? (context.types.get(expression) ?? null) : null;
}

function childExpressions(expression: Expression): readonly Expression[] {
    switch (expression.kind) {
        case 'member-expression':
            return [expression.object];
        case 'index-expression':
            return [expression.object, expression.index];
        case 'call-expression':
            return [expression.callee, ...expression.args];
        case 'new-expression':
            return expression.args;
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

function statementExpressions(statement: Statement): readonly Expression[] {
    switch (statement.kind) {
        case 'local-statement':
        case 'return-statement':
        case 'global-statement':
            return statement.values;
        case 'assignment-statement':
            return [...statement.targets, ...statement.values];
        case 'call-statement':
            return [statement.expression];
        case 'while-statement':
        case 'repeat-statement':
            return [statement.condition];
        case 'if-statement':
            return statement.clauses.map((clause) => clause.condition);
        case 'numeric-for-statement':
            return statement.step === null ? [statement.start, statement.limit] : [statement.start, statement.limit, statement.step];
        case 'generic-for-statement':
            return statement.iterators;
        case 'class-declaration':
            return statement.members.flatMap((member) => (member.kind === 'class-field' && member.value !== null ? [member.value] : []));
        default:
            return [];
    }
}

function blockBodies(statement: Statement): readonly (readonly Statement[])[] {
    switch (statement.kind) {
        case 'do-statement':
        case 'while-statement':
        case 'repeat-statement':
        case 'numeric-for-statement':
        case 'generic-for-statement':
        case 'function-declaration':
            return [statement.body];
        case 'if-statement':
            return [...statement.clauses.map((clause) => clause.body), ...(statement.alternate === null ? [] : [statement.alternate])];
        case 'class-declaration':
            return statement.members.filter((member): member is ClassMethodDeclaration => member.kind === 'class-method').map((member) => member.body);
        default:
            return [];
    }
}

function collectExpressionPaths(expression: Expression, paths: Set<string>): void {
    if (expression.kind === 'function-expression') {
        collectPaths(expression.body, paths);
    }

    for (const child of childExpressions(expression)) {
        collectExpressionPaths(child, paths);
    }
}

function addTargets(statement: Statement, paths: Set<string>): void {
    if (statement.kind === 'assignment-statement') {
        for (const target of statement.targets) {
            const path = assignedPath(target);

            if (path !== null) {
                paths.add(path);
            }
        }
    }

    if (statement.kind === 'local-statement') {
        statement.declarations.forEach((declaration) => paths.add(declaration.name));
    }

    if (statement.kind === 'global-statement') {
        paths.add(statement.declaration.name);
    }
}

export function collectPaths(body: readonly Statement[], paths: Set<string>): void {
    for (const statement of body) {
        addTargets(statement, paths);

        for (const expression of statementExpressions(statement)) {
            collectExpressionPaths(expression, paths);
        }

        for (const block of blockBodies(statement)) {
            collectPaths(block, paths);
        }
    }
}

export function assignedPaths(body: readonly Statement[]): ReadonlySet<string> {
    const paths = new Set<string>();

    collectPaths(body, paths);

    return paths;
}

export function forgetAssignedPaths(context: CheckContext, body: readonly Statement[]): void {
    if (!context.isNarrowed) {
        return;
    }

    for (const path of assignedPaths(body)) {
        context.forgetNarrowing(path);
    }
}
