import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { ExtensionResult } from '@compiler/extensions/native-extensions';
import type { CallExpression, Expression, IndexExpression, MemberExpression, TableExpression, TemplateLiteral, TypeAnnotation } from '@compiler/parser/ast';

import { pathOf } from './access-path';
import { extensionFor, reportExtensionForm, reportNotCallable } from './callable';
import type { CheckContext } from './context';
import { contextualFunction } from './contextual-function';
import { checkEventUsage, checkGlobalReference, checkSharedReference } from './environment-checks';
import { specializeEventCall } from './event-calls';
import { specializeCall } from './generic-call';
import { memberOf } from './generic-class';
import { resolveNonNominalMethod, withoutSelfParameter } from './method-receiver';
import { escapesRecordObligation } from './record-completion';
import { checkResourceCall } from './resource-exports';
import {
    checkNewExpression,
    checkSuperCall,
    isUserClassReference,
    resolveStaticMember,
    NATIVE_CONSTRUCTOR,
    nativeConstructor,
    resolveLibraryMember,
    reportUnknownMethod,
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
import { applyTypeParameters, buildFunctionType, checkFunctionBody } from './statements';
import { collectInterpolations } from './template';
import { resolveUnionMember } from './union-members';
import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createArray,
    createBooleanLiteral,
    createLiteralRecord,
    createNumberLiteral,
    createOptional,
    createStringLiteral,
    createUnion,
    firstValueOf,
    isAssignable,
    isTableLike,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    valuesOf,
    type FunctionType,
    type Type,
} from './types';

const NAME_PATH_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;

const EXTENSION_RESULTS: Readonly<Record<ExtensionResult, Type>> = {
    boolean: BOOLEAN_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
};

function isNativeConstruction(context: CheckContext, expression: MemberExpression): boolean {
    const object = expression.object;

    if (expression.property !== NATIVE_CONSTRUCTOR || object.kind !== 'identifier') {
        return false;
    }

    return nativeConstructor(context, object.name) !== null;
}

function narrowedMember(context: CheckContext, expression: MemberExpression): Type | null {
    const path = pathOf(expression);

    return path === null ? null : context.narrowedType(path);
}

function checkMember(context: CheckContext, expression: MemberExpression): Type {
    const narrowed = narrowedMember(context, expression);

    if (narrowed !== null) {
        checkExpression(context, expression.object);

        return context.record(expression, narrowed);
    }

    if (expression.object.kind === 'identifier' && isUserClassReference(context, expression.object.name)) {
        context.references.add(expression.object.name);

        return context.record(expression, resolveStaticMember(context, expression.object.name, expression));
    }

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

    const received = checkExpression(context, expression.object);

    const objectType = received.kind === 'optional' ? received.element : received;

    if (objectType.kind === 'record') {
        return context.record(expression, resolveRecordMember(context, objectType, expression));
    }

    if (objectType.kind === 'union') {
        const option = resolveUnionMember(context, objectType, expression);

        if (option !== null) {
            return context.record(expression, option);
        }
    }

    if (objectType.kind === 'map' && isAssignable(STRING_TYPE, objectType.key)) {
        return context.record(expression, objectType.value);
    }

    const named = objectType.kind === 'named' ? resolveNamedMember(context, objectType, expression) : null;

    if (named !== null) {
        return context.record(expression, named);
    }

    const extension = extensionFor(objectType, expression.property);

    if (extension !== null) {
        reportExtensionForm(context, expression, extension);
    }

    return context.record(expression, extension === null ? ANY_TYPE : EXTENSION_RESULTS[extension.result]);
}

function spreadsUnknownArity(args: readonly Expression[], argumentTypes: readonly Type[]): boolean {
    if (args.length === 0 || args.length !== argumentTypes.length) {
        return false;
    }

    return args[args.length - 1]?.kind === 'call-expression' && argumentTypes[argumentTypes.length - 1]?.kind === 'any';
}

