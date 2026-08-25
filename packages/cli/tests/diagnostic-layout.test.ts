import { describe, expect, it } from 'vitest';

import { caretRow, readExcerpt } from '@cli/reporting/diagnostic-excerpt';
import { reportGroupedDiagnostics, splitHint } from '@cli/reporting/diagnostic-layout';
import { reportFileDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { RICH_CAPABILITY } from '@cli/reporting/output-capability';
import { createOutputStyle } from '@cli/reporting/output-style';
import { createDiagnostic, createPosition, type DiagnosticSeverity } from '@compiler/diagnostics/diagnostic';
import type { FileDiagnostic } from '@compiler/project/module';

import { createMemoryReporter, createTtyReporter } from './support/memory-logger';

const ESC = String.fromCharCode(27);

const style = createOutputStyle(RICH_CAPABILITY);

const SOURCE = ['local total: number = 1', 'announceJoin(total)', 'missingCall()', ''].join('\n');

function entry(path: string, line: number, column: number, code = 'check-unknown-name', severity: DiagnosticSeverity = 'error'): FileDiagnostic {
    const offset = line * 100 + column;

    return { path, diagnostic: createDiagnostic('checker', code, `"total" is not defined.`, createPosition(line, column, offset), severity) };
}

function sources(): Map<string, string> {
    return new Map([
        ['src/server/main.luam', SOURCE],
        ['src/client/hud.luam', SOURCE],
    ]);
}

describe('source excerpt', () => {
    it('reads the offending line and sizes the caret from the token', () => {
        const excerpt = readExcerpt(SOURCE, createPosition(2, 1, 24));

        expect(excerpt?.text).toBe('announceJoin(total)');
        expect(excerpt === null ? '' : caretRow(excerpt)).toBe('^'.repeat('announceJoin'.length));
    });

    it('falls back to a single caret off a token', () => {
        const excerpt = readExcerpt(SOURCE, createPosition(2, 13, 36));

        expect(excerpt === null ? '' : caretRow(excerpt)).toBe(`${' '.repeat(12)}^`);
    });

    it('indents the caret with the tabs the line uses', () => {
        const tabbed = ['local total: number = 1', '\t\ttotal.abs;', ''].join('\n');
        const excerpt = readExcerpt(tabbed, createPosition(2, 3, 26));

        expect(excerpt === null ? '' : caretRow(excerpt)).toBe('\t\t^^^^^');
    });

    it('survives a position at the start of the file', () => {
        const excerpt = readExcerpt(SOURCE, createPosition(1, 1, 0));

        expect(excerpt?.line).toBe(1);
        expect(excerpt === null ? '' : caretRow(excerpt)).toBe('^^^^^');
    });

    it('survives a line beyond the source and a missing source', () => {
        expect(readExcerpt(SOURCE, createPosition(99, 1, 0))).toBeNull();
        expect(readExcerpt(undefined, createPosition(1, 1, 0))).toBeNull();
        expect(readExcerpt(SOURCE, createPosition(0, 1, 0))).toBeNull();
    });

    it('clamps a column past the end of the line', () => {
        const excerpt = readExcerpt(SOURCE, createPosition(3, 999, 0));

        expect(excerpt?.caretColumn).toBe('missingCall()'.length + 1);
        expect(excerpt?.caretWidth).toBe(1);
    });
});

describe('hint extraction', () => {
    it('splits a trailing hint from the message', () => {
        const message = 'It expects "string" but received "nil". Annotate it "string?" to allow "nil".';

        expect(splitHint(message)).toEqual({ text: 'It expects "string" but received "nil".', hint: 'Annotate it "string?" to allow "nil".' });
    });

    it('leaves a single sentence alone', () => {
        expect(splitHint('"total" is not defined.')).toEqual({ text: '"total" is not defined.', hint: null });
    });
});

describe('grouped diagnostics on a terminal', () => {
    it('prints one path header and one entry per diagnostic', () => {
        const target = createTtyReporter();
        const entries = [entry('src/server/main.luam', 2, 1), entry('src/server/main.luam', 3, 1), entry('src/server/main.luam', 1, 7)];

        reportGroupedDiagnostics(target.reporter, entries, { sources: sources() });

        const headers = target.logger.lines.filter((line) => line.includes('src/server/main.luam') && !line.includes(':2:'));

        expect(headers.some((line) => line === style.paint('strong', 'src/server/main.luam'))).toBe(true);
        expect(target.logger.errors).toHaveLength(3);
    });

    it('shows the source line and a caret under the reported column', () => {
        const target = createTtyReporter({ color: false, unicode: false });

        reportGroupedDiagnostics(target.reporter, [entry('src/server/main.luam', 2, 14)], { sources: sources() });

        const block = target.logger.errors[0] ?? '';

        expect(block).toContain('announceJoin(total)');
        expect(block.split('\n')[2]).toContain(`${' '.repeat(13)}^^^^^`);
    });

    it('keeps a parseable location and the diagnostic code on every entry', () => {
        const target = createTtyReporter({ color: false, unicode: false });

        reportGroupedDiagnostics(target.reporter, [entry('src/server/main.luam', 2, 1)], { sources: sources() });

        expect(target.logger.errors[0]?.split('\n')[0]).toBe('  x src/server/main.luam:2:1 error check-unknown-name: "total" is not defined.');
    });

    it('routes a warning to the warning channel', () => {
        const target = createTtyReporter();

        reportGroupedDiagnostics(target.reporter, [entry('src/server/main.luam', 2, 1, 'check-unused', 'warning')], { sources: sources() });

        expect(target.logger.warnings).toHaveLength(1);
        expect(target.logger.errors).toHaveLength(0);
    });

    it('summarises the entries beyond the cap', () => {
        const target = createTtyReporter();
        const entries = Array.from({ length: 5 }, (_, index) => entry('src/server/main.luam', index + 1, 1));

        reportGroupedDiagnostics(target.reporter, entries, { sources: sources(), maxPerFile: 2 });

        expect(target.logger.errors).toHaveLength(2);
        expect(target.logger.text()).toContain('and 3 more diagnostics in this file.');
    });

    it('summarises the files beyond the cap', () => {
        const target = createTtyReporter();
        const entries = [entry('src/server/main.luam', 1, 1), entry('src/client/hud.luam', 1, 1)];

        reportGroupedDiagnostics(target.reporter, entries, { sources: sources(), maxFiles: 1 });

        expect(target.logger.errors).toHaveLength(1);
        expect(target.logger.text()).toContain('and 1 more file with diagnostics.');
    });

    it('renders the hint as its own line under the message', () => {
        const target = createTtyReporter({ color: false, unicode: false });
        const hinted: FileDiagnostic = {
            path: 'src/server/main.luam',
            diagnostic: createDiagnostic('checker', 'check-type-mismatch', 'It expects "string". Annotate it "string?".', createPosition(2, 1, 24)),
        };

        reportGroupedDiagnostics(target.reporter, [hinted], { sources: sources() });

        const block = target.logger.errors[0]?.split('\n') ?? [];

        expect(block[0]).toContain('It expects "string".');
        expect(block[0]).not.toContain('Annotate it');
        expect(block.at(-1)).toContain('Annotate it "string?".');
    });
});

describe('diagnostics with the output piped', () => {
    it('keeps one line per diagnostic in today\'s format', () => {
        const target = createMemoryReporter();
        const entries = [entry('src/server/main.luam', 2, 1), entry('src/client/hud.luam', 3, 4, 'check-unused', 'warning')];

        reportFileDiagnostics(target.reporter, entries, sources());

        expect(target.logger.lines).toEqual([
            'src/server/main.luam:2:1 error check-unknown-name: "total" is not defined.',
            'src/client/hud.luam:3:4 warning check-unused: "total" is not defined.',
        ]);
        expect(target.output()).not.toContain(ESC);
    });
});
