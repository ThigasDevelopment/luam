import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import { findExtension, type ExtensionResult } from '@compiler/extensions/native-extensions';
import type { CallExpression, Expression, MemberExpression, TableExpression, TemplateLiteral } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { checkEventUsage, checkGlobalReference } from './environment-checks';
import {
    checkNewExpression,
    checkSuperCall,
    NATIVE_CONSTRUCTOR,
    nativeConstructor,
    resolveLibraryMember,
    resolveNamedMember,
    resolveRecordMember,
} from './members';
import {
    isMtaClassReference,
    isMtaElement,
    resolveMtaConstructor,
    resolveMtaMember,
    resolveMtaStaticMember,
} from './oop-members';
import { checkBinary, checkUnary } from './operators';
import { buildFunctionType, checkFunctionBody } from './statements';
import { collectInterpolations } from './template';
import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createArray,
    createStringLiteral,
    createUnion,
    firstValueOf,
    isTableLike,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    valuesOf,
    type FunctionType,
    type Type,
} from './types';

const EXTENSION_RESULTS: Readonly<Record<ExtensionResult, Type>> = {
    boolean: BOOLEAN_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
};

function extensionType(receiver: Type, property: string): Type | null {
    const kind = receiver.kind === 'string-literal' ? 'string' : receiver.kind === 'string' || receiver.kind === 'number' ? receiver.kind : null;
    const target = kind ?? (isTableLike(receiver) ? 'table' : null);

    if (target === null) {
        return null;
    }

    const extension = findExtension(target, property);

    return extension === null ? null : EXTENSION_RESULTS[extension.result];
}

function isNativeConstruction(context: CheckContext, expression: MemberExpression): boolean {
    const object = expression.object;

    if (expression.property !== NATIVE_CONSTRUCTOR || object.kind !== 'identifier') {
        return false;
    }

    return nativeConstructor(context, object.name) !== null;
}

function checkMember(context: CheckContext, expression: MemberExpression): Type {
    if (expression.object.kind === 'identifier' && isMtaClassReference(context, expression.object.name)) {
        context.references.add(expression.object.name);

        return context.record(expression, resolveMtaStaticMember(context, expression.object.name, expression.property, expression.position)?.type ?? ANY_TYPE);
    }

    if (isNativeConstruction(context, expression) && expression.object.kind === 'identifier') {
        const name = expression.object.name;
        const message = `Construct "${name}" with "new ${name}(...)". The "${name}.new(...)" form is not part of the language.`;

        context.report('check-native-constructor', message, expression.position);
    }

    const library = resolveLibraryMember(context, expression);

    if (library !== null) {
        checkExpression(context, expression.object);

        return context.record(expression, library);
    }

    const objectType = checkExpression(context, expression.object);

    if (objectType.kind === 'record') {
        return context.record(expression, resolveRecordMember(context, objectType, expression));
    }

    const named = objectType.kind === 'named' ? resolveNamedMember(context, objectType.name, expression) : null;

    if (named !== null) {
        return context.record(expression, named);
    }

    const extension = extensionType(objectType, expression.property);

    return context.record(expression, extension ?? ANY_TYPE);
}

function countArguments(total: number): string {
    return total === 1 ? '1 argument' : `${total} arguments`;
}

export function checkSignature(
    context: CheckContext,
    args: readonly Expression[],
    argumentTypes: readonly Type[],
    signature: FunctionType,
    position: SourcePosition,
): Type {
    if (argumentTypes.length < signature.minimumArguments) {
        const message = `This call expects at least ${countArguments(signature.minimumArguments)} but received ${argumentTypes.length}.`;

        context.report('check-argument-count', message, position);
    }

    if (!signature.isVariadic && argumentTypes.length > signature.parameters.length) {
        const message = `This call expects at most ${countArguments(signature.parameters.length)} but received ${argumentTypes.length}.`;

        context.report('check-argument-count', message, position);
    }

    signature.parameters.forEach((parameter, index) => {
        const argumentType = argumentTypes[index];
        const argument = args[index];

        if (argumentType !== undefined && argument !== undefined) {
            context.expectAssignable(argumentType, parameter, argument.position, `Argument ${index + 1}`);
        }
    });

    return signature.returnType;
}

function checkArguments(context: CheckContext, expression: CallExpression, calleeType: Type): Type {
    const argumentTypes = checkValueList(context, expression.args);

    if (calleeType.kind !== 'function') {
        return ANY_TYPE;
    }

    return checkSignature(context, expression.args, argumentTypes, calleeType, expression.position);
}

function isSuperCall(expression: CallExpression): boolean {
    return expression.method === 'super' && expression.callee.kind === 'identifier' && expression.callee.name === 'self';
}

