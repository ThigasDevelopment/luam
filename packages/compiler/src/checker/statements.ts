import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type {
    AssignmentStatement,
    DeclareStatement,
    Expression,
    FunctionDeclaration,
    GlobalStatement,
    LocalStatement,
    Parameter,
    ReturnStatement,
    Statement,
    TypeAnnotation,
} from '@compiler/parser/ast';

import { assignedPath, forgetAssignedPaths, pathOf } from './access-path';
import { asyncInnerAnnotation, promiseOf, reportAsyncAnnotation } from './async';
import { deferRecordCompletion, dischargeRecordKey, extendInferredRecord, settleRecordObligations } from './record-completion';
import { reportImplicitGlobal, reportShadowedGlobal, reportShadowedHelper } from './shadowing';
import { checkClassDeclaration, checkEnumDeclaration, checkInterfaceDeclaration } from './classes';
import type { CheckContext, FunctionFrame } from './context';
import { checkBlock, checkGenericFor, checkIf, checkNumericFor, checkRepeat, checkWhile } from './control-flow';
import { checkExpression, checkValueList } from './expressions';
import { checkEventDeclaration } from './events';
import { assignmentFact, cloneFlow } from './flow';
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

export function buildFunctionType(
    context: CheckContext,
    parameters: readonly Parameter[],
    returnAnnotation: TypeAnnotation | null,
    contextual: FunctionType | null = null,
    isAsync = false,
): FunctionType {
    const isVariadic = parameters.some((parameter) => parameter.isVararg);
    const named = parameters.filter((parameter) => !parameter.isVararg);
    const types = named.map((parameter, index) =>
        parameter.annotation === null ? (contextual?.parameters[index] ?? ANY_TYPE) : context.resolveValueAnnotation(parameter.annotation, 'a parameter'),
    );
    const names = named.map((parameter) => parameter.name);

    reportAsyncAnnotation(context, isAsync, returnAnnotation);

    const declared = context.resolveAnnotation(asyncInnerAnnotation(isAsync, returnAnnotation));
    const returnType = isAsync ? promiseOf(declared) : declared;

    return createFunction(types, returnType, minimumArguments(context, parameters), isVariadic, names);
}

export function applyTypeParameters(
    context: CheckContext,
    type: FunctionType,
    names: readonly string[],
    constraints: readonly (TypeAnnotation | null)[],
): FunctionType {
    if (names.length === 0) {
        return type;
    }

    context.noteTypeParameters(names);

    type.typeParameters = [...names];
    type.typeConstraints = names.map((unused, index) => {
        const constraint = constraints[index];

        return constraint === undefined || constraint === null ? null : context.resolveAnnotation(constraint);
    });

    return type;
}

const FALLTHROUGH_KINDS: ReadonlySet<Type['kind']> = new Set(['any', 'void', 'nil', 'optional', 'unknown']);

function toleratesFallthrough(declared: Type): boolean {
    if (FALLTHROUGH_KINDS.has(declared.kind)) {
        return true;
    }

    return declared.kind === 'union' && declared.options.some((option) => option.kind === 'nil');
}

function reportMissingReturn(context: CheckContext, declared: Type, position: SourcePosition): void {
    const name = typeToString(declared);
    const repair = declared.kind === 'tuple' ? 'Add a return on every path.' : `Add a return on every path, or declare "${name}?".`;

    context.report('check-missing-return', `This function declares "${name}" but can end without returning a value. ${repair}`, position);
}