function resolveKeyedMember(context: CheckContext, objectType: Type, expression: IndexExpression): Type | null {
    if (expression.index.kind !== 'string-literal' || (objectType.kind !== 'record' && objectType.kind !== 'named')) {
        return null;
    }

    const access: MemberExpression = { kind: 'member-expression', object: expression.object, property: expression.index.value, position: expression.index.position };

    return objectType.kind === 'record' ? resolveRecordMember(context, objectType, access) : resolveNamedMember(context, objectType, access);
}

function countArguments(total: number): string {
    return total === 1 ? '1 argument' : `${total} arguments`;
}

export function checkSignature(
    context: CheckContext,
    args: readonly Expression[],
    declared: FunctionType,
    position: SourcePosition,
    owner = 'This call',
    typeArguments: readonly TypeAnnotation[] = [],
): Type {
    const argumentTypes = checkValueList(context, args, declared.parameters);
    const signature = specializeCall(context, owner, declared, argumentTypes, typeArguments, position);

    const spreads = spreadsUnknownArity(args, argumentTypes);
    const fixed = spreads ? argumentTypes.length - 1 : argumentTypes.length;

    if (!spreads && argumentTypes.length < signature.minimumArguments) {
        const message = `This call expects at least ${countArguments(signature.minimumArguments)} but received ${argumentTypes.length}.`;

        context.report('check-argument-count', message, position);
    }

    if (!signature.isVariadic && fixed > signature.parameters.length) {
        const message = `This call expects at most ${countArguments(signature.parameters.length)} but received ${argumentTypes.length}.`;

        context.report('check-argument-count', message, position);
    }

    signature.parameters.forEach((parameter, index) => {
        const argumentType = argumentTypes[index];
        const argument = args[index];

        if (argumentType === undefined || argument === undefined) {
            return;
        }

        const optional = index >= signature.minimumArguments && parameter.kind !== 'optional';
        const expected = optional ? createOptional(parameter) : parameter;

        context.expectAssignable(argumentType, expected, argument.position, `Argument ${index + 1}`, parameter);
    });

    if (signature.isVariadic && signature.variadicType !== undefined) {
        for (let index = signature.parameters.length; index < argumentTypes.length; index += 1) {
            const argumentType = argumentTypes[index];
            const argument = args[Math.min(index, args.length - 1)];

            if (argumentType !== undefined && argument !== undefined) {
                context.expectAssignable(argumentType, signature.variadicType, argument.position, `Argument ${index + 1}`);
            }
        }
    }

    return signature.returnType;
}

function reportClassReceiver(context: CheckContext, name: string, method: string, position: SourcePosition): void {
    if (context.declarations.lookupStaticMember(name, method) !== null) {
        const message = `Call the static member "${method}" as "${name}.${method}(...)". A class value has no "self" to pass.`;

        context.report('check-static-receiver', message, position);

        return;
    }

    if (context.declarations.lookupMember(name, method) === null) {
        const message = `Call the static member "${method}" as "${name}.${method}(...)". A class value has no "self" to pass.`;

        context.report('check-static-receiver', message, position);

        return;
    }

    const message =
        `The receiver here is the class "${name}" itself, and "${method}" is one of its instance members. ` +
        `Create an instance — "local value = new ${name}()" — and call "value:${method}(...)", or read the member from a value of that class. ` +
        `Where the class and its single instance share one name, give the instance its own name.`;

    context.report('check-class-receiver', message, position);
}

function callOwner(expression: CallExpression): string {
    const name = expression.method ?? (expression.callee.kind === 'identifier' ? expression.callee.name : null);

    return name === null ? 'This call' : `Function "${name}"`;
}

function checkArguments(context: CheckContext, expression: CallExpression, calleeType: Type): Type {
    if (calleeType.kind !== 'function') {
        checkValueList(context, expression.args);
        reportNotCallable(context, expression, calleeType);

        return ANY_TYPE;
    }

    return checkSignature(context, expression.args, calleeType, expression.position, callOwner(expression), expression.typeArguments);
}