function checkMethodCall(context: CheckContext, expression: CallExpression, method: string, receiver: Type): Type {
    const argumentTypes = checkValueList(context, expression.args);

    if (receiver.kind !== 'named') {
        return ANY_TYPE;
    }

    const declared = context.declarations.lookupMember(receiver.name, method);

    if (declared?.type.kind === 'function') {
        return checkSignature(context, expression.args, argumentTypes, declared.type, expression.position);
    }

    if (!isMtaElement(context, receiver.name)) {
        return ANY_TYPE;
    }

    const member = resolveMtaMember(context, receiver.name, method, expression.position);

    if (member === null || member.type.kind !== 'function') {
        return ANY_TYPE;
    }

    return checkSignature(context, expression.args, argumentTypes, member.type, expression.position);
}

function checkCall(context: CheckContext, expression: CallExpression): Type {
    if (isSuperCall(expression)) {
        return context.record(expression, checkSuperCall(context, expression));
    }

    checkEventUsage(context, expression);

    if (expression.method === null && expression.callee.kind === 'identifier' && isMtaClassReference(context, expression.callee.name)) {
        context.references.add(expression.callee.name);

        const constructor = resolveMtaConstructor(context, expression.callee.name, expression.position);
        const argumentTypes = checkValueList(context, expression.args);

        return context.record(expression, constructor === null ? ANY_TYPE : checkSignature(context, expression.args, argumentTypes, constructor, expression.position));
    }

    const calleeType = checkExpression(context, expression.callee);

    if (expression.method !== null) {
        return context.record(expression, checkMethodCall(context, expression, expression.method, calleeType));
    }

    return context.record(expression, checkArguments(context, expression, calleeType));
}

function checkTable(context: CheckContext, expression: TableExpression): Type {
    const valueTypes = expression.fields.map((field) => {
        if (field.key !== null) {
            checkExpression(context, field.key);
        }

        return checkExpression(context, field.value);
    });

    const isArray = expression.fields.every((field) => field.key === null && field.name === null);

    if (!isArray || valueTypes.length === 0) {
        return context.record(expression, TABLE_TYPE);
    }

    return context.record(expression, createArray(createUnion(valueTypes)));
}

function checkTemplate(context: CheckContext, expression: TemplateLiteral): Type {
    for (const interpolation of collectInterpolations(expression.segments)) {
        if (interpolation.root.length === 0) {
            const message = 'Template interpolation is empty. Write "${name}", "${object.field}", or "${name:fallback}".';

            context.report('check-empty-interpolation', message, interpolation.position);

            continue;
        }

        if (context.binder.lookup(interpolation.root) === null) {
            const message = `Template interpolation "${interpolation.path}" refers to "${interpolation.root}", which is not in scope.`;

            context.report('check-unknown-template-root', message, interpolation.position);
        }
    }

    return context.record(expression, STRING_TYPE);
}

export function checkMultiValueExpression(context: CheckContext, expression: Expression): Type {
    switch (expression.kind) {
        case 'nil-literal':
            return context.record(expression, NIL_TYPE);
        case 'boolean-literal':
            return context.record(expression, BOOLEAN_TYPE);
        case 'number-literal':
            return context.record(expression, NUMBER_TYPE);
        case 'string-literal':
            return context.record(expression, createStringLiteral(expression.value));
        case 'template-literal':
            return checkTemplate(context, expression);
        case 'vararg-expression':
            return context.record(expression, ANY_TYPE);
        case 'identifier': {
            context.references.add(expression.name);

            const symbol = context.binder.lookup(expression.name);

            if (symbol === null) {
                checkGlobalReference(context, expression.name, expression.position);
            }

            return context.record(expression, symbol?.type ?? ANY_TYPE);
        }
        case 'member-expression':
            return checkMember(context, expression);
        case 'index-expression': {
            const objectType = checkExpression(context, expression.object);

            checkExpression(context, expression.index);

            return context.record(expression, objectType.kind === 'array' ? objectType.element : ANY_TYPE);
        }
        case 'call-expression':
            return checkCall(context, expression);
        case 'new-expression':
            return context.record(expression, checkNewExpression(context, expression));
        case 'table-expression':
            return checkTable(context, expression);
        case 'function-expression': {
            const type = buildFunctionType(context, expression.parameters, expression.returnAnnotation);

            checkFunctionBody(context, expression.parameters, expression.returnAnnotation, expression.body, type, null);

            return context.record(expression, type);
        }
        case 'binary-expression': {
            const left = checkExpression(context, expression.left);
            const right = checkExpression(context, expression.right);

            return checkBinary(context, expression.operator, left, right, expression);
        }
        case 'unary-expression':
            return checkUnary(context, expression.operator, checkExpression(context, expression.operand), expression);
        default:
            return context.record(expression, checkExpression(context, expression.expression));
    }
}

export function checkExpression(context: CheckContext, expression: Expression): Type {
    return firstValueOf(checkMultiValueExpression(context, expression));
}

export function checkValueList(context: CheckContext, values: readonly Expression[]): Type[] {
    const types: Type[] = [];

    values.forEach((value, index) => {
        const type = checkMultiValueExpression(context, value);

        if (index === values.length - 1) {
            types.push(...valuesOf(type));

            return;
        }

        types.push(firstValueOf(type));
    });

    return types;
}
