import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type {
    AssignmentStatement,
    DeclareStatement,
    Expression,
    FunctionDeclaration,
    LocalStatement,
    Parameter,
    ReturnStatement,
    Statement,
    TypeAnnotation,
} from '@compiler/parser/ast';

import { checkClassDeclaration, checkEnumDeclaration, checkInterfaceDeclaration } from './classes';
import type { CheckContext } from './context';
import { checkBlock, checkGenericFor, checkIf, checkNumericFor } from './control-flow';
import { checkExpression, checkValueList } from './expressions';
import { guardFacts } from './narrowing';
import {
    ANY_TYPE,
    createFunction,
    createTuple,
    isConcatenable,
    isNumeric,
    NIL_TYPE,
    renameRecord,
    typeToString,
    widenInferred,
    type FunctionType,
    type Type,
} from './types';

const ORIGIN: SourcePosition = { line: 0, column: 0, offset: 0 };

function minimumArguments(context: CheckContext, parameters: readonly Parameter[]): number {
    const index = parameters.findIndex((parameter) => {
        const type = context.resolveAnnotation(parameter.annotation);

        return parameter.isVararg || type.kind === 'optional' || type.kind === 'any';
    });

    return index === -1 ? parameters.length : index;
}

export function buildFunctionType(context: CheckContext, parameters: readonly Parameter[], returnAnnotation: TypeAnnotation | null): FunctionType {
    const isVariadic = parameters.some((parameter) => parameter.isVararg);
    const types = parameters.filter((parameter) => !parameter.isVararg).map((parameter) => context.resolveAnnotation(parameter.annotation));

    return createFunction(types, context.resolveAnnotation(returnAnnotation), minimumArguments(context, parameters), isVariadic);
}

export function checkFunctionBody(
    context: CheckContext,
    parameters: readonly Parameter[],
    returnAnnotation: TypeAnnotation | null,
    body: readonly Statement[],
    signature: FunctionType,
    selfType: Type | null,
): void {
    context.binder.pushScope();
    context.pushReturnType(returnAnnotation === null ? null : context.resolveAnnotation(returnAnnotation));

    if (selfType !== null) {
        context.binder.declare({ name: 'self', type: selfType, isLocal: true, position: ORIGIN });
    }

    for (const parameter of parameters) {
        const type = parameter.isVararg ? ANY_TYPE : context.resolveAnnotation(parameter.annotation);

        context.binder.declare({ name: parameter.name, type, isLocal: true, position: parameter.position, origin: 'parameter' });
    }

    checkStatements(context, body);
    const inferred = context.popReturnType();

    if (returnAnnotation === null) {
        signature.returnType = inferred;
    }

    context.binder.popScope();
}

function valueAt(values: readonly Expression[], valueTypes: readonly Type[], index: number): Expression | undefined {
    if (values[index] !== undefined) {
        return values[index];
    }

    return index < valueTypes.length ? values[values.length - 1] : undefined;
}

function checkLocal(context: CheckContext, statement: LocalStatement): void {
    const valueTypes = checkValueList(context, statement.values);

    statement.declarations.forEach((declaration, index) => {
        const value = valueAt(statement.values, valueTypes, index);
        const valueType = valueTypes[index] ?? NIL_TYPE;

        context.forgetNarrowing(declaration.name);

        if (declaration.annotation === null) {
            const inferred = context.allowNil || value === undefined ? ANY_TYPE : widenInferred(valueType);

            context.binder.declare({ name: declaration.name, type: inferred, isLocal: true, position: declaration.position, origin: 'local' });

            return;
        }

        const declared = context.resolveAnnotation(declaration.annotation);

        if (value !== undefined) {
            context.expectAssignable(valueType, declared, value.position, `Variable "${declaration.name}"`);
        }

        context.binder.declare({ name: declaration.name, type: declared, isLocal: true, position: declaration.position, origin: 'local' });
    });
}

function checkCompoundOperand(context: CheckContext, operator: string, type: Type, position: SourcePosition): void {
    if (operator === '..=') {
        if (!isConcatenable(type)) {
            context.report('check-invalid-operand', `Operator "..=" cannot be applied to "${typeToString(type)}".`, position);
        }

        return;
    }

    if (!isNumeric(type)) {
        context.report('check-invalid-operand', `Operator "${operator}" cannot be applied to "${typeToString(type)}".`, position);
    }
}

function checkAssignment(context: CheckContext, statement: AssignmentStatement): void {
    const valueTypes = checkValueList(context, statement.values);

    statement.targets.forEach((target, index) => {
        const targetType = checkExpression(context, target);
        const valueType = valueTypes[index] ?? NIL_TYPE;
        const value = valueAt(statement.values, valueTypes, index);

        if (statement.operator !== '=') {
            checkCompoundOperand(context, statement.operator, targetType, target.position);

            if (statement.values.length > 0) {
                checkCompoundOperand(context, statement.operator, valueType, value?.position ?? target.position);
            }

            return;
        }

        if (target.kind === 'identifier' && context.binder.lookup(target.name) === null) {
            context.declareModuleGlobal({ name: target.name, type: valueType, isLocal: false, position: target.position });

            return;
        }

        const declared = target.kind === 'identifier' ? (context.binder.lookup(target.name)?.type ?? targetType) : targetType;

        if (value !== undefined) {
            context.expectAssignable(valueType, declared, value.position, 'Assignment');
        }

        if (target.kind === 'identifier') {
            context.forgetNarrowing(target.name);
        }
    });
}