function isSuperCall(expression: CallExpression): boolean {
    return expression.method === null && expression.callee.kind === 'identifier' && expression.callee.name === 'super';
}

function isLegacySuperCall(expression: CallExpression): boolean {
    return expression.method === 'super' && expression.callee.kind === 'identifier' && expression.callee.name === 'self';
}

function checkMethodCall(context: CheckContext, expression: CallExpression, method: string, receiver: Type): Type {
    if (receiver.kind !== 'named') {
        const signature = resolveNonNominalMethod(receiver, method);

        if (signature === null) {
            checkValueList(context, expression.args);

            return ANY_TYPE;
        }

        return checkSignature(context, expression.args, withoutSelfParameter(signature), expression.position, callOwner(expression), expression.typeArguments);
    }

    const declared = memberOf(context, receiver, method);

    if (declared?.type.kind === 'function') {
        if (declared.deprecated === true) {
            context.warn('check-deprecated-use', `Member "${method}" is deprecated.`, expression.position);
        }

        return checkSignature(context, expression.args, declared.type, expression.position, callOwner(expression), expression.typeArguments);
    }

    if (!isMtaElement(context, receiver.name)) {
        if (declared === null) {
            reportUnknownMethod(context, receiver, expression.callee, method, expression.position);
        }

        checkValueList(context, expression.args);

        return ANY_TYPE;
    }

    const member = resolveMtaMember(context, receiver.name, method, expression.position);

    if (member === null || member.type.kind !== 'function') {
        checkValueList(context, expression.args);

        return ANY_TYPE;
    }

    return checkSignature(context, expression.args, member.type, expression.position);
}

