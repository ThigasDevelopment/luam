import { emitClassDeclaration, emitEnumDeclaration } from './classes';
import { emitExpression, emitFunctionBody } from './expressions';
import { CONTINUE_JUMP, emitBreak, emitLoop } from './loops';
import { finalizeEmission, type SourceLineMapping } from './source-map';
import { createEmitState, indentLine, markSource, withSymbol, type EmitState, type RuntimeHelper } from './state';

import { binaryPrecedence, COMPOUND_OPERATORS, isRightAssociative } from '@compiler/parser/precedence';

import type { Type } from '@compiler/checker/types';
import type {
    AssignmentStatement,
    Expression,
    FunctionDeclaration,
    GenericForStatement,
    IfStatement,
    LocalStatement,
    NumericForStatement,
    Program,
    Statement,
} from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

export interface EmitResult {
    code: string;
    requiredHelpers: RuntimeHelper[];
    lines: SourceLineMapping[];
}

function emitLocal(state: EmitState, statement: LocalStatement): string {
    const names = statement.declarations.map((declaration) => declaration.name).join(', ');

    if (statement.values.length === 0) {
        return `local ${names}`;
    }

    const values = statement.values.map((value) => emitExpression(state, value)).join(', ');

    return `local ${names} = ${values}`;
}

function emitCompoundValues(state: EmitState, statement: AssignmentStatement, targets: readonly string[]): string[] {
    const operator = COMPOUND_OPERATORS.get(statement.operator) ?? statement.operator;
    const precedence = binaryPrecedence(operator);
    const limit = isRightAssociative(operator) ? precedence : precedence + 1;

    return statement.values.map((value, index) => `${targets[index] ?? ''} ${operator} ${emitExpression(state, value, limit)}`);
}

function emitIncrement(statement: AssignmentStatement, targets: readonly string[]): string {
    const target = targets[0] ?? '';
    const operator = COMPOUND_OPERATORS.get(statement.operator) ?? '+';

    return `${target} = ${target} ${operator} 1`;
}

function emitAssignment(state: EmitState, statement: AssignmentStatement): string {
    const targets = statement.targets.map((target) => emitExpression(state, target));

    if (statement.values.length === 0) {
        return emitIncrement(statement, targets);
    }

    const values =
        statement.operator === '='
            ? statement.values.map((value) => emitExpression(state, value))
            : emitCompoundValues(state, statement, targets);

    return `${targets.join(', ')} = ${values.join(', ')}`;
}

function emitFunctionName(state: EmitState, statement: FunctionDeclaration): string {
    if (statement.name.kind === 'identifier') {
        return statement.name.name;
    }

    const object = emitExpression(state, statement.name.object);
    const separator = statement.isMethod ? ':' : '.';

    return `${object}${separator}${statement.name.property}`;
}

function emitFunctionDeclaration(state: EmitState, statement: FunctionDeclaration): string {
    const prefix = statement.isLocal ? 'local function ' : 'function ';
    const name = emitFunctionName(state, statement);
    const header = `${prefix}${name}`;

    return withSymbol(state, name, () => emitFunctionBody(state, statement.parameters, statement.body, header));
}

function emitNested(state: EmitState, body: readonly Statement[]): string[] {
    state.indent += 1;

    const lines = emitBlock(state, body);

    state.indent -= 1;

    return lines;
}

function emitIf(state: EmitState, statement: IfStatement): string {
    const parts: string[] = [];

    statement.clauses.forEach((clause, index) => {
        const keyword = index === 0 ? 'if' : indentLine(state, 'elseif');

        parts.push(`${keyword} ${emitExpression(state, clause.condition)} then`);
        parts.push(...emitNested(state, clause.body));
    });

    if (statement.alternate !== null) {
        parts.push(indentLine(state, 'else'));
        parts.push(...emitNested(state, statement.alternate));
    }

    parts.push(indentLine(state, 'end'));

    return parts.join('\n');
}

function emitNumericFor(state: EmitState, statement: NumericForStatement): string {
    const bounds = [statement.start, statement.limit, statement.step]
        .filter((bound): bound is Expression => bound !== null)
        .map((bound) => emitExpression(state, bound));

    const header = `for ${statement.variable.name} = ${bounds.join(', ')} do`;

    return emitLoop(state, header, statement.body, 'end');
}

function emitGenericFor(state: EmitState, statement: GenericForStatement): string {
    const names = statement.variables.map((variable) => variable.name).join(', ');
    const iterators = statement.iterators.map((iterator) => emitExpression(state, iterator)).join(', ');
    const header = `for ${names} in ${iterators} do`;

    return emitLoop(state, header, statement.body, 'end');
}

function emitStatement(state: EmitState, statement: Statement): string | null {
    switch (statement.kind) {
        case 'local-statement':
            return emitLocal(state, statement);
        case 'assignment-statement':
            return emitAssignment(state, statement);
        case 'call-statement':
            return emitExpression(state, statement.expression);
        case 'function-declaration':
            return emitFunctionDeclaration(state, statement);
        case 'return-statement': {
            const values = statement.values.map((value) => emitExpression(state, value)).join(', ');

            return values.length === 0 ? 'return' : `return ${values}`;
        }
        case 'break-statement':
            return emitBreak(state);
        case 'continue-statement':
            return CONTINUE_JUMP;
        case 'do-statement':
            return ['do', ...emitNested(state, statement.body), indentLine(state, 'end')].join('\n');
        case 'while-statement':
            return emitLoop(state, `while ${emitExpression(state, statement.condition)} do`, statement.body, 'end');
        case 'repeat-statement':
            return emitLoop(state, 'repeat', statement.body, `until ${emitExpression(state, statement.condition)}`);
        case 'if-statement':
            return emitIf(state, statement);
        case 'numeric-for-statement':
            return emitNumericFor(state, statement);
        case 'generic-for-statement':
            return emitGenericFor(state, statement);
        case 'class-declaration':
            return emitClassDeclaration(state, statement);
        case 'enum-declaration':
            return emitEnumDeclaration(state, statement);
        default:
            return null;
    }
}

export function emitBlock(state: EmitState, statements: readonly Statement[]): string[] {
    const lines: string[] = [];

    for (const statement of statements) {
        const text = emitStatement(state, statement);

        if (text !== null) {
            lines.push(indentLine(state, `${markSource(state, statement.position.line)}${text}`));
        }
    }

    return lines;
}

export function emit(
    program: Program,
    types: Map<Expression, Type>,
    references: ReadonlySet<string>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]> = new Map(),
    sourceLineOffset = 0,
): EmitResult {
    const state = createEmitState(types, references, generatedMembers);
    const lines = emitBlock(state, program.body);
    const markedCode = lines.length === 0 ? '' : `${lines.join('\n')}\n`;
    const finalized = finalizeEmission(markedCode, state.markers, sourceLineOffset);

    return { code: finalized.code, requiredHelpers: [...state.helpers].sort(), lines: finalized.lines };
}
