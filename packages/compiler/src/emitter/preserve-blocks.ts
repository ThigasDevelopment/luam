import type { Expression, Statement } from '@compiler/parser/ast';

function fromExpression(expression: Expression, blocks: Statement[][]): void {
    switch (expression.kind) {
        case 'function-expression':
            blocks.push(expression.body);

            return;
        case 'member-expression':
            fromExpression(expression.object, blocks);

            return;
        case 'index-expression':
            fromExpression(expression.object, blocks);
            fromExpression(expression.index, blocks);

            return;
        case 'call-expression':
            fromExpression(expression.callee, blocks);
            fromExpressions(expression.args, blocks);

            return;
        case 'new-expression':
            fromExpressions(expression.args, blocks);

            return;
        case 'table-expression':
            for (const field of expression.fields) {
                if (field.key !== null) {
                    fromExpression(field.key, blocks);
                }

                fromExpression(field.value, blocks);
            }

            return;
        case 'binary-expression':
            fromExpression(expression.left, blocks);
            fromExpression(expression.right, blocks);

            return;
        case 'unary-expression':
            fromExpression(expression.operand, blocks);

            return;
        case 'group-expression':
            fromExpression(expression.expression, blocks);

            return;
        default:
            return;
    }
}

function fromExpressions(expressions: readonly Expression[], blocks: Statement[][]): void {
    for (const expression of expressions) {
        fromExpression(expression, blocks);
    }
}

export function loopBody(statement: Statement): readonly Statement[] | null {
    switch (statement.kind) {
        case 'generic-for-statement':
        case 'numeric-for-statement':
        case 'repeat-statement':
        case 'while-statement':
            return statement.body;
        default:
            return null;
    }
}

export function nestedBlocks(statement: Statement): Statement[][] {
    const blocks: Statement[][] = [];

    switch (statement.kind) {
        case 'local-statement':
            fromExpressions(statement.values, blocks);
            break;
        case 'assignment-statement':
            fromExpressions([...statement.targets, ...statement.values], blocks);
            break;
        case 'global-statement':
            fromExpressions(statement.values, blocks);
            break;
        case 'call-statement':
            fromExpression(statement.expression, blocks);
            break;
        case 'return-statement':
            fromExpressions(statement.values, blocks);
            break;
        case 'do-statement':
        case 'function-declaration':
            blocks.push(statement.body);
            break;
        case 'repeat-statement':
        case 'while-statement':
            fromExpression(statement.condition, blocks);
            break;
        case 'if-statement':
            for (const clause of statement.clauses) {
                fromExpression(clause.condition, blocks);
                blocks.push(clause.body);
            }

            if (statement.alternate !== null) {
                blocks.push(statement.alternate);
            }

            break;
        case 'numeric-for-statement':
            fromExpressions([statement.start, statement.limit, ...(statement.step === null ? [] : [statement.step])], blocks);
            break;
        case 'generic-for-statement':
            fromExpressions(statement.iterators, blocks);
            break;
        case 'class-declaration':
            for (const member of statement.members) {
                if (member.kind === 'class-method') {
                    blocks.push(member.body);
                } else if (member.value !== null) {
                    fromExpression(member.value, blocks);
                }
            }

            break;
        default:
            break;
    }

    return blocks;
}
