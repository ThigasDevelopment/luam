import { collectInterpolations } from '@compiler/checker/template';
import type { CallExpression, Expression, MemberExpression, TypeAnnotation } from '@compiler/parser/ast';
import type { NewExpression } from '@compiler/parser/declaration-nodes';

import { positionAt } from '@lsp/support/source-text';

import { addReference, locatePosition, receiverName, type BlockContext, type CollectorState } from './collector-state';

export function collectAnnotation(state: CollectorState, block: BlockContext, annotation: TypeAnnotation | null): void {
    if (annotation === null) {
        return;
    }

    if (annotation.kind === 'type-name') {
        addReference(state, annotation.name, 'type', annotation.position, block.scopeId);

        for (const argument of annotation.typeArguments) {
            collectAnnotation(state, block, argument);
        }

        return;
    }

    if (annotation.kind === 'type-string-literal' || annotation.kind === 'type-boolean-literal' || annotation.kind === 'type-number-literal') {
        return;
    }

    if (annotation.kind === 'type-array' || annotation.kind === 'type-optional') {
        collectAnnotation(state, block, annotation.element);

        return;
    }

    if (annotation.kind === 'type-union') {
        for (const option of annotation.options) {
            collectAnnotation(state, block, option);
        }

        return;
    }

    if (annotation.kind === 'type-intersection') {
        for (const part of annotation.parts) {
            collectAnnotation(state, block, part);
        }

        return;
    }

    if (annotation.kind === 'type-object') {
        for (const member of annotation.members) {
            collectAnnotation(state, block, member.annotation);
        }

        return;
    }

    if (annotation.kind === 'type-tuple') {
        for (const element of annotation.elements) {
            collectAnnotation(state, block, element);
        }

        return;
    }

    for (const parameter of annotation.parameters) {
        collectAnnotation(state, block, parameter);
    }

    collectAnnotation(state, block, annotation.returnType);
}

function collectMember(state: CollectorState, block: BlockContext, expression: MemberExpression): void {
    collectExpression(state, block, expression.object);

    const position = positionAt(state.starts, expression.position.offset + 1);

    addReference(state, expression.property, 'member', position, block.scopeId, receiverName(state, expression.object));
}

function collectCall(state: CollectorState, block: BlockContext, expression: CallExpression): void {
    collectExpression(state, block, expression.callee);

    if (expression.method !== null) {
        const position = positionAt(state.starts, expression.position.offset + 1);

        addReference(state, expression.method, 'member', position, block.scopeId, receiverName(state, expression.callee));
    }

    for (const argument of expression.args) {
        collectExpression(state, block, argument);
    }
}

function collectNew(state: CollectorState, block: BlockContext, expression: NewExpression): void {
    const position = locatePosition(state, expression.position.offset + 3, expression.className);

    if (position !== null) {
        addReference(state, expression.className, 'type', position, block.scopeId);
    }

    for (const argument of expression.args) {
        collectExpression(state, block, argument);
    }
}

function collectTemplate(state: CollectorState, block: BlockContext, expression: Expression): void {
    if (expression.kind !== 'template-literal') {
        return;
    }

    for (const interpolation of collectInterpolations(expression.segments)) {
        const position = locatePosition(state, interpolation.position.offset, interpolation.root);

        if (interpolation.root.length > 0 && position !== null) {
            addReference(state, interpolation.root, 'value', position, block.scopeId);
        }
    }
}

export function collectExpression(state: CollectorState, block: BlockContext, expression: Expression): void {
    if (expression.kind === 'identifier') {
        addReference(state, expression.name, 'value', expression.position, block.scopeId);

        return;
    }

    if (expression.kind === 'member-expression') {
        collectMember(state, block, expression);

        return;
    }

    if (expression.kind === 'index-expression') {
        collectExpression(state, block, expression.object);
        collectExpression(state, block, expression.index);

        return;
    }

    if (expression.kind === 'call-expression') {
        collectCall(state, block, expression);

        return;
    }

    if (expression.kind === 'new-expression') {
        collectNew(state, block, expression);

        return;
    }

    if (expression.kind === 'function-expression') {
        state.walkFunction(state, block, expression);

        return;
    }

    if (expression.kind === 'table-expression') {
        for (const field of expression.fields) {
            if (field.key !== null) {
                collectExpression(state, block, field.key);
            }

            collectExpression(state, block, field.value);
        }

        return;
    }

    if (expression.kind === 'binary-expression') {
        collectExpression(state, block, expression.left);
        collectExpression(state, block, expression.right);

        return;
    }

    if (expression.kind === 'unary-expression') {
        collectExpression(state, block, expression.operand);

        return;
    }

    if (expression.kind === 'group-expression') {
        collectExpression(state, block, expression.expression);

        return;
    }

    collectTemplate(state, block, expression);
}
