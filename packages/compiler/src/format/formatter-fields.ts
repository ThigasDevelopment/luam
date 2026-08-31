import { BOOLEAN_TYPE, NUMBER_TYPE, STRING_TYPE } from '@compiler/checker/types';
import { field, type ManifestField } from '@compiler/manifest/manifest-field';

import { DEFAULT_FORMAT_OPTIONS, MAX_BLANK_LINES, MAX_INDENT_WIDTH } from './format-options';

export const FORMATTER_FILE_NAME = '.luam.formatter';

export const INDENT_STYLES: readonly string[] = ['space', 'tab'];

export const LINE_ENDINGS: readonly string[] = ['infer', 'lf', 'crlf'];

export const FORMATTER_FIELDS: readonly ManifestField[] = [
    field('indent', STRING_TYPE, 'The indent character. "space" indents with spaces, "tab" with tabs.', {
        defaultValue: DEFAULT_FORMAT_OPTIONS.indent,
        values: INDENT_STYLES,
    }),
    field('indentWidth', NUMBER_TYPE, `Spaces per indent level, from 1 to ${MAX_INDENT_WIDTH}. Ignored when "indent" is "tab".`, {
        defaultValue: DEFAULT_FORMAT_OPTIONS.indentWidth,
    }),
    field('keywordParenSpace', BOOLEAN_TYPE, 'Whether a "(" that follows a keyword is preceded by a space, as in "function (".', {
        defaultValue: DEFAULT_FORMAT_OPTIONS.keywordParenSpace,
    }),
    field('maxBlankLines', NUMBER_TYPE, `Consecutive blank lines kept, from 0 to ${MAX_BLANK_LINES}.`, {
        defaultValue: DEFAULT_FORMAT_OPTIONS.maxBlankLines,
    }),
    field('lineEnding', STRING_TYPE, 'The line ending. "infer" follows the file, "lf" and "crlf" pin it.', {
        defaultValue: DEFAULT_FORMAT_OPTIONS.lineEnding,
        values: LINE_ENDINGS,
    }),
];

export const FORMATTER_FIELD_NAMES: readonly string[] = FORMATTER_FIELDS.map((entry) => entry.name);

export function isFormatterPath(path: string): boolean {
    return path.replace(/\\/g, '/').split('/').pop() === FORMATTER_FILE_NAME;
}
