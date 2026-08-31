import { createPosition, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { analyzeManifest, type ManifestSchema } from '@compiler/manifest/manifest-analysis';
import { manifestError, UNKNOWN_FIELD } from '@compiler/manifest/manifest-diagnostics';
import { positionAt, type PositionLookup } from '@compiler/manifest/manifest-rules';
import type { ManifestObject } from '@compiler/manifest/manifest-value';

import { DEFAULT_FORMAT_OPTIONS, MAX_BLANK_LINES, MAX_INDENT_WIDTH, type FormatOptions } from './format-options';
import { FORMATTER_FIELD_NAMES, FORMATTER_FIELDS, FORMATTER_FILE_NAME, INDENT_STYLES, LINE_ENDINGS } from './formatter-fields';

export const FORMATTER_UNKNOWN_FIELD = 'formatter-unknown-field';

export const FORMATTER_INVALID_VALUE = 'formatter-invalid-value';

export const FORMATTER_PARSE_ERROR = 'formatter-parse-error';

export interface FormatterAnalysis {
    options: FormatOptions;
    diagnostics: Diagnostic[];
}

const START = createPosition(1, 1, 0);

function boundedInteger(value: unknown, name: string, low: number, high: number, positions: PositionLookup, diagnostics: Diagnostic[]): number | null {
    if (value === undefined) {
        return null;
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < low || value > high) {
        diagnostics.push(manifestError(FORMATTER_INVALID_VALUE, `"${name}" must be a whole number from ${low} to ${high}.`, positionAt(positions, name)));

        return null;
    }

    return value;
}

function choice<Value extends string>(value: unknown, allowed: readonly string[]): Value | null {
    return typeof value === 'string' && allowed.includes(value) ? (value as Value) : null;
}

function retag(diagnostic: Diagnostic): Diagnostic {
    if (diagnostic.stage === 'lexer' || diagnostic.stage === 'parser') {
        return { ...diagnostic, stage: 'manifest', code: FORMATTER_PARSE_ERROR };
    }

    return { ...diagnostic, code: diagnostic.code === UNKNOWN_FIELD ? FORMATTER_UNKNOWN_FIELD : FORMATTER_INVALID_VALUE };
}

function unknownFieldMessage(name: string): string {
    const known = FORMATTER_FIELD_NAMES.map((entry) => `"${entry}"`).join(', ');

    return `"${name}" is not a "${FORMATTER_FILE_NAME}" field. The fields are ${known}.`;
}

export const FORMATTER_SCHEMA: ManifestSchema = {
    fields: FORMATTER_FIELDS,
    removed: {},
    normalize: (value: ManifestObject): { value: ManifestObject; diagnostics: Diagnostic[] } => ({ value, diagnostics: [] }),
    retag,
    unknownName: unknownFieldMessage,
};

export function analyzeFormatterFile(source: string, root: string): FormatterAnalysis {
    const analysis = analyzeManifest(source, { mode: 'format', root, env: {} }, FORMATTER_SCHEMA);
    const diagnostics = [...analysis.diagnostics];
    const raw = analysis.value;
    const width = boundedInteger(raw['indentWidth'], 'indentWidth', 1, MAX_INDENT_WIDTH, analysis.positions, diagnostics);
    const blanks = boundedInteger(raw['maxBlankLines'], 'maxBlankLines', 0, MAX_BLANK_LINES, analysis.positions, diagnostics);
    const keywordParenSpace = raw['keywordParenSpace'];

    return {
        options: {
            indent: choice<FormatOptions['indent']>(raw['indent'], INDENT_STYLES) ?? DEFAULT_FORMAT_OPTIONS.indent,
            indentWidth: width ?? DEFAULT_FORMAT_OPTIONS.indentWidth,
            keywordParenSpace: typeof keywordParenSpace === 'boolean' ? keywordParenSpace : DEFAULT_FORMAT_OPTIONS.keywordParenSpace,
            maxBlankLines: blanks ?? DEFAULT_FORMAT_OPTIONS.maxBlankLines,
            lineEnding: choice<FormatOptions['lineEnding']>(raw['lineEnding'], LINE_ENDINGS) ?? DEFAULT_FORMAT_OPTIONS.lineEnding,
        },
        diagnostics,
    };
}

export function formatterFileError(message: string): Diagnostic {
    return manifestError(FORMATTER_PARSE_ERROR, message, START);
}
