import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';

export const INVALID_STATEMENT = 'config-invalid-statement';

export const INVALID_EXPRESSION = 'config-invalid-expression';

export const INVALID_TYPE = 'config-invalid-type';

export const UNKNOWN_FIELD = 'config-unknown-field';

export const MISSING_FIELD = 'config-missing-field';

export const INVALID_NAME = 'config-invalid-name';

export const ESCAPING_PATH = 'config-escaping-path';

export const UNKNOWN_HELPER = 'config-unknown-helper';

export const INVALID_PATTERN = 'config-invalid-pattern';

export const INVALID_DEPENDENCY = 'config-invalid-dependency';

export const INVALID_ENGINE_VERSION = 'config-invalid-engine-version';

export const REMOVED_FIELD = 'config-removed-field';

export const ALLOWED_STATEMENTS = 'A manifest holds only "local" declarations and assignments to configuration fields.';

export const ALLOWED_EXPRESSIONS = 'A manifest value is a literal, a table, or those combined with "and", "or", "not", comparison, arithmetic, and concatenation.';

export function manifestError(code: string, message: string, position: SourcePosition): Diagnostic {
    return createDiagnostic('manifest', code, message, position);
}

export function manifestWarning(code: string, message: string, position: SourcePosition): Diagnostic {
    return createDiagnostic('manifest', code, message, position, 'warning');
}
