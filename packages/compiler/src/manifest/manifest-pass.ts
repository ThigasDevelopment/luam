import { createArray, createRecord, createUnion, isAssignable, STRING_TYPE, type Type } from '@compiler/checker/types';
import type { Diagnostic, SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Expression, TableExpression } from '@compiler/parser/ast';

import { ALLOWED_EXPRESSIONS, INVALID_EXPRESSION, INVALID_TYPE, MISSING_FIELD, UNKNOWN_FIELD, manifestError } from './manifest-diagnostics';
import { booleanValue, errorValue, nilValue, numberValue, resolved, stringValue, type Evaluated } from './manifest-evaluated';
import { elementField, findField, type ManifestField } from './manifest-field';
import { ENV_MEMBER_TYPE } from './manifest-fields';
import { ManifestLocals } from './manifest-locals';
import { closedSetMessage, missingMessage, typeMessage, unknownNameMessage } from './manifest-messages';
import { applyBinary, applyUnary } from './manifest-operators';
import { describeReceived, isManifestObject, type ManifestObject, type ManifestValue } from './manifest-value';

export interface ManifestContext {
    mode: string;
    root: string;
    env: Readonly<Record<string, string | undefined>>;
}

export interface FieldTarget {
    field: ManifestField;
    path: string;
    key: string;
}

export const ENV_TYPE: Type = createRecord('Env', new Map());

const MIXED_TABLE = `A manifest table holds either named fields or a list, not both. ${ALLOWED_EXPRESSIONS}`;

export class ManifestPass {
    readonly diagnostics: Diagnostic[] = [];

    readonly positions = new Map<string, SourcePosition>();

    readonly locals = new ManifestLocals();

    private readonly context: ManifestContext;

    constructor(context: ManifestContext) {
        this.context = context;
    }

    report(code: string, message: string, position: SourcePosition): void {
        this.diagnostics.push(manifestError(code, message, position));
    }

    declareLocal(name: string, evaluated: Evaluated, position: SourcePosition): void {
        this.locals.declare(name, evaluated, position);
    }

    expression(node: Expression, target: FieldTarget | null): Evaluated {
        const evaluated = this.evaluate(node, target);

        if (target !== null) {
            this.positions.set(target.key, node.position);
            this.checkValue(evaluated, target, node.position);
        }

        return evaluated;
    }

    evaluate(node: Expression, target: FieldTarget | null): Evaluated {
        switch (node.kind) {
            case 'nil-literal':
                return nilValue();
            case 'boolean-literal':
                return booleanValue(node.value);
            case 'number-literal':
                return numberValue(node.value);
            case 'string-literal':
                return stringValue(node.value);
            case 'group-expression':
                return this.evaluate(node.expression, target);
            case 'identifier':
                return this.identifier(node.name, node.position);
            case 'member-expression':
                return this.member(node.object, node.property, node.position);
            case 'index-expression':
                return this.index(node.object, node.index, node.position);
            case 'table-expression':
                return this.table(node, target);
            case 'unary-expression':
                return this.unary(node.operator, node.operand, node.position);
            case 'binary-expression':
                return this.binary(node.operator, node.left, node.right, node.position, target);
            default:
                this.report(INVALID_EXPRESSION, `A manifest cannot use this expression. ${ALLOWED_EXPRESSIONS}`, node.position);

                return errorValue();
        }
    }

    private identifier(name: string, position: SourcePosition): Evaluated {
        const local = this.locals.read(name);

        if (local !== null) {
            return local;
        }

        if (name === 'mode' || name === 'root') {
            return stringValue(name === 'mode' ? this.context.mode : this.context.root);
        }

        if (name === 'env') {
            return { value: { ...this.context.env } as ManifestObject, type: ENV_TYPE, truthy: ENV_TYPE, falsy: null };
        }

        this.report(UNKNOWN_FIELD, unknownNameMessage(name), position);

        return errorValue();
    }

    private member(object: Expression, property: string, position: SourcePosition): Evaluated {
        const owner = this.evaluate(object, null);

        if (owner.type === ENV_TYPE) {
            return resolved(this.context.env[property] ?? null, ENV_MEMBER_TYPE);
        }

        if (owner.type.kind === 'record' && isManifestObject(owner.value)) {
            const type = owner.type.members.get(property);

            if (type !== undefined) {
                return resolved(owner.value[property] ?? null, type);
            }
        }

        if (owner.type.kind !== 'any') {
            this.report(UNKNOWN_FIELD, `"${property}" is not a member of this value.`, position);
        }

        return errorValue();
    }

