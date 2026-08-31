export type IndentStyle = 'space' | 'tab';

export type LineEnding = 'infer' | 'lf' | 'crlf';

export interface FormatOptions {
    indent: IndentStyle;
    indentWidth: number;
    keywordParenSpace: boolean;
    maxBlankLines: number;
    lineEnding: LineEnding;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
    indent: 'space',
    indentWidth: 4,
    keywordParenSpace: true,
    maxBlankLines: 1,
    lineEnding: 'infer',
};

export const MAX_INDENT_WIDTH = 8;

export const MAX_BLANK_LINES = 4;

export function resolveFormatOptions(options: Partial<FormatOptions> = {}): FormatOptions {
    return { ...DEFAULT_FORMAT_OPTIONS, ...options };
}

export function indentUnit(options: FormatOptions): string {
    return options.indent === 'tab' ? '\t' : ' '.repeat(options.indentWidth);
}

export function newlineOf(source: string, options: FormatOptions): string {
    if (options.lineEnding === 'lf') {
        return '\n';
    }

    if (options.lineEnding === 'crlf') {
        return '\r\n';
    }

    return source.includes('\r\n') ? '\r\n' : '\n';
}
