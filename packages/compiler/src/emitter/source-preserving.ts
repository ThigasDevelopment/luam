import { resolveCallExtension, resolvePropertyExtension } from './extensions';
import { emit } from './emitter';
import { hybridSourceMappings, type HybridSourceEdit } from './hybrid-source-map';

import type { Type } from '@compiler/checker/types';
import type { SourceLineMapping } from '@compiler/emitter/source-map';
import type { Comment } from '@compiler/lexer/comment-scanner';
import type { Expression, Program, Statement } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import type { SourceSpan } from '@compiler/parser/source-metadata';

function canPreserveExpression(expression: Expression, types: Map<Expression, Type>): boolean {
    switch (expression.kind) {
        case 'template-literal':
        case 'new-expression':
            return false;
        case 'member-expression':
            return resolvePropertyExtension(types.get(expression.object) ?? null, expression.property) === null && canPreserveExpression(expression.object, types);
        case 'index-expression':
            return canPreserveExpression(expression.object, types) && canPreserveExpression(expression.index, types);
        case 'call-expression':
            if (expression.method === null && expression.callee.kind === 'identifier' && expression.callee.name === 'super') {
                return false;
            }

            if (
                expression.callee.kind === 'member-expression' &&
                resolveCallExtension(types.get(expression.callee.object) ?? null, expression.callee.property) !== null
            ) {
                return false;
            }

            return canPreserveExpression(expression.callee, types) && expression.args.every((argument) => canPreserveExpression(argument, types));
        case 'function-expression':
            return canPreserveStatements(expression.body, types);
        case 'table-expression':
            return expression.fields.every(
                (field) => (field.key === null || canPreserveExpression(field.key, types)) && canPreserveExpression(field.value, types),
            );
        case 'binary-expression':
            return canPreserveExpression(expression.left, types) && canPreserveExpression(expression.right, types);
        case 'unary-expression':
            return canPreserveExpression(expression.operand, types);
        case 'group-expression':
            return canPreserveExpression(expression.expression, types);
        default:
            return true;
    }
}

function canPreserveStatement(statement: Statement, types: Map<Expression, Type>): boolean {
    switch (statement.kind) {
        case 'local-statement':
            return statement.values.every((value) => canPreserveExpression(value, types));
        case 'assignment-statement':
            return (
                statement.operator === '=' &&
                statement.targets.every((target) => canPreserveExpression(target, types)) &&
                statement.values.every((value) => canPreserveExpression(value, types))
            );
        case 'call-statement':
            return canPreserveExpression(statement.expression, types);
        case 'function-declaration':
            return canPreserveStatements(statement.body, types);
        case 'return-statement':
            return statement.values.every((value) => canPreserveExpression(value, types));
        case 'break-statement':
            return true;
        case 'continue-statement':
            return false;
        case 'do-statement':
            return canPreserveStatements(statement.body, types);
        case 'while-statement':
            return canPreserveExpression(statement.condition, types) && canPreserveStatements(statement.body, types);
        case 'repeat-statement':
            return canPreserveStatements(statement.body, types) && canPreserveExpression(statement.condition, types);
        case 'if-statement':
            return (
                statement.clauses.every((clause) => canPreserveExpression(clause.condition, types) && canPreserveStatements(clause.body, types)) &&
                (statement.alternate === null || canPreserveStatements(statement.alternate, types))
            );
        case 'numeric-for-statement':
            return (
                canPreserveExpression(statement.start, types) &&
                canPreserveExpression(statement.limit, types) &&
                (statement.step === null || canPreserveExpression(statement.step, types)) &&
                canPreserveStatements(statement.body, types)
            );
        case 'generic-for-statement':
            return statement.iterators.every((iterator) => canPreserveExpression(iterator, types)) && canPreserveStatements(statement.body, types);
        case 'type-alias-statement':
        case 'declare-statement':
        case 'interface-declaration':
            return true;
        default:
            return false;
    }
}

function canPreserveStatements(statements: readonly Statement[], types: Map<Expression, Type>): boolean {
    return statements.every((statement) => canPreserveStatement(statement, types));
}

