import { createPosition, sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Token } from '@compiler/lexer/token';
import type { AssignmentStatement, Expression, LocalStatement, Program, Statement } from '@compiler/parser/ast';
import { scan } from '@compiler/lexer/lexer';
import { parse, parseExpressionSource } from '@compiler/parser/parser';

import {
    ALLOWED_STATEMENTS,
    INVALID_STATEMENT,
    MISSING_FIELD,
    NOT_A_TABLE,
    REMOVED_FIELD,
    TRAILING_CONTENT,
    UNEXPECTED_STATEMENT,
    UNKNOWN_FIELD,
    manifestError,
} from './manifest-diagnostics';
import { nilValue } from './manifest-evaluated';
import { createGapOracle } from './manifest-gaps';
import { convertLegacyManifest, LEGACY_MANIFEST_FIELDS, manifestFormWarning, refusalDiagnostics } from './manifest-legacy';
import { findField, requiredFields } from './manifest-field';
import { MANIFEST_FIELDS, REMOVED_FIELDS } from './manifest-fields';
import { unknownNameMessage } from './manifest-messages';
import { table, type ManifestField } from './manifest-field';
import { ManifestPass, type ManifestContext } from './manifest-pass';
import { normalizeFields, normalizeManifest } from './manifest-rules';
import { isManifestObject, type ManifestObject } from './manifest-value';

export interface ManifestAssignment {
    name: string;
    position: SourcePosition;
    value: Expression;
}

export interface ManifestNormalization {
    value: ManifestObject;
    diagnostics: Diagnostic[];
}

export type ManifestForm = 'table' | 'assignments';

export interface ManifestSchema {
    fields: readonly ManifestField[];
    removed: Readonly<Record<string, string>>;
    normalize(raw: ManifestObject, positions: ReadonlyMap<string, SourcePosition>): ManifestNormalization;
    form?: ManifestForm;
    retag?(diagnostic: Diagnostic): Diagnostic;
    unknownName?(name: string): string;
    missingName?(field: ManifestField): string;
}

export const MANIFEST_SCHEMA: ManifestSchema = { fields: MANIFEST_FIELDS, removed: REMOVED_FIELDS, normalize: normalizeManifest, form: 'table' };

export const LEGACY_SCHEMA: ManifestSchema = {
    fields: LEGACY_MANIFEST_FIELDS,
    removed: {},
    normalize: (raw, positions) => normalizeFields(LEGACY_MANIFEST_FIELDS, raw, positions),
    form: 'assignments',
};

export interface ManifestAnalysis {
    program: Program;
    tokens: Token[];
    diagnostics: Diagnostic[];
    value: ManifestObject;
    raw: ManifestObject;
    positions: ReadonlyMap<string, SourcePosition>;
    assignments: readonly ManifestAssignment[];
    groups: ReadonlySet<string>;
    form: ManifestForm;
    legacy?: ManifestObject;
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
            const message = schema.missingName === undefined ? `The manifest requires a "${field.name}" field. ${field.summary}` : schema.missingName(field);

            diagnostics.push(manifestError(MISSING_FIELD, message, START));
        }
    }
}

function analyzeAssignments(source: string, context: ManifestContext, schema: ManifestSchema, extra: readonly Diagnostic[] = []): ManifestAnalysis {
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
        diagnostics: sortDiagnostics([...extra, ...parsed.diagnostics, ...pass.diagnostics, ...normalized.diagnostics]).map(schema.retag ?? ((entry) => entry)),
        value: normalized.value,
        raw,
        positions: pass.positions,
        assignments,
        groups: pass.groups,
        form: 'assignments',
    };
}

const EMPTY_PROGRAM: Program = { kind: 'program', body: [], position: START };

const STATEMENT_KEYWORDS: ReadonlySet<string> = new Set([
    'local',
    'if',
    'while',
    'for',
    'repeat',
    'do',
    'return',
    'function',
    'class',
    'interface',
    'enum',
    'type',
    'declare',
    'export',
    'break',
    'continue',
]);

const INLINE_FORM = 'A manifest has no statements. Write the value where it is used, reading "env.SOME_KEY", "mode", or "root" as often as it is needed.';

function shapeMessage(schema: ManifestSchema): string {
    const sections = schema.fields.map((entry) => `"${entry.name}"`).join(', ');

    return `A manifest is one table constructor and nothing else. Write "{", then the sections — ${sections} — then "}".`;
}

function firstToken(tokens: readonly Token[]): Token | null {
    return tokens.find((token) => token.kind !== 'eof') ?? null;
}