export function checkFunctionBody(
    context: CheckContext,
    parameters: readonly Parameter[],
    returnAnnotation: TypeAnnotation | null,
    body: readonly Statement[],
    signature: FunctionType,
    selfType: Type | null,
    position: SourcePosition = ORIGIN,
    frame: FunctionFrame = { isAsync: false, isExpression: false },
): void {
    forgetAssignedPaths(context, body);

    const entry = context.flowState;
    const annotation = asyncInnerAnnotation(frame.isAsync, returnAnnotation);

    context.setFlow(cloneFlow(entry));
    context.binder.pushScope();
    context.pushFunctionFrame(frame);
    context.pushReturnType(annotation === null ? null : context.resolveAnnotation(annotation));

    if (selfType !== null) {
        context.binder.declare({ name: 'self', type: selfType, isLocal: true, position: ORIGIN });
    }

    let parameterIndex = 0;

    for (const parameter of parameters) {
        const type = parameter.isVararg ? ANY_TYPE : (signature.parameters[parameterIndex] ?? ANY_TYPE);

        context.binder.declare({ name: parameter.name, type, isLocal: true, position: parameter.position, origin: 'parameter' });

        if (!parameter.isVararg) {
            parameterIndex += 1;
        }
    }

    const opened = new Set(context.recordObligationPaths());

    context.blockDepth += 1;
    checkStatements(context, body);
    context.blockDepth -= 1;
    settleRecordObligations(context, opened);

    const declared = context.currentReturnType();

    if (declared !== null && context.flowState.reachable && !toleratesFallthrough(declared)) {
        reportMissingReturn(context, declared, position);
    }

    const inferred = context.popReturnType();

    if (annotation === null) {
        signature.returnType = frame.isAsync ? promiseOf(inferred) : inferred;
    }

    context.popFunctionFrame();
    context.binder.popScope();
    context.setFlow(entry);
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

        const declared = context.resolveValueAnnotation(declaration.annotation, 'a local');
        const subject = `Variable "${declaration.name}"`;
        const deferred = value !== undefined && deferRecordCompletion(context, { kind: 'identifier', name: declaration.name, position: declaration.position }, valueType, declared, subject, value.position);

        if (value !== undefined && !deferred) {
            context.expectAssignable(valueType, declared, value.position, subject);
        }

        context.binder.declare({ name: declaration.name, type: declared, isLocal: true, position: declaration.position, origin: 'local' });

        if (value !== undefined) {
            recordAssignedFact(context, declaration.name, valueType, declared);
        }
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

const DELETABLE_CONTAINERS = new Set(['map', 'array', 'table']);

function deletesContainerKey(context: CheckContext, target: Expression, valueType: Type): boolean {
    if (valueType.kind !== 'nil' || (target.kind !== 'index-expression' && target.kind !== 'member-expression')) {
        return false;
    }

    return DELETABLE_CONTAINERS.has(context.typeOf(target.object).kind);
}

function recordAssignedFact(context: CheckContext, path: string | null, valueType: Type, declared: Type): void {
    if (path === null || valueType.kind === 'any') {
        return;
    }

    const fact = assignmentFact(widenInferred(valueType), declared);

    if (fact !== null) {
        context.applyFlowFacts(new Map([[path, fact]]));
    }
}

function checkAssignment(context: CheckContext, statement: AssignmentStatement): void {
    const valueTypes = checkValueList(context, statement.values);

    statement.targets.forEach((target, index) => {
        const assigned = assignedPath(target);

        if (assigned !== null) {
            context.forgetNarrowing(assigned);
        }

        const valueType = valueTypes[index] ?? NIL_TYPE;
        const value = valueAt(statement.values, valueTypes, index);

        if (value !== undefined && extendInferredRecord(context, target, valueType)) {
            return;
        }

        const targetType = checkExpression(context, target);

        if (target.kind === 'member-expression') {
            const object = context.typeOf(target.object);
            const frame = context.currentClassMethod();

            if (object.kind === 'named') {
                const member = context.declarations.lookupMember(object.name, target.property);

                if (member?.readOnly === true && (frame === null || frame.className !== object.name)) {
                    context.report('check-readonly-assignment', `Field "${target.property}" is read-only outside class "${object.name}".`, target.position);
                }
            }
        }

        if (statement.operator !== '=') {
            checkCompoundOperand(context, statement.operator, targetType, target.position);

            if (statement.values.length > 0) {
                checkCompoundOperand(context, statement.operator, valueType, value?.position ?? target.position);
            }

            return;
        }

        if (target.kind === 'identifier' && context.binder.lookup(target.name) === null) {
            reportImplicitGlobal(context, target.name, target.position);
            context.declareModuleGlobal({ name: target.name, type: valueType, isLocal: false, position: target.position });

            return;
        }

        if (!context.insideFunction()) {
            reportShadowedAssignment(context, target);
        }

        const declared = target.kind === 'identifier' ? (context.binder.lookup(target.name)?.type ?? targetType) : targetType;

        if (deletesContainerKey(context, target, valueType)) {
            return;
        }

        if (value !== undefined && dischargeRecordKey(context, target, valueType, value.position)) {
            return;
        }

        const path = pathOf(target);

        if (path !== null) {
            context.closeRecordObligation(path);
        }

        if (value !== undefined && deferRecordCompletion(context, target, valueType, declared, 'Assignment', value.position)) {
            return;
        }

        if (value !== undefined) {
            context.expectAssignable(valueType, declared, value.position, 'Assignment');
        }

        recordAssignedFact(context, pathOf(target), valueType, declared);
    });
}

function rootIdentifier(expression: Expression): string | null {
    if (expression.kind === 'identifier') {
        return expression.name;
    }

    return expression.kind === 'member-expression' || expression.kind === 'index-expression' ? rootIdentifier(expression.object) : null;
}

function reportShadowedAssignment(context: CheckContext, target: Expression): void {
    if (target.kind !== 'identifier') {
        const root = rootIdentifier(target);

        if (root !== null && context.binder.lookup(root) === null) {
            reportImplicitGlobal(context, root, target.position);
        }
    }

    if (target.kind === 'identifier') {
        reportShadowedGlobal(context, target.name, target.position);

        return;
    }

    if (target.kind === 'member-expression' && target.object.kind === 'identifier') {
        reportShadowedHelper(context, target.object.name, target.property, target.position);
    }
}

function checkFunctionDeclaration(context: CheckContext, statement: FunctionDeclaration): void {
    const built = buildFunctionType(context, statement.parameters, statement.returnAnnotation, null, statement.isAsync);
    const type = applyTypeParameters(context, built, statement.typeParameters, statement.typeConstraints);

    if (statement.name.kind === 'identifier') {
        const symbol = { name: statement.name.name, type, isLocal: statement.isLocal, position: statement.position };

        if (statement.isLocal) {
            context.binder.declare({ ...symbol, origin: 'local' });
        } else {
            reportShadowedGlobal(context, statement.name.name, statement.position);
            context.declareModuleGlobal(symbol);
        }
    }

    if (!statement.isLocal && statement.name.kind !== 'identifier') {
        reportShadowedAssignment(context, statement.name);
    }

    context.record(statement.name, type);
    checkFunctionBody(context, statement.parameters, statement.returnAnnotation, statement.body, type, statement.isMethod ? ANY_TYPE : null, statement.position, {
        isAsync: statement.isAsync,
        isExpression: false,
    });
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
    context.declarations.declareGlobal({ name: statement.name, type, isDeclared: true, position: statement.position });
}

function checkGlobalStatement(context: CheckContext, statement: GlobalStatement): void {
    const declaration = statement.declaration;
    const declared = declaration.annotation === null ? ANY_TYPE : context.resolveValueAnnotation(declaration.annotation, 'a global');
    const valueTypes = checkValueList(context, statement.values);
    const value = valueAt(statement.values, valueTypes, 0);

    if (context.insideFunction()) {
        const message = `A type on global "${declaration.name}" is only valid at the top level of a file. Assign it without the annotation here.`;

        context.report('check-global-annotation-scope', message, statement.position);

        return;
    }

    const existing = context.declarations.lookupGlobal(declaration.name);
    const contract = existing !== null && existing.isDeclared === true ? existing.type : declared;

    if (existing !== null && existing.isDeclared !== true) {
        context.report('check-duplicate-global', `Global "${declaration.name}" is already declared with a type.`, statement.position);
    }

    if (value !== undefined) {
        context.expectAssignable(valueTypes[0] ?? NIL_TYPE, contract, value.position, `Global "${declaration.name}"`);
    }

    context.forgetNarrowing(declaration.name);
    context.declareModuleGlobal({ name: declaration.name, type: contract, isLocal: false, position: declaration.position });

    if (existing === null) {
        context.declarations.declareGlobal({ name: declaration.name, type: contract, position: declaration.position });
    }

    if (value !== undefined) {
        recordAssignedFact(context, declaration.name, valueTypes[0] ?? NIL_TYPE, contract);
    }
}

function checkStatement(context: CheckContext, statement: Statement): void {
    switch (statement.kind) {
        case 'local-statement':
            return checkLocal(context, statement);
        case 'assignment-statement':
            return checkAssignment(context, statement);
        case 'global-statement':
            return checkGlobalStatement(context, statement);
        case 'call-statement':
            checkExpression(context, statement.expression);

            return;
        case 'function-declaration':
            return checkFunctionDeclaration(context, statement);
        case 'return-statement':
            checkReturn(context, statement);
            context.markUnreachable();

            return;
        case 'break-statement':
        case 'continue-statement':
            context.markUnreachable();

            return;
        case 'do-statement':
            return checkBlock(context, statement.body);
        case 'while-statement':
            return checkWhile(context, statement);
        case 'repeat-statement':
            return checkRepeat(context, statement);
        case 'if-statement':
            return checkIf(context, statement.clauses, statement.alternate);
        case 'numeric-for-statement':
            return checkNumericFor(context, statement);
        case 'generic-for-statement':
            return checkGenericFor(context, statement);
        case 'type-alias-statement': {
            const resolved = context.resolveValueAnnotation(statement.annotation, 'a type alias');
            const shape = statement.annotation.kind === 'type-object' || statement.annotation.kind === 'type-intersection';
            const named = shape ? renameRecord(resolved, statement.name) : resolved;

            if (context.isAmbientAlias(statement.name)) {
                context.report('check-duplicate-type', `Type "${statement.name}" is already defined.`, statement.position);
            }

            context.noteTypeParameters(statement.typeParameters);
            context.binder.declareAlias(statement.name, named, statement.typeParameters);
            context.declarations.declareAlias({ name: statement.name, typeParameters: statement.typeParameters, type: named, position: statement.position });

            return;
        }
        case 'declare-statement':
            return checkDeclareStatement(context, statement);
        case 'event-declaration':
            return checkEventDeclaration(context, statement);
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
    for (const statement of statements) {
        checkStatement(context, statement);
    }
}
