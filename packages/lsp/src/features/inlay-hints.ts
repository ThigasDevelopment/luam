import type { Type } from '@compiler/checker/types';
import type { Expression, FunctionDeclaration, Statement } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import type { InlayHint, Range } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { DEFAULT_INLAY_HINT_SETTINGS, type InlayHintSettings } from '@lsp/features/inlay-hint-settings';
import { callbackParameterHints, localHints, parameterNameHints, returnHint, typeOf, type HintState } from '@lsp/features/inlay-hint-kinds';
import { buildParenIndex, parsesCleanly } from '@lsp/features/inlay-hint-text';
import { offsetAt } from '@lsp/support/source-text';

function visitExpressions(state: HintState, expressions: readonly Expression[]): void {
    for (const expression of expressions) {
        visitExpression(state, expression);
    }
}

function visitExpression(state: HintState, expression: Expression): void {
    switch (expression.kind) {
        case 'member-expression':
            visitExpression(state, expression.object);

            return;
        case 'index-expression':
            visitExpression(state, expression.object);
            visitExpression(state, expression.index);

            return;
        case 'call-expression':
            visitExpression(state, expression.callee);
            visitExpressions(state, expression.args);
            parameterNameHints(state, expression);

            return;
        case 'new-expression':
            visitExpressions(state, expression.args);

            return;
        case 'function-expression': {
            const signature = typeOf(state, expression);

            callbackParameterHints(state, expression, signature);
            returnHint(state, expression.position.offset, expression.returnAnnotation, signature);
            visitStatements(state, expression.body);

            return;
        }
        case 'table-expression':
            for (const field of expression.fields) {
                if (field.key !== null) {
                    visitExpression(state, field.key);
                }

                visitExpression(state, field.value);
            }

            return;
        case 'binary-expression':
            visitExpression(state, expression.left);
            visitExpression(state, expression.right);

            return;
        case 'unary-expression':
            visitExpression(state, expression.operand);

            return;
        case 'group-expression':
            visitExpression(state, expression.expression);

            return;
        default:
            return;
    }
}

function visitFunctionDeclaration(state: HintState, statement: FunctionDeclaration): void {
    returnHint(state, statement.name.position.offset, statement.returnAnnotation, typeOf(state, statement.name));
    visitStatements(state, statement.body);
}

function methodSignature(state: HintState, owner: string, member: ClassMethodDeclaration): Type | null {
    const lookup = member.isStatic
        ? state.analysis.declarations.lookupStaticMember(owner, member.name)
        : state.analysis.declarations.lookupMember(owner, member.name);

    return lookup?.type ?? null;
}

function visitClass(state: HintState, statement: ClassDeclaration): void {
    for (const member of statement.members) {
        if (member.kind === 'class-field') {
            if (member.value !== null) {
                visitExpression(state, member.value);
            }

            continue;
        }

        if (member.isSynthetic) {
            continue;
        }

        if (!member.isConstructor) {
            returnHint(state, member.position.offset, member.returnAnnotation, methodSignature(state, statement.name, member));
        }

        visitStatements(state, member.body);
    }
}

function visitStatement(state: HintState, statement: Statement): void {
    switch (statement.kind) {
        case 'local-statement':
            visitExpressions(state, statement.values);
            localHints(state, statement);

            return;
        case 'assignment-statement':
            visitExpressions(state, statement.targets);
            visitExpressions(state, statement.values);

            return;
        case 'call-statement':
            visitExpression(state, statement.expression);

            return;
        case 'function-declaration':
            visitFunctionDeclaration(state, statement);

            return;
        case 'return-statement':
            visitExpressions(state, statement.values);

            return;
        case 'do-statement':
            visitStatements(state, statement.body);

            return;
        case 'while-statement':
            visitExpression(state, statement.condition);
            visitStatements(state, statement.body);

            return;
        case 'repeat-statement':
            visitStatements(state, statement.body);
            visitExpression(state, statement.condition);

            return;
        case 'if-statement':
            for (const clause of statement.clauses) {
                visitExpression(state, clause.condition);
                visitStatements(state, clause.body);
            }

            visitStatements(state, statement.alternate ?? []);

            return;
        case 'numeric-for-statement':
            visitExpressions(state, statement.step === null ? [statement.start, statement.limit] : [statement.start, statement.limit, statement.step]);
            visitStatements(state, statement.body);

            return;
        case 'generic-for-statement':
            visitExpressions(state, statement.iterators);
            visitStatements(state, statement.body);

            return;
        case 'class-declaration':
            visitClass(state, statement);

            return;
        default:
            return;
    }
}

function visitStatements(state: HintState, statements: readonly Statement[]): void {
    for (const statement of statements) {
        visitStatement(state, statement);
    }
}

export function inlayHintsAt(analysis: DocumentAnalysis, range: Range, settings: InlayHintSettings = DEFAULT_INLAY_HINT_SETTINGS): InlayHint[] {
    if (analysis.manifest !== null || !parsesCleanly(analysis)) {
        return [];
    }

    const state: HintState = {
        analysis,
        settings,
        parens: buildParenIndex(analysis.tokens),
        from: offsetAt(analysis.starts, range.start.line, range.start.character, analysis.text.length),
        to: offsetAt(analysis.starts, range.end.line, range.end.character, analysis.text.length),
        hints: [],
    };

    visitStatements(state, analysis.program.body);

    return state.hints;
}
