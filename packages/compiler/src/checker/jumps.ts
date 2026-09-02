import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Expression, RepeatStatement, Statement } from '@compiler/parser/ast';
import type { ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

interface LoopScope {
    blockedLocal: string | null;
}

interface BlockScope {
    body: readonly Statement[];
    scope: LoopScope | null;
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

function collectNames(expression: Expression, names: Set<string>): void {
    if (expression.kind === 'identifier') {
        names.add(expression.name);
    }

    if (expression.kind === 'function-expression') {
        collectBlockNames(expression.body, names);
    }

    for (const child of childExpressions(expression)) {
        collectNames(child, names);
    }
}

function collectBlockNames(body: readonly Statement[], names: Set<string>): void {
    for (const statement of body) {
        for (const expression of statementExpressions(statement)) {
            collectNames(expression, names);
        }

        for (const block of blockScopes(statement, null)) {
            collectBlockNames(block.body, names);
        }
    }
}

function localNameOf(statement: Statement, names: ReadonlySet<string>): string | null {
    if (statement.kind === 'local-statement') {
        return statement.declarations.find((declaration) => names.has(declaration.name))?.name ?? null;
    }

    if (statement.kind === 'function-declaration' && statement.isLocal && statement.name.kind === 'identifier') {
        return names.has(statement.name.name) ? statement.name.name : null;
    }

    return null;
}

function blockedLocalOf(statement: RepeatStatement): string | null {
    const names = new Set<string>();

    collectNames(statement.condition, names);

    for (const inner of statement.body) {
        const name = localNameOf(inner, names);

        if (name !== null) {
            return name;
        }
    }

    return null;
}

function blockScopes(statement: Statement, scope: LoopScope | null): readonly BlockScope[] {
    switch (statement.kind) {
        case 'do-statement':
            return [{ body: statement.body, scope }];
        case 'if-statement':
            return [
                ...statement.clauses.map((clause) => ({ body: clause.body, scope })),
                ...(statement.alternate === null ? [] : [{ body: statement.alternate, scope }]),
            ];
        case 'while-statement':
        case 'numeric-for-statement':
        case 'generic-for-statement':
            return [{ body: statement.body, scope: { blockedLocal: null } }];
        case 'repeat-statement':
            return [{ body: statement.body, scope: { blockedLocal: blockedLocalOf(statement) } }];
        case 'function-declaration':
            return [{ body: statement.body, scope: null }];
        case 'class-declaration':
            return statement.members
                .filter((member): member is ClassMethodDeclaration => member.kind === 'class-method')
                .map((member) => ({ body: member.body, scope: null }));
        default:
            return [];
    }
}

function report(diagnostics: Diagnostic[], keyword: string, message: string, position: SourcePosition): void {
    diagnostics.push(createDiagnostic('checker', `check-invalid-${keyword}`, message, position));
}

function reportJump(diagnostics: Diagnostic[], statement: Statement, scope: LoopScope | null, isLast: boolean): void {
    if (statement.kind !== 'break-statement' && statement.kind !== 'continue-statement') {
        return;
    }

    const keyword = statement.kind === 'continue-statement' ? 'continue' : 'break';

    if (scope === null) {
        report(diagnostics, keyword, `A "${keyword}" can only appear inside a loop.`, statement.position);

        return;
    }

    if (!isLast) {
        const message = `A "${keyword}" must be the last statement in its block. Move the statements below it above the "${keyword}".`;

        report(diagnostics, keyword, message, statement.position);
    }

    if (statement.kind === 'continue-statement' && scope.blockedLocal !== null) {
        const message = `A "continue" cannot jump over local "${scope.blockedLocal}", which the "until" condition reads. Declare it above the loop or use "while".`;

        report(diagnostics, keyword, message, statement.position);
    }
}

function visitExpression(diagnostics: Diagnostic[], expression: Expression): void {
    if (expression.kind === 'function-expression') {
        visitBlock(diagnostics, expression.body, null);
    }

    for (const child of childExpressions(expression)) {
        visitExpression(diagnostics, child);
    }
}

function visitBlock(diagnostics: Diagnostic[], body: readonly Statement[], scope: LoopScope | null): void {
    body.forEach((statement, index) => {
        reportJump(diagnostics, statement, scope, index === body.length - 1);

        for (const expression of statementExpressions(statement)) {
            visitExpression(diagnostics, expression);
        }

        for (const block of blockScopes(statement, scope)) {
            visitBlock(diagnostics, block.body, block.scope);
        }
    });
}

export function checkJumps(body: readonly Statement[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    visitBlock(diagnostics, body, null);

    return diagnostics;
}
