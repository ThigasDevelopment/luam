import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';

export type RawObject = Record<string, unknown>;

export const INVALID_TYPE = 'config-invalid-type';

export const UNKNOWN_FIELD = 'config-unknown-field';

export function isRawObject(value: unknown): value is RawObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function report(diagnostics: CliDiagnostic[], field: string, expected: string, value: unknown): null {
    diagnostics.push(cliError(INVALID_TYPE, `"${field}" must be ${expected} but received ${describe(value)}.`));

    return null;
}

export function describe(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    if (Array.isArray(value)) {
        return 'an array';
    }

    return `a ${typeof value}`;
}

export function readString(source: RawObject, field: string, diagnostics: CliDiagnostic[]): string | null {
    const value = source[field];

    if (value === undefined) {
        return null;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
        return report(diagnostics, field, 'a non-empty string', value);
    }

    return value.trim();
}

export function readNumber(source: RawObject, field: string, diagnostics: CliDiagnostic[]): number | null {
    const value = source[field];

    if (value === undefined) {
        return null;
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        return report(diagnostics, field, 'a positive integer', value);
    }

    return value;
}

export function readBoolean(source: RawObject, field: string, diagnostics: CliDiagnostic[]): boolean | null {
    const value = source[field];

    if (value === undefined) {
        return null;
    }

    if (typeof value !== 'boolean') {
        return report(diagnostics, field, 'a boolean', value);
    }

    return value;
}

export function readStringArray(source: RawObject, field: string, diagnostics: CliDiagnostic[]): string[] | null {
    const value = source[field];

    if (value === undefined) {
        return null;
    }

    if (!Array.isArray(value) || value.length === 0) {
        return report(diagnostics, field, 'a non-empty array of strings', value);
    }

    const entries = value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);

    if (entries.length !== value.length) {
        return report(diagnostics, field, 'a non-empty array of strings', value);
    }

    return entries.map((entry) => entry.trim());
}

export function readObject(source: RawObject, field: string, diagnostics: CliDiagnostic[]): RawObject | null {
    const value = source[field];

    if (value === undefined) {
        return null;
    }

    if (!isRawObject(value)) {
        return report(diagnostics, field, 'an object', value);
    }

    return value;
}

export function rejectUnknownFields(source: RawObject, known: readonly string[], scope: string, diagnostics: CliDiagnostic[]): void {
    for (const field of Object.keys(source)) {
        if (known.includes(field)) {
            continue;
        }

        diagnostics.push(cliError(UNKNOWN_FIELD, `"${scope}${field}" is not a known configuration field.`));
    }
}
