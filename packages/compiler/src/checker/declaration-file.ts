import { createDiagnostic, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import type { Statement } from '@compiler/parser/ast';
import { DECLARATION_EXTENSION } from '@compiler/project/source-kind';

const ALLOWED: ReadonlySet<string> = new Set([
    'class-declaration',
    'interface-declaration',
    'enum-declaration',
    'type-alias-statement',
    'declare-statement',
    'function-declaration',
]);

const LABELS: Readonly<Record<string, string>> = {
    'local-statement': 'A "local" declaration',
    'assignment-statement': 'An assignment',
    'call-statement': 'A call',
    'return-statement': 'A "return"',
    'break-statement': 'A "break"',
    'continue-statement': 'A "continue"',
    'do-statement': 'A "do" block',
    'while-statement': 'A "while" loop',
    'repeat-statement': 'A "repeat" loop',
    'if-statement': 'An "if" statement',
    'numeric-for-statement': 'A "for" loop',
    'generic-for-statement': 'A "for" loop',
};

function label(statement: Statement): string {
    return LABELS[statement.kind] ?? 'This statement';
}

function isAllowed(statement: Statement): boolean {
    if (statement.kind === 'function-declaration') {
        return !statement.isLocal;
    }

    return ALLOWED.has(statement.kind);
}

export function checkDeclarationFile(body: readonly Statement[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const statement of body) {
        if (isAllowed(statement)) {
            continue;
        }

        const message = `${label(statement)} has no effect in a "${DECLARATION_EXTENSION}" file, which holds declarations only.`;

        diagnostics.push(createDiagnostic('checker', 'check-declaration-file-statement', message, statement.position));
    }

    return diagnostics;
}