function checkCall(context: CheckContext, expression: CallExpression): Type {
    const contracted = checkResourceCall(context, expression);

    if (contracted !== null) {
        return context.record(expression, contracted);
    }

    if (isLegacySuperCall(expression)) {
        checkValueList(context, expression.args);
        context.report('check-invalid-super', 'Call "super(...)" directly instead of "self:super(...)".', expression.position);

        return context.record(expression, ANY_TYPE);
    }

    if (isSuperCall(expression)) {
        return context.record(expression, checkSuperCall(context, expression));
    }

    if (expression.method === null && expression.callee.kind === 'identifier' && isMtaClassReference(context, expression.callee.name)) {
        context.references.add(expression.callee.name);

        const constructor = resolveMtaConstructor(context, expression.callee.name, expression.position);

        if (constructor === null) {
            checkValueList(context, expression.args);

            return context.record(expression, ANY_TYPE);
        }

        return context.record(expression, checkSignature(context, expression.args, constructor, expression.position));
    }

    if (expression.method !== null && expression.callee.kind === 'identifier' && isUserClassReference(context, expression.callee.name)) {
        reportClassReceiver(context, expression.callee.name, expression.method, expression.position);
        checkValueList(context, expression.args);

        return context.record(expression, ANY_TYPE);
    }

    if (expression.method === null) {
        context.calledMembers.add(expression.callee);
    }

    const calleeType = checkExpression(context, expression.callee);

    if (expression.method !== null) {
        return context.record(expression, checkMethodCall(context, expression, expression.method, calleeType));
    }

    if (expression.callee.kind === 'identifier' && context.binder.isBuiltinReference(expression.callee.name)) {
        checkEventUsage(context, expression);

        const specialized = specializeEventCall(context, expression, calleeType);

        return context.record(expression, checkArguments(context, expression, specialized ?? calleeType));
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

    const isRecord = expression.fields.every((field) => field.name !== null);

    if (isRecord) {
        const members = new Map<string, Type>();

        expression.fields.forEach((field, index) => {
            if (field.name !== null) {
                members.set(field.name, valueTypes[index] ?? ANY_TYPE);
            }
        });

        return context.record(expression, createLiteralRecord(members));
    }

    const isArray = expression.fields.every((field) => field.key === null && field.name === null);

    if (!isArray) {
        return context.record(expression, TABLE_TYPE);
    }

    return context.record(expression, createArray(createUnion(valueTypes)));
}

function checkTemplate(context: CheckContext, expression: TemplateLiteral): Type {
    for (const interpolation of collectInterpolations(expression.segments)) {
        if (interpolation.path.length === 0) {
            const message = 'Template interpolation is empty. Write "${name}", "${object.field}", or "${name:fallback}".';

            context.report('check-empty-interpolation', message, interpolation.position);

            continue;
        }

        if (!NAME_PATH_PATTERN.test(interpolation.path)) {
            const message = `Template interpolation "${interpolation.path}" is not a name or a member path. Compute the value first, then interpolate the name.`;

            context.report('check-unknown-template-root', message, interpolation.position);

            continue;
        }

        if (interpolation.fallback === null && context.binder.lookup(interpolation.root) === null) {
            const message = `Template interpolation "${interpolation.path}" refers to "${interpolation.root}", which is not in scope. Write "\${${interpolation.path}:fallback}" to accept a value that may be missing.`;

            context.report('check-unknown-template-root', message, interpolation.position);
        }
    }

    return context.record(expression, STRING_TYPE);
}

export function checkMultiValueExpression(context: CheckContext, expression: Expression, expected: Type | null = null): Type {
    switch (expression.kind) {
        case 'nil-literal':
            return context.record(expression, NIL_TYPE);
        case 'boolean-literal':
            return context.record(expression, createBooleanLiteral(expression.value));
        case 'number-literal':
            return context.record(expression, createNumberLiteral(expression.value));
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
            } else {
                checkSharedReference(context, expression.name, expression.position);
            }

            if (symbol === null || symbol.isLocal !== true) {
                context.noteGlobalReference(expression.name);
            }

            return context.record(expression, context.narrowedType(expression.name) ?? symbol?.type ?? ANY_TYPE);
        }
        case 'member-expression':
            return checkMember(context, expression);
        case 'index-expression': {
            const objectType = checkExpression(context, expression.object);
            const indexType = checkExpression(context, expression.index);

            if (objectType.kind === 'map') {
                context.expectAssignable(indexType, objectType.key, expression.index.position, 'Key');

                return context.record(expression, objectType.value);
            }

            const keyed = resolveKeyedMember(context, objectType, expression);

            if (keyed !== null) {
                return context.record(expression, keyed);
            }

            return context.record(expression, objectType.kind === 'array' ? objectType.element : ANY_TYPE);
        }
        case 'call-expression':
            return checkCall(context, expression);
        case 'new-expression':
            return context.record(expression, checkNewExpression(context, expression));
        case 'table-expression':
            return checkTable(context, expression);
        case 'function-expression': {
            const built = buildFunctionType(context, expression.parameters, expression.returnAnnotation, contextualFunction(expected));
            const type = applyTypeParameters(context, built, expression.typeParameters, expression.typeConstraints);

            checkFunctionBody(context, expression.parameters, expression.returnAnnotation, expression.body, type, null, expression.position);

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
            return context.record(expression, checkExpression(context, expression.expression, expected));
    }
}

export function checkExpression(context: CheckContext, expression: Expression, expected: Type | null = null): Type {
    return firstValueOf(checkMultiValueExpression(context, expression, expected));
}

export function checkValueList(context: CheckContext, values: readonly Expression[], expected: readonly Type[] = []): Type[] {
    const types: Type[] = [];

    values.forEach((value, index) => {
        const type = checkMultiValueExpression(context, value, expected[index] ?? null);

        escapesRecordObligation(context, value);

        if (index === values.length - 1) {
            types.push(...valuesOf(type));

            return;
        }

        types.push(firstValueOf(type));
    });

    return types;
}
