import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Expression } from '@compiler/parser/ast';

import { pathOf } from './access-path';
import type { CheckContext } from './context';
import { createObjectType, isAssignable, typeToString, widenInferred, type RecordType, type Type } from './types';

export interface RecordObligation {
    path: string;
    subject: string;
    source: Type;
    target: Type;
    missing: Map<string, Type>;
    discharged: number;
    depth: number;
    line: number;
    position: SourcePosition;
}

export function recordShapeOf(context: CheckContext, type: Type): RecordType | null {
    if (type.kind === 'record') {
        return type;
    }

    if (type.kind !== 'named') {
        return null;
    }

    const shape = context.assignability().resolveNominal?.(type.name) ?? null;

    return shape === null ? null : { kind: 'record', name: type.name, origin: null, members: shape.members };
}

function pendingKeys(context: CheckContext, source: Type, target: Type): Map<string, Type> | null {
    if (source.kind !== 'record' || source.isLiteral !== true) {
        return null;
    }

    const shape = recordShapeOf(context, target);

    if (shape === null) {
        return null;
    }

    const missing = new Map<string, Type>();
    const options = context.assignability();

    for (const [name, member] of shape.members) {
        const written = source.members.get(name);

        if (written === undefined) {
            if (member.kind !== 'optional') {
                missing.set(name, member);
            }

            continue;
        }

        if (!isAssignable(written, member, options)) {
            return null;
        }
    }

    for (const name of source.members.keys()) {
        if (!shape.members.has(name)) {
            return null;
        }
    }

    return missing.size === 0 ? null : missing;
}

export function deferRecordCompletion(context: CheckContext, target: Expression, source: Type, declared: Type, subject: string, position: SourcePosition): boolean {
    const path = pathOf(target);

    if (path === null) {
        return false;
    }

    const missing = pendingKeys(context, source, declared);

    if (missing === null) {
        return false;
    }

    context.openRecordObligation({
        path,
        subject,
        source,
        target: declared,
        missing,
        discharged: 0,
        depth: context.blockDepth,
        line: position.line,
        position,
    });

    return true;
}

export function reportIncompleteRecord(context: CheckContext, obligation: RecordObligation, position: SourcePosition): void {
    if (obligation.discharged === 0) {
        context.closeRecordObligation(obligation.path);
        context.expectAssignable(obligation.source, obligation.target, obligation.position, obligation.subject);

        return;
    }

    const keys = [...obligation.missing.keys()].map((key) => `"${key}"`);
    const label = keys.length === 1 ? `Key ${keys[0]} is` : `Keys ${keys.join(', ')} are`;
    const built = `The table built on line ${obligation.line} is used before it is complete.`;
    const message = `${obligation.subject} expects "${typeToString(obligation.target)}". ${label} never assigned. ${built}`;

    context.report('check-incomplete-record', message, position);
    context.closeRecordObligation(obligation.path);
}

export function dischargeRecordKey(context: CheckContext, target: Expression, valueType: Type, position: SourcePosition): boolean {
    if (target.kind !== 'member-expression') {
        return false;
    }

    const path = pathOf(target.object);
    const obligation = path === null ? null : context.recordObligation(path);

    if (obligation === null || obligation.depth !== context.blockDepth) {
        return false;
    }

    const expected = obligation.missing.get(target.property);

    if (expected === undefined) {
        return false;
    }

    context.expectAssignable(valueType, expected, position, `Key "${target.property}"`);
    obligation.missing.delete(target.property);
    obligation.discharged += 1;

    if (obligation.missing.size === 0) {
        context.closeRecordObligation(obligation.path);
    }

    return true;
}

export function extendInferredRecord(context: CheckContext, target: Expression, valueType: Type): boolean {
    if (target.kind !== 'member-expression' || target.object.kind !== 'identifier') {
        return false;
    }

    const symbol = context.binder.lookup(target.object.name);

    if (symbol === null || symbol.type.kind !== 'record' || symbol.type.isInferred !== true || symbol.type.members.has(target.property)) {
        return false;
    }

    const members = new Map(symbol.type.members);

    members.set(target.property, widenInferred(valueType));

    const extended = createObjectType(members);

    symbol.type = extended.kind === 'record' ? { ...extended, isInferred: true } : extended;

    return true;
}

export function escapesRecordObligation(context: CheckContext, expression: Expression): void {
    const path = pathOf(expression);
    const obligation = path === null ? null : context.recordObligation(path);

    if (obligation !== null) {
        reportIncompleteRecord(context, obligation, expression.position);
    }
}

export function settleRecordObligations(context: CheckContext, opened: ReadonlySet<string>): void {
    for (const path of context.recordObligationPaths()) {
        if (opened.has(path)) {
            continue;
        }

        const obligation = context.recordObligation(path);

        if (obligation === null) {
            continue;
        }

        reportIncompleteRecord(context, obligation, obligation.position);
    }
}
