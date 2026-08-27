import type { TemplateSegment } from '@compiler/lexer/token';
import type { BinaryExpression, CallExpression, Expression, MemberExpression, Parameter, Statement, TableExpression } from '@compiler/parser/ast';
import { binaryPrecedence, isRightAssociative, UNARY_PRECEDENCE } from '@compiler/parser/precedence';

import { emitBlock } from './emitter';
import { escapeStringLiteral } from './escape';
import { resolveCallExtension, resolvePropertyExtension } from './extensions';
import { indentLine, requireHelper, typeOf, type EmitState } from './state';
import { lowerTemplate, templateContext } from './template';

export function emitString(value: string): string {
    return `'${escapeStringLiteral(value)}'`;
}

function emitParameters(parameters: readonly Parameter[]): string {
    return parameters.map((parameter) => (parameter.isVararg ? '...' : parameter.name)).join(', ');
}

export function emitFunctionBody(state: EmitState, parameters: readonly Parameter[], body: readonly Statement[], header: string): string {
    const previous = state.loopWrap;

    state.indent += 1;
    state.loopWrap = false;

    const lines = emitBlock(state, body);

    state.loopWrap = previous;
    state.indent -= 1;

    const signature = `${header}(${emitParameters(parameters)})`;
    const closing = indentLine(state, 'end');

    return lines.length === 0 ? `${signature}\n${closing}` : `${signature}\n${lines.join('\n')}\n${closing}`;
}

function emitTable(state: EmitState, expression: TableExpression): string {
    if (expression.fields.length === 0) {
        return '{}';
    }

    const fields = expression.fields.map((field) => {
        const value = emitExpression(state, field.value);

        if (field.name !== null) {
            return `${field.name} = ${value}`;
        }

        if (field.key !== null) {
            return `[${emitExpression(state, field.key)}] = ${value}`;
        }

        return value;
    });

    return `{ ${fields.join(', ')} }`;
}

function emitMember(state: EmitState, expression: MemberExpression): string {
    const extension = resolvePropertyExtension(typeOf(state, expression.object), expression.property);
    const object = emitExpression(state, expression.object, UNARY_PRECEDENCE);

    if (extension === null) {
        return `${object}.${expression.property}`;
    }

    requireHelper(state, extension.helper);

    return `${extension.target}(${object})`;
}

function emitCall(state: EmitState, expression: CallExpression): string {
    const args = expression.args.map((argument) => emitExpression(state, argument));

    if (expression.method === null && expression.callee.kind === 'identifier' && expression.callee.name === 'super') {
        return `self:super(${args.join(', ')})`;
    }

    if (expression.method !== null) {
        return `${emitExpression(state, expression.callee, UNARY_PRECEDENCE)}:${expression.method}(${args.join(', ')})`;
    }

    if (expression.callee.kind === 'member-expression') {
        const extension = resolveCallExtension(typeOf(state, expression.callee.object), expression.callee.property);

        if (extension !== null) {
            requireHelper(state, extension.helper);

            const receiver = emitExpression(state, expression.callee.object, UNARY_PRECEDENCE);

            return `${extension.target}(${[receiver, ...args].join(', ')})`;
        }
    }

    return `${emitExpression(state, expression.callee, UNARY_PRECEDENCE)}(${args.join(', ')})`;
}

function emitTemplate(state: EmitState, segments: readonly TemplateSegment[]): string {
    const lowered = lowerTemplate(segments);

    if (!lowered.isInterpolated) {
        return emitString(lowered.literal);
    }

    requireHelper(state, 'string');

    return `string.template(${emitString(lowered.literal)}, ${templateContext(lowered.bindings)})`;
}

function emitBinary(state: EmitState, expression: BinaryExpression, limit: number): string {
    const precedence = binaryPrecedence(expression.operator);
    const rightLimit = isRightAssociative(expression.operator) ? precedence : precedence + 1;
    const left = emitExpression(state, expression.left, precedence);
    const right = emitExpression(state, expression.right, rightLimit);
    const text = `${left} ${expression.operator} ${right}`;

    return precedence < limit ? `(${text})` : text;
}

export function emitExpression(state: EmitState, expression: Expression, limit = 0): string {
    switch (expression.kind) {
        case 'nil-literal':
            return 'nil';
        case 'boolean-literal':
            return expression.value ? 'true' : 'false';
        case 'number-literal':
            return expression.raw;
        case 'string-literal':
            return emitString(expression.value);
        case 'template-literal':
            return emitTemplate(state, expression.segments);
        case 'vararg-expression':
            return '...';
        case 'identifier':
            return expression.name;
        case 'member-expression':
            return emitMember(state, expression);
        case 'index-expression':
            return `${emitExpression(state, expression.object, UNARY_PRECEDENCE)}[${emitExpression(state, expression.index)}]`;
        case 'call-expression':
            return emitCall(state, expression);
        case 'new-expression': {
            const args = expression.args.map((argument) => emitExpression(state, argument));

            if (typeOf(state, expression)?.kind === 'record') {
                return `${expression.className}.new(${args.join(', ')})`;
            }

            requireHelper(state, 'class');

            return `new ${emitString(expression.className)} (${args.join(', ')})`;
        }
        case 'table-expression':
            return emitTable(state, expression);
        case 'function-expression':
            return emitFunctionBody(state, expression.parameters, expression.body, 'function');
        case 'binary-expression':
            return emitBinary(state, expression, limit);
        case 'unary-expression': {
            const operand = emitExpression(state, expression.operand, UNARY_PRECEDENCE);
            const text = expression.operator === 'not' ? `not ${operand}` : `${expression.operator}${operand}`;

            return UNARY_PRECEDENCE < limit ? `(${text})` : text;
        }
        default:
            return `(${emitExpression(state, expression.expression)})`;
    }
}
