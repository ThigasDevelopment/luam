import { describe, expect, it } from 'vitest';

import { detectCapability, PLAIN_CAPABILITY, RICH_CAPABILITY } from '@cli/reporting/output-capability';
import { createOutputStyle, ERASE_LINE } from '@cli/reporting/output-style';
import { pluralize } from '@cli/reporting/plural';

import { createMemoryReporter, createTtyReporter } from './support/memory-logger';

const ESC = String.fromCharCode(27);

const TTY = { isTTY: true, columns: 120 };

describe('output capability', () => {
    it('enables colour and emoji on a terminal', () => {
        expect(detectCapability({ target: TTY, env: {} })).toEqual({ interactive: true, color: true, unicode: true, columns: 120 });
    });

    it('stays plain when the stream is not a terminal', () => {
        const capability = detectCapability({ target: { isTTY: false }, env: {} });

        expect(capability.interactive).toBe(false);
        expect(capability.color).toBe(false);
        expect(capability.unicode).toBe(false);
    });

    it('suppresses colour and emoji under NO_COLOR', () => {
        const capability = detectCapability({ target: TTY, env: { NO_COLOR: '1' } });

        expect(capability.interactive).toBe(true);
        expect(capability.color).toBe(false);
        expect(capability.unicode).toBe(false);
    });

    it('ignores an empty NO_COLOR', () => {
        expect(detectCapability({ target: TTY, env: { NO_COLOR: '' } }).color).toBe(true);
    });

    it('suppresses colour and emoji under --no-color', () => {
        const capability = detectCapability({ target: TTY, env: {}, noColor: true });

        expect(capability.color).toBe(false);
        expect(capability.unicode).toBe(false);
    });
});

describe('output style', () => {
    it('paints a tone with an escape sequence only when colour is on', () => {
        expect(createOutputStyle(RICH_CAPABILITY).paint('error', 'boom')).toBe(`${ESC}[31mboom${ESC}[0m`);
        expect(createOutputStyle(PLAIN_CAPABILITY).paint('error', 'boom')).toBe('boom');
    });

    it('degrades emoji markers to ASCII', () => {
        expect(createOutputStyle(RICH_CAPABILITY).marker('failure')).toBe('✖');
        expect(createOutputStyle({ ...RICH_CAPABILITY, unicode: false }).marker('failure')).toBe('x');
    });

    it('degrades the phase symbol to ASCII', () => {
        expect(createOutputStyle(RICH_CAPABILITY).phaseSymbol('compile')).toBe('⚙️');
        expect(createOutputStyle({ ...RICH_CAPABILITY, unicode: false }).phaseSymbol('compile')).toBe('>');
    });

    it('fills the bar in proportion to the count', () => {
        const style = createOutputStyle({ ...RICH_CAPABILITY, unicode: false });

        expect(style.bar(0, 10, 10)).toBe('..........');
        expect(style.bar(5, 10, 10)).toBe('#####.....');
        expect(style.bar(10, 10, 10)).toBe('##########');
        expect(style.bar(3, 0, 4)).toBe('....');
    });

    it('erases a line only on an interactive stream', () => {
        expect(createOutputStyle(RICH_CAPABILITY).eraseLine()).toBe(ERASE_LINE);
        expect(createOutputStyle(PLAIN_CAPABILITY).eraseLine()).toBe('');
    });
});

describe('reporter', () => {
    it('keeps piped output identical to the plain message', () => {
        const { reporter, logger } = createMemoryReporter();

        reporter.error('Build failed: 1 error, 0 warnings in 4 ms.');
        reporter.warn('Skipping sync.');
        reporter.success('Build passed.');
        reporter.detail('Total 4 ms');

        expect(logger.errors).toEqual(['Build failed: 1 error, 0 warnings in 4 ms.']);
        expect(logger.warnings).toEqual(['Skipping sync.']);
        expect(logger.lines).toEqual(['Build failed: 1 error, 0 warnings in 4 ms.', 'Skipping sync.', 'Build passed.', 'Total 4 ms']);
        expect(logger.text()).not.toContain(ESC);
    });

    it('marks and colours severity on a terminal', () => {
        const { reporter, logger } = createTtyReporter();

        reporter.error('boom');
        reporter.warn('careful');
        reporter.success('done');

        expect(logger.errors[0]).toBe(`${ESC}[31m✖${ESC}[0m ${ESC}[31mboom${ESC}[0m`);
        expect(logger.warnings[0]).toContain(`${ESC}[33m⚠`);
        expect(logger.lines[2]).toContain(`${ESC}[32m✔`);
    });

    it('uses ASCII markers and no colour on a terminal with --no-color', () => {
        const { reporter, logger } = createTtyReporter({ color: false, unicode: false });

        reporter.error('boom');

        expect(logger.errors).toEqual(['x boom']);
    });
});

describe('pluralize', () => {
    it('agrees with the count', () => {
        expect(pluralize(0, 'file')).toBe('0 files');
        expect(pluralize(1, 'file')).toBe('1 file');
        expect(pluralize(2, 'file')).toBe('2 files');
        expect(pluralize(1, 'more diagnostic')).toBe('1 more diagnostic');
    });
});
