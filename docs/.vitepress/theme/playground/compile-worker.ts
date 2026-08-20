import { type CompileRequest, type CompileResponse, MAX_SOURCE_LENGTH, type PlaygroundDiagnostic } from './protocol';

import { compile } from '@compiler/index';
import { DEFAULT_COMPILER_OPTIONS } from '@compiler/manifest/manifest-defaults';

import { type Diagnostic } from '@compiler/diagnostics/diagnostic';

const scope = self as unknown as DedicatedWorkerGlobalScope;

function toPlaygroundDiagnostic(diagnostic: Diagnostic): PlaygroundDiagnostic {
    return {
        severity: diagnostic.severity,
        code: diagnostic.code,
        message: diagnostic.message,
        line: diagnostic.position.line,
        column: diagnostic.position.column,
        endLine: diagnostic.end?.line ?? diagnostic.position.line,
        endColumn: diagnostic.end?.column ?? diagnostic.position.column + 1,
    };
}

function run(request: CompileRequest): CompileResponse {
    const empty = { id: request.id, code: null, diagnostics: [], helpers: [], environment: request.environment };

    if (request.source.length > MAX_SOURCE_LENGTH) {
        return { ...empty, failure: `The playground compiles up to ${MAX_SOURCE_LENGTH} characters.` };
    }

    const result = compile(request.source, {
        environment: request.environment,
        compilerOptions: { ...DEFAULT_COMPILER_OPTIONS, oop: request.oop },
    });

    return {
        id: request.id,
        code: result.code,
        diagnostics: result.diagnostics.map(toPlaygroundDiagnostic),
        helpers: result.requiredHelpers.map((helper) => String(helper)),
        environment: result.environment,
        failure: null,
    };
}

scope.onmessage = (event: MessageEvent<CompileRequest>): void => {
    const request = event.data;

    try {
        scope.postMessage(run(request));
    } catch (error) {
        scope.postMessage({
            id: request.id,
            code: null,
            diagnostics: [],
            helpers: [],
            environment: request.environment,
            failure: error instanceof Error ? error.message : 'The compiler stopped unexpectedly.',
        } satisfies CompileResponse);
    }
};