    private index(object: Expression, index: Expression, position: SourcePosition): Evaluated {
        const key = this.evaluate(index, null);

        if (typeof key.value === 'string') {
            return this.member(object, key.value, position);
        }

        this.report(INVALID_EXPRESSION, `A manifest indexes a table with a string key. ${ALLOWED_EXPRESSIONS}`, position);

        return errorValue();
    }

    private unary(operator: string, operand: Expression, position: SourcePosition): Evaluated {
        const outcome = applyUnary(operator, this.evaluate(operand, null), describeReceived);

        if (outcome.error !== null) {
            this.report(INVALID_TYPE, outcome.error, position);

            return errorValue();
        }

        return outcome.evaluated;
    }

    private binary(operator: string, left: Expression, right: Expression, position: SourcePosition, target: FieldTarget | null): Evaluated {
        const branching = operator === 'and' || operator === 'or';
        const outcome = applyBinary(operator, this.evaluate(left, branching ? target : null), this.evaluate(right, branching ? target : null), describeReceived);

        if (outcome.error !== null) {
            this.report(INVALID_TYPE, outcome.error, position);

            return errorValue();
        }

        return outcome.evaluated;
    }

    private table(node: TableExpression, target: FieldTarget | null): Evaluated {
        if (target === null) {
            return node.fields.every((entry) => entry.name !== null) ? this.tableRecord(node, null) : this.tableList(node, null);
        }

        if (target.field.members !== null) {
            return this.tableRecord(node, target);
        }

        if (target.field.type.kind === 'array') {
            return this.tableList(node, target);
        }

        this.report(INVALID_TYPE, typeMessage(target.path, target.field, 'a table'), node.position);

        return errorValue();
    }

    private tableRecord(node: TableExpression, target: FieldTarget | null): Evaluated {
        const value: ManifestObject = {};
        const members = new Map<string, Type>();
        const fields = target?.field.members ?? null;

        for (const entry of node.fields) {
            if (entry.name === null) {
                this.report(INVALID_EXPRESSION, MIXED_TABLE, entry.position);

                continue;
            }

            const member = fields === null ? null : findField(fields, entry.name);

            if (fields !== null && member === null) {
                this.report(UNKNOWN_FIELD, `"${target?.path ?? ''}.${entry.name}" is not a configuration field.`, entry.position);

                continue;
            }

            const nested = member === null || target === null ? null : { field: member, path: `${target.path}.${entry.name}`, key: `${target.key}.${entry.name}` };
            const evaluated = this.expression(entry.value, nested);

            value[entry.name] = evaluated.value;
            members.set(entry.name, evaluated.type);
        }

        this.reportMissing(node.position, target, value);

        return resolved(value, target === null ? createRecord('table', members) : target.field.type);
    }

    private reportMissing(position: SourcePosition, target: FieldTarget | null, value: ManifestObject): void {
        for (const member of target?.field.members ?? []) {
            if (member.required && value[member.name] === undefined) {
                this.report(MISSING_FIELD, missingMessage(target?.path ?? '', member), position);
            }
        }
    }

    private tableList(node: TableExpression, target: FieldTarget | null): Evaluated {
        const element = target?.field.type.kind === 'array' ? target.field.type.element : null;
        const value: ManifestValue[] = [];
        const types: Type[] = [];

        for (const [index, entry] of node.fields.entries()) {
            if (entry.name !== null) {
                this.report(INVALID_EXPRESSION, MIXED_TABLE, entry.position);

                continue;
            }

            const nested = element === null || target === null ? null : { field: elementField(target.field, element), path: target.path, key: `${target.key}.${index}` };
            const evaluated = this.expression(entry.value, nested);

            value.push(evaluated.value);
            types.push(evaluated.type);
        }

        return resolved(value, createArray(types.length === 0 ? STRING_TYPE : createUnion(types)));
    }

    private checkValue(evaluated: Evaluated, target: FieldTarget, position: SourcePosition): void {
        const { field, path } = target;

        if (field.values !== null) {
            if (typeof evaluated.value === 'string') {
                if (!field.values.includes(evaluated.value)) {
                    this.report(field.valueCode ?? INVALID_TYPE, closedSetMessage(path, field, evaluated.value), position);
                }

                return;
            }

            if (Array.isArray(evaluated.value)) {
                return;
            }
        }

        if (evaluated.type !== ENV_TYPE && isAssignable(evaluated.type, field.type)) {
            return;
        }

        this.report(INVALID_TYPE, typeMessage(path, field, evaluated.type), position);
    }
}