function checkFunctionDeclaration(context: CheckContext, statement: FunctionDeclaration): void {
    const type = buildFunctionType(context, statement.parameters, statement.returnAnnotation);

    if (statement.name.kind === 'identifier') {
        const symbol = { name: statement.name.name, type, isLocal: statement.isLocal, position: statement.position };

        if (statement.isLocal) {
            context.binder.declare({ ...symbol, origin: 'local' });
        } else {
            context.declareModuleGlobal(symbol);
        }
    }

    context.record(statement.name, type);
    checkFunctionBody(context, statement.parameters, statement.returnAnnotation, statement.body, type, statement.isMethod ? ANY_TYPE : null);
}

function checkReturn(context: CheckContext, statement: ReturnStatement): void {
    const valueTypes = checkValueList(context, statement.values);
    const expected = context.currentReturnType();

    if (expected === null) {
        context.inferReturnType(createTuple(valueTypes));

        return;
    }

    if (expected.kind === 'any') {
        return;
    }

    if (expected.kind === 'void') {
        if (statement.values.length > 0) {
            context.report('check-return-mismatch', 'This function is declared "void" and cannot return a value.', statement.position);
        }

        return;
    }

    if (expected.kind === 'tuple') {
        if (valueTypes.length !== expected.elements.length) {
            const message = `This function declares ${expected.elements.length} return values but returns ${valueTypes.length}.`;

            context.report('check-return-mismatch', message, statement.position);

            return;
        }

        valueTypes.forEach((type, index) => {
            const value = statement.values[Math.min(index, statement.values.length - 1)];

            context.expectAssignable(type, expected.elements[index] ?? ANY_TYPE, value?.position ?? statement.position, `Return value ${index + 1}`);
        });

        return;
    }

    if (valueTypes.length > 1) {
        const message = `This function declares one return value of type "${typeToString(expected)}" but returns ${valueTypes.length} values.`;

        context.report('check-return-mismatch', message, statement.position);

        return;
    }

    const first = valueTypes[0];
    const value = statement.values[0];

    if (first === undefined || value === undefined) {
        context.expectAssignable(NIL_TYPE, expected, statement.position, 'Return value');

        return;
    }

    context.expectAssignable(first, expected, value.position, 'Return value');
}

function checkDeclareStatement(context: CheckContext, statement: DeclareStatement): void {
    if (!context.isDeclarationFile) {
        const message = 'A "declare" statement describes code the compiler does not own and belongs in a ".d.luam" file.';

        context.report('check-declare-outside-declaration-file', message, statement.position);

        return;
    }

    const type = context.resolveAnnotation(statement.annotation);

    context.declareModuleGlobal({ name: statement.name, type, isLocal: false, position: statement.position });
    context.declarations.declareGlobal({ name: statement.name, type, position: statement.position });
}

function checkStatement(context: CheckContext, statement: Statement): void {
    switch (statement.kind) {
        case 'local-statement':
            return checkLocal(context, statement);
        case 'assignment-statement':
            return checkAssignment(context, statement);
        case 'call-statement':
            checkExpression(context, statement.expression);

            return;
        case 'function-declaration':
            return checkFunctionDeclaration(context, statement);
        case 'return-statement':
            return checkReturn(context, statement);
        case 'do-statement':
            return checkBlock(context, statement.body);
        case 'while-statement':
            checkExpression(context, statement.condition);

            return checkBlock(context, statement.body);
        case 'repeat-statement':
            checkBlock(context, statement.body);
            checkExpression(context, statement.condition);

            return;
        case 'if-statement':
            return checkIf(context, statement.clauses, statement.alternate);
        case 'numeric-for-statement':
            return checkNumericFor(context, statement);
        case 'generic-for-statement':
            return checkGenericFor(context, statement);
        case 'type-alias-statement': {
            const resolved = context.resolveAnnotation(statement.annotation);
            const shape = statement.annotation.kind === 'type-object' || statement.annotation.kind === 'type-intersection';
            const named = shape ? renameRecord(resolved, statement.name) : resolved;

            context.noteTypeParameters(statement.typeParameters);
            context.binder.declareAlias(statement.name, named, statement.typeParameters);

            return;
        }
        case 'declare-statement':
            return checkDeclareStatement(context, statement);
        case 'class-declaration':
            return checkClassDeclaration(context, statement);
        case 'interface-declaration':
            return checkInterfaceDeclaration(context, statement);
        case 'enum-declaration':
            return checkEnumDeclaration(context, statement);
        default:
            return;
    }
}

export function checkStatements(context: CheckContext, statements: readonly Statement[]): void {
    let guards = 0;

    for (const statement of statements) {
        checkStatement(context, statement);

        const facts = guardFacts(context, statement);

        if (facts.size > 0) {
            context.pushNarrowing(facts);
            guards += 1;
        }
    }

    while (guards > 0) {
        context.popNarrowing();
        guards -= 1;
    }
}