function commentReplacement(source: string, comment: Comment): string {
    const raw = source.slice(comment.position.offset, comment.end.offset);

    if (comment.isDirective) {
        return raw.replace(/[^\r\n]/g, '');
    }

    if (comment.kind === 'line') {
        return `--${raw.slice(1)}`;
    }

    const body = raw.slice(2, raw.endsWith('*#') ? -2 : undefined);
    let equals = '';

    while (body.includes(`]${equals}]`)) {
        equals += '=';
    }

    return `--[${equals}[${body}]${equals}]`;
}

function sourceEdits(
    source: string,
    erasures: readonly SourceSpan[],
    comments: readonly Comment[],
    loweredEdits: readonly HybridSourceEdit[],
): HybridSourceEdit[] | null {
    const edits: HybridSourceEdit[] = [
        ...erasures.map((span) => ({ ...span, replacement: source.slice(span.start, span.end).replace(/[^\r\n]/g, '') })),
        ...comments.map((comment) => ({
            start: comment.position.offset,
            end: comment.end.offset,
            replacement: commentReplacement(source, comment),
        })),
        ...loweredEdits,
    ].sort((left, right) => left.start - right.start || right.end - left.end);
    const normalized: HybridSourceEdit[] = [];

    for (const edit of edits) {
        const previous = normalized[normalized.length - 1];

        if (previous !== undefined && edit.start < previous.end) {
            if (edit.end <= previous.end) {
                continue;
            }

            return null;
        }

        normalized.push(edit);
    }

    return normalized;
}

function applySourceEdits(source: string, edits: readonly HybridSourceEdit[]): string {
    let output = '';
    let offset = 0;

    for (const edit of edits) {
        output += source.slice(offset, edit.start);
        output += edit.replacement;
        offset = edit.end;
    }

    return output + source.slice(offset);
}

function canonicalEdits(
    source: string,
    program: Program,
    types: Map<Expression, Type>,
    references: ReadonlySet<string>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>,
    statementSpans: ReadonlyMap<Statement, SourceSpan>,
): { edits: HybridSourceEdit[]; lowered: ReadonlySet<Statement> } | null {
    const edits: HybridSourceEdit[] = [];
    const lowered = new Set<Statement>();

    for (const [index, statement] of program.body.entries()) {
        if (canPreserveStatement(statement, types)) {
            continue;
        }

        const span = statementSpans.get(statement);

        if (span === undefined) {
            return null;
        }

        const emitted = emit({ ...program, body: [statement] }, types, references, generatedMembers, statement.position.line - 1);
        const authored = source.slice(span.start, span.end);
        let canonical = span.end < source.length && emitted.code.endsWith('\n') ? emitted.code.slice(0, -1) : emitted.code;

        if (canonical.length === 0) {
            canonical = authored.replace(/[^\r\n]/g, '');
        } else {
            const missingLines = authored.split('\n').length - canonical.split('\n').length;

            if (missingLines > 0 && index < program.body.length - 1) {
                canonical += '\n'.repeat(missingLines);
            }
        }

        edits.push({ ...span, replacement: canonical, lines: emitted.lines });
        lowered.add(statement);
    }

    return { edits, lowered };
}

export function emitPreservingSource(
    source: string,
    program: Program,
    erasures: readonly SourceSpan[],
    comments: readonly Comment[],
    types: Map<Expression, Type>,
    references: ReadonlySet<string>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>,
    statementSpans: ReadonlyMap<Statement, SourceSpan>,
): { code: string; lines: SourceLineMapping[] } | null {
    const canonical = canonicalEdits(source, program, types, references, generatedMembers, statementSpans);

    if (canonical === null) {
        return null;
    }

    const edits = sourceEdits(source, erasures, comments, canonical.edits);

    if (edits === null) {
        return null;
    }

    const code = applySourceEdits(source, edits);

    return { code: code.trim() === '' ? '' : code, lines: hybridSourceMappings(source, program, edits, canonical.lowered) };
}