export function isTableForm(tokens: readonly Token[]): boolean {
    const first = firstToken(tokens);

    return first !== null && first.kind === 'punctuation' && first.value === '{';
}

function analyzeTable(source: string, context: ManifestContext, schema: ManifestSchema): ManifestAnalysis {
    const parsed = parseExpressionSource(source);
    const pass = new ManifestPass(context, schema.removed, createGapOracle(source, parsed.tokens, parsed.comments));
    const root = table('', 'The manifest.', schema.fields);
    const raw: ManifestObject = {};

    for (const directive of parsed.directives) {
        pass.report(INVALID_STATEMENT, statementError(`the "#!${directive}" directive`), START);
    }

    const expression = parsed.expression;
    const first = firstToken(parsed.tokens);
    const statement = first !== null && first.kind === 'keyword' && STATEMENT_KEYWORDS.has(first.value);

    if (statement) {
        const message = first.value === 'local' ? `${INLINE_FORM} ${shapeMessage(schema)}` : shapeMessage(schema);

        pass.report(UNEXPECTED_STATEMENT, message, first.position);
    } else if (expression === null || expression.kind !== 'table-expression') {
        pass.report(NOT_A_TABLE, shapeMessage(schema), expression?.position ?? START);
    } else {
        if (parsed.trailing !== null) {
            pass.report(TRAILING_CONTENT, `A manifest ends with its table. ${shapeMessage(schema)}`, parsed.trailing.position);
        }

        const evaluated = pass.expression(expression, { field: root, path: '', key: '' });

        if (isManifestObject(evaluated.value)) {
            Object.assign(raw, evaluated.value);
        }
    }

    const normalized = schema.normalize(raw, pass.positions);

    return {
        program: EMPTY_PROGRAM,
        tokens: parsed.tokens,
        diagnostics: sortDiagnostics([...(statement ? [] : parsed.diagnostics), ...pass.diagnostics, ...normalized.diagnostics]).map(schema.retag ?? ((entry) => entry)),
        value: normalized.value,
        raw,
        positions: pass.positions,
        assignments: [],
        groups: pass.groups,
        form: 'table',
    };
}

const POSITION_MOVES: readonly (readonly [string, string])[] = [
    ['author', 'info.author'],
    ['version', 'info.version'],
    ['description', 'info.description'],
    ['dependencies', 'info.dependencies'],
    ['libraries', 'environment.libraries'],
    ['compiler', 'environment'],
    ['engine.minVersion', 'environment.version'],
    ['environment.file', 'environment.secret'],
    ['outDir', 'build.output'],
    ['output', 'build.details'],
    ['sources', 'scripts'],
    ['loadOrder', 'scripts'],
    ['assets', 'files'],
];

function movedPositions(positions: ReadonlyMap<string, SourcePosition>): Map<string, SourcePosition> {
    const moved = new Map(positions);

    for (const [key, position] of positions) {
        for (const [from, to] of POSITION_MOVES) {
            if (key === from || key.startsWith(`${from}.`)) {
                moved.set(`${to}${key.slice(from.length)}`, position);
            }
        }
    }

    return moved;
}

function analyzeLegacy(source: string, context: ManifestContext, schema: ManifestSchema): ManifestAnalysis {
    const read = analyzeAssignments(source, context, LEGACY_SCHEMA);
    const converted = convertLegacyManifest(read.raw);
    const positions = movedPositions(read.positions);
    const normalized = schema.normalize(converted.value, positions);
    const [first] = read.assignments;
    const anchor = first?.position ?? START;
    const notices = [manifestFormWarning(anchor), ...refusalDiagnostics(converted.refusals, positions)];

    return {
        program: read.program,
        tokens: read.tokens,
        diagnostics: sortDiagnostics([...read.diagnostics, ...normalized.diagnostics, ...notices]).map(schema.retag ?? ((entry) => entry)),
        value: normalized.value,
        raw: converted.value,
        legacy: read.raw,
        positions,
        assignments: read.assignments,
        groups: new Set(),
        form: 'assignments',
    };
}

export function analyzeManifest(source: string, context: ManifestContext, schema: ManifestSchema = MANIFEST_SCHEMA): ManifestAnalysis {
    if (schema.form !== 'table') {
        return analyzeAssignments(source, context, schema);
    }

    const tokens = scan(source).tokens;

    if (isTableForm(tokens)) {
        return analyzeTable(source, context, schema);
    }

    const legacy = analyzeLegacy(source, context, schema);

    return legacy.assignments.length > 0 ? legacy : analyzeTable(source, context, schema);
}
