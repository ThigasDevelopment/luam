import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { FunctionDeclaration, Statement } from '@compiler/parser/ast';
import type { ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import { DECLARATION_EXTENSION } from '@compiler/project/source-kind';

export interface ExportedFunction {
    name: string;
    position: SourcePosition;
}

export interface SourceDirectives {
    exports: ExportedFunction[];
}

export interface DirectiveResult {
    directives: SourceDirectives;
    diagnostics: Diagnostic[];
}

export interface DirectiveOptions {
    isDeclarationFile: boolean;
}

export const EMPTY_DIRECTIVES: SourceDirectives = { exports: [] };

const NOT_TOP_LEVEL_MESSAGE = 'An "export" describes a resource-level function and must be declared at the top level of the file.';

const MEMBER_MESSAGE = 'MTA exports a single global name, so "export" cannot be applied to a function declared on a table.';

const DECLARATION_FILE_MESSAGE = `An "export" has no effect in a "${DECLARATION_EXTENSION}" file, which emits no code to export.`;

function nestedBodies(statement: Statement): Statement[][] {
    switch (statement.kind) {
        case 'do-statement':
        case 'while-statement':
        case 'repeat-statement':
        case 'numeric-for-statement':
        case 'generic-for-statement':
        case 'function-declaration':
            return [statement.body];
        case 'if-statement':
            return [...statement.clauses.map((clause) => clause.body), ...(statement.alternate === null ? [] : [statement.alternate])];
        case 'class-declaration':
            return statement.members
                .filter((member): member is ClassMethodDeclaration => member.kind === 'class-method')
                .map((member) => member.body);
        default:
            return [];
    }
}

function nestedDiagnostic(statement: Statement): Diagnostic | null {
    if (statement.kind !== 'function-declaration' || !statement.isExported) {
        return null;
    }

    return createDiagnostic('checker', 'check-export-not-top-level', NOT_TOP_LEVEL_MESSAGE, statement.position);
}

function collectNested(statements: readonly Statement[], diagnostics: Diagnostic[]): void {
    for (const statement of statements) {
        const diagnostic = nestedDiagnostic(statement);

        if (diagnostic !== null) {
            diagnostics.push(diagnostic);
        }

        for (const body of nestedBodies(statement)) {
            collectNested(body, diagnostics);
        }
    }
}

function collectExport(statement: FunctionDeclaration, result: DirectiveResult, options: DirectiveOptions): void {
    if (options.isDeclarationFile) {
        result.diagnostics.push(createDiagnostic('checker', 'check-export-in-declaration-file', DECLARATION_FILE_MESSAGE, statement.position));

        return;
    }

    if (statement.name.kind !== 'identifier') {
        result.diagnostics.push(createDiagnostic('checker', 'check-export-member', MEMBER_MESSAGE, statement.position));

        return;
    }

    result.directives.exports.push({ name: statement.name.name, position: statement.position });
}

export function collectDirectives(body: readonly Statement[], options: DirectiveOptions): DirectiveResult {
    const result: DirectiveResult = { directives: { exports: [] }, diagnostics: [] };

    for (const statement of body) {
        if (statement.kind === 'function-declaration' && statement.isExported) {
            collectExport(statement, result, options);
        }

        for (const nested of nestedBodies(statement)) {
            collectNested(nested, result.diagnostics);
        }
    }

    return result;
}
