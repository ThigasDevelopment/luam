import { describe, expect, it } from 'vitest';

import { formatSource } from '@compiler/format/format';
import { DEFAULT_FORMAT_OPTIONS } from '@compiler/format/format-options';
import { analyzeFormatterFile } from '@compiler/format/formatter-file';
import { findFormatterFile, resolveFormatterOptions, type FormatterFileSystem } from '@compiler/format/formatter-discovery';
import { compile } from '@compiler/index';

const NESTED = 'local function draw(): void\n    if visible then\n        return\n    end\nend\n';

const BLANKS = 'local a: number = 1\n\n\n\nlocal b: number = 2\n';

function options(source: string): ReturnType<typeof analyzeFormatterFile> {
    return analyzeFormatterFile(source, '/project');
}

function codes(source: string): string[] {
    return options(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function files(tree: Readonly<Record<string, string>>): FormatterFileSystem {
    return {
        exists: (path: string): boolean => tree[path] !== undefined,
        read: (path: string): string => tree[path] ?? '',
        join: (directory: string, name: string): string => `${directory}/${name}`,
        parent: (directory: string): string => (directory.lastIndexOf('/') <= 0 ? directory : directory.slice(0, directory.lastIndexOf('/'))),
    };
}

function withoutLayout(code: string | null): string {
    return (code ?? '')
        .replace(/\r\n/g, '\n')
        .replace(/^[ \t]+/gm, '')
        .split('\n')
        .filter((line) => line.length > 0)
        .join('\n');
}

describe('the formatter file', () => {
    it('defaults every field to what the formatter does without one', () => {
        expect(options('').options).toEqual(DEFAULT_FORMAT_OPTIONS);
        expect(codes('')).toEqual([]);
    });

    it('reads each field', () => {
        const source = ["indent = 'tab'", 'indentWidth = 2', 'keywordParenSpace = false', 'maxBlankLines = 2', "lineEnding = 'crlf'"].join('\n');

        expect(options(source).options).toEqual({ indent: 'tab', indentWidth: 2, keywordParenSpace: false, maxBlankLines: 2, lineEnding: 'crlf' });
    });

    it('reports an unknown field and names the fields there are', () => {
        const [diagnostic] = options('quoteStyle = "double"\n').diagnostics;

        expect(codes('quoteStyle = "double"\n')).toEqual(['formatter-unknown-field']);
        expect(diagnostic?.message).toBe(
            '"quoteStyle" is not a ".luam.formatter" field. The fields are "indent", "indentWidth", "keywordParenSpace", "maxBlankLines", "lineEnding".',
        );
        expect(diagnostic?.message).not.toContain('manifest');
    });

    it('reports a value outside the field', () => {
        expect(codes("indent = 'spaces'\n")).toEqual(['formatter-invalid-value']);
        expect(codes('indentWidth = 0\n')).toEqual(['formatter-invalid-value']);
        expect(codes('indentWidth = 99\n')).toEqual(['formatter-invalid-value']);
        expect(codes('maxBlankLines = -1\n')).toEqual(['formatter-invalid-value']);
        expect(codes('keywordParenSpace = 1\n')).toEqual(['formatter-invalid-value']);
        expect(codes("lineEnding = 'cr'\n")).toEqual(['formatter-invalid-value']);
    });

    it('reports a file that does not parse', () => {
        expect(codes('indent = \n')).toContain('formatter-parse-error');
    });
});

describe('the formatter file on disk', () => {
    it('finds the nearest one and lets it win entirely', () => {
        const tree = { '/project/.luam.formatter': 'indentWidth = 2\n', '/project/nested/.luam.formatter': "indent = 'tab'\n" };
        const resolved = resolveFormatterOptions(files(tree), '/project/nested/src');

        expect(resolved.path).toBe('/project/nested/.luam.formatter');
        expect(resolved.options).toEqual({ ...DEFAULT_FORMAT_OPTIONS, indent: 'tab' });
        expect(resolved.options.indentWidth).toBe(4);
    });

    it('walks up when the directory has none', () => {
        expect(findFormatterFile(files({ '/project/.luam.formatter': '' }), '/project/src/server')).toBe('/project/.luam.formatter');
    });

    it('uses the defaults when there is none above', () => {
        expect(resolveFormatterOptions(files({}), '/project/src').path).toBeNull();
        expect(resolveFormatterOptions(files({}), '/project/src').options).toEqual(DEFAULT_FORMAT_OPTIONS);
    });

    it('never reads one inside a library package', () => {
        const tree = { '/project/node_modules/lib/.luam.formatter': "indent = 'tab'\n", '/project/.luam.formatter': 'indentWidth = 2\n' };

        expect(findFormatterFile(files(tree), '/project/node_modules/lib/src')).toBeNull();
    });

    it('reports a file that does not parse and is not valid', () => {
        const resolved = resolveFormatterOptions(files({ '/project/.luam.formatter': 'indent = \n' }), '/project');

        expect(resolved.valid).toBe(false);
        expect(resolved.diagnostics.map((entry) => entry.code)).toContain('formatter-parse-error');
    });
});

describe('the configured formatter', () => {
    it('indents with tabs', () => {
        expect(formatSource(NESTED, { indent: 'tab' })).toBe('local function draw(): void\n\tif visible then\n\t\treturn\n\tend\nend\n');
    });

    it('indents at the width it is given', () => {
        expect(formatSource(NESTED, { indentWidth: 2 })).toBe('local function draw(): void\n  if visible then\n    return\n  end\nend\n');
    });

    it('drops the space before a keyword paren and leaves a call tight', () => {
        const source = 'local render = function (value: number): void\n    print(value)\nend\n';

        expect(formatSource(source, { keywordParenSpace: false })).toBe('local render = function(value: number): void\n    print(value)\nend\n');
        expect(formatSource(source)).toBe(source);
    });

    it('keeps the blank-line run it is asked for', () => {
        expect(formatSource(BLANKS)).toBe('local a: number = 1\n\nlocal b: number = 2\n');
        expect(formatSource(BLANKS, { maxBlankLines: 0 })).toBe('local a: number = 1\nlocal b: number = 2\n');
        expect(formatSource(BLANKS, { maxBlankLines: 2 })).toBe('local a: number = 1\n\n\nlocal b: number = 2\n');
    });

    it('pins the line ending', () => {
        expect(formatSource('local a: number = 1\n', { lineEnding: 'crlf' })).toBe('local a: number = 1\r\n');
        expect(formatSource('local a: number = 1\r\n', { lineEnding: 'lf' })).toBe('local a: number = 1\n');
        expect(formatSource('local a: number = 1\r\n')).toBe('local a: number = 1\r\n');
    });

    it('is idempotent and keeps the compiled Lua under every configuration', () => {
        const source = 'local function draw(value: number): void\n\n\n    if value > 0 then\n        print(value)\n    end\nend\n';
        const configurations = [
            { indent: 'tab' as const },
            { indentWidth: 2 },
            { keywordParenSpace: false },
            { maxBlankLines: 0 },
            { maxBlankLines: 2 },
            { lineEnding: 'crlf' as const },
            { indent: 'tab' as const, keywordParenSpace: false, maxBlankLines: 0, lineEnding: 'lf' as const },
        ];
        const baseline = withoutLayout(compile(formatSource(source) ?? '', { filePath: 'src/shared/a.luam' }).code);

        for (const configuration of configurations) {
            const formatted = formatSource(source, configuration);

            expect(formatted, JSON.stringify(configuration)).not.toBeNull();
            expect(formatSource(formatted ?? '', configuration), JSON.stringify(configuration)).toBe(formatted);
            expect(withoutLayout(compile(formatted ?? '', { filePath: 'src/shared/a.luam' }).code), JSON.stringify(configuration)).toBe(baseline);
        }
    });
});
