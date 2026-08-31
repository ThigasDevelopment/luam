import { createPosition, sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Token } from '@compiler/lexer/token';
import type { AssignmentStatement, Expression, LocalStatement, Program, Statement } from '@compiler/parser/ast';
import { parse } from '@compiler/parser/parser';

import { ALLOWED_STATEMENTS, INVALID_STATEMENT, MISSING_FIELD, REMOVED_FIELD, UNKNOWN_FIELD, manifestError } from './manifest-diagnostics';
import { nilValue } from './manifest-evaluated';
import { findField, requiredFields } from './manifest-field';
import { MANIFEST_FIELDS, REMOVED_FIELDS } from './manifest-fields';
import { unknownNameMessage } from './manifest-messages';
import type { ManifestField } from './manifest-field';
import { ManifestPass, type ManifestContext } from './manifest-pass';
import { normalizeManifest } from './manifest-rules';
import type { ManifestObject } from './manifest-value';

export interface ManifestAssignment {
    name: string;
    position: SourcePosition;
    value: Expression;
}

export interface ManifestNormalization {
    value: ManifestObject;
    diagnostics: Diagnostic[];
}

export interface ManifestSchema {
    fields: readonly ManifestField[];
    removed: Readonly<Record<string, string>>;
    normalize(raw: ManifestObject, positions: ReadonlyMap<string, SourcePosition>): ManifestNormalization;
    retag?(diagnostic: Diagnostic): Diagnostic;
    unknownName?(name: string): string;
}

export const MANIFEST_SCHEMA: ManifestSchema = { fields: MANIFEST_FIELDS, removed: REMOVED_FIELDS, normalize: normalizeManifest };

export interface ManifestAnalysis {
    program: Program;
    tokens: Token[];
    diagnostics: Diagnostic[];
    value: ManifestObject;
    raw: ManifestObject;
    positions: ReadonlyMap<string, SourcePosition>;
    assignments: readonly ManifestAssignment[];
}

const START = createPosition(1, 1, 0);

function statementError(kind: string): string {
    return `A manifest cannot contain ${kind}. ${ALLOWED_STATEMENTS}`;
}

const STATEMENT_NAMES: Readonly<Record<string, string>> = {
    'call-statement': 'a call',
    'function-declaration': 'a function declaration',
    'return-statement': 'a return',
    'do-statement': 'a "do" block',
    'while-statement': 'a loop',
    'repeat-statement': 'a loop',
    'if-statement': 'an "if" statement',
    'numeric-for-statement': 'a loop',
    'generic-for-statement': 'a loop',
    'type-alias-statement': 'a type alias',
    'declare-statement': 'a declaration',
    'event-declaration': 'an event declaration',
    'class-declaration': 'a class declaration',
    'interface-declaration': 'an interface declaration',
    'enum-declaration': 'an enum declaration',
    'break-statement': 'a "break"',
    'continue-statement': 'a "continue"',
};

function readLocal(pass: ManifestPass, statement: LocalStatement): void {
    for (const [index, declaration] of statement.declarations.entries()) {
        const value = statement.values[index];

        pass.declareLocal(declaration.name, value === undefined ? nilValue() : pass.evaluate(value, null), declaration.position);
    }
}

function readAssignment(pass: ManifestPass, statement: AssignmentStatement, assignments: ManifestAssignment[], value: ManifestObject, schema: ManifestSchema): void {
    const [target] = statement.targets;
    const [expression] = statement.values;

    if (statement.operator !== '=' || statement.targets.length !== 1 || statement.values.length !== 1 || target === undefined || expression === undefined) {
        pass.report(INVALID_STATEMENT, statementError('this assignment'), statement.position);

        return;
    }

    if (target.kind !== 'identifier') {
        pass.report(INVALID_STATEMENT, statementError('an assignment to anything but a configuration field'), target.position);

        return;
    }

    const field = findField(schema.fields, target.name);

    if (field === null) {
        const replacement = schema.removed[target.name];

        if (replacement === undefined) {
            pass.report(UNKNOWN_FIELD, (schema.unknownName ?? unknownNameMessage)(target.name), target.position);
        } else {
            pass.report(REMOVED_FIELD, `"${target.name}" is no longer a manifest field. ${replacement}`, target.position);
        }

        return;
    }

    assignments.push({ name: target.name, position: target.position, value: expression });
    value[target.name] = pass.expression(expression, { field, path: target.name, key: target.name }).value;
}

function readStatement(pass: ManifestPass, statement: Statement, assignments: ManifestAssignment[], value: ManifestObject, schema: ManifestSchema): void {
    if (statement.kind === 'local-statement') {
        readLocal(pass, statement);

        return;
    }

    if (statement.kind === 'assignment-statement') {
        readAssignment(pass, statement, assignments, value, schema);

        return;
    }

    pass.report(INVALID_STATEMENT, statementError(STATEMENT_NAMES[statement.kind] ?? 'this statement'), statement.position);
}

function reportMissing(diagnostics: Diagnostic[], value: ManifestObject, schema: ManifestSchema): void {
    for (const field of requiredFields(schema.fields)) {
        if (value[field.name] === undefined) {
            diagnostics.push(manifestError(MISSING_FIELD, `The manifest requires a "${field.name}" field. ${field.summary}`, START));
        }
    }
}

export function analyzeManifest(source: string, context: ManifestContext, schema: ManifestSchema = MANIFEST_SCHEMA): ManifestAnalysis {
    const parsed = parse(source);
    const pass = new ManifestPass(context);
    const assignments: ManifestAssignment[] = [];
    const raw: ManifestObject = {};

    for (const directive of parsed.directives) {
        pass.report(INVALID_STATEMENT, statementError(`the "#!${directive}" directive`), START);
    }

    for (const statement of parsed.program.body) {
        readStatement(pass, statement, assignments, raw, schema);
    }

    reportMissing(pass.diagnostics, raw, schema);
    pass.diagnostics.push(...pass.locals.unused());

    const normalized = schema.normalize(raw, pass.positions);

    return {
        program: parsed.program,
        tokens: parsed.tokens,
        diagnostics: sortDiagnostics([...parsed.diagnostics, ...pass.diagnostics, ...normalized.diagnostics]).map(schema.retag ?? ((entry) => entry)),
        value: normalized.value,
        raw,
        positions: pass.positions,
        assignments,
    };
}
