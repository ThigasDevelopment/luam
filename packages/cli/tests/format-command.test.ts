import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runFormatCommand, type FormatContext } from '@cli/commands/format-command';
import { loadManifest } from '@cli/config/manifest-loader';
import { formatSource } from '@compiler/format/format';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const cliRoot = fileURLToPath(new URL('..', import.meta.url));

const repositoryRoot = join(cliRoot, '..', '..');

const CORPUS_ROOTS: readonly string[] = [join(repositoryRoot, 'docs', 'snippets'), join(repositoryRoot, 'packages', 'compiler', 'tests', 'fixtures')];

const UNFORMATTED = 'local function draw(): void\nif visible then\nreturn\nend\nend\n';

const FORMATTED = 'local function draw(): void\n    if visible then\n        return\n    end\nend\n';

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: FormatContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

function corpus(): string[] {
    const files: string[] = [];

    for (const root of CORPUS_ROOTS) {
        for (const found of readdirSync(root, { recursive: true, withFileTypes: true })) {
            if (found.isFile() && found.name.endsWith('.luam')) {
                files.push(join(found.parentPath, found.name));
            }
        }
    }

    return files.sort();
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('format command', () => {
    it('rewrites a file that differs and leaves a formatted one untouched', () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': UNFORMATTED, 'src/server/main.luam': FORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe(FORMATTED);
        expect(fixture.read('src/server/main.luam')).toBe(FORMATTED);
        expect(logger.text()).toContain('1 reformatted');
    });

    it('changes nothing on a second run', () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);

        const first = fixture.read('src/client/hud.luam');

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe(first);
    });

    it('writes what the formatter produces, which is what the editor applies', () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': UNFORMATTED });

        runFormatCommand(context, { check: false, paths: [] });

        expect(fixture.read('src/client/hud.luam')).toBe(formatSource(UNFORMATTED));
    });

    it('lists what differs, writes nothing, and exits one in check mode', () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: true, paths: [] })).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.read('src/client/hud.luam')).toBe(UNFORMATTED);
        expect(logger.lines).toContain('src/client/hud.luam');
        expect(logger.errors.join('\n')).toContain('Format failed');
    });

    it('exits zero in check mode when nothing differs', () => {
        const { context, logger } = harness(defaultProjectFiles());

        expect(runFormatCommand(context, { check: true, paths: [] })).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
    });

    it('warns about a file that does not parse and leaves it alone', () => {
        const broken = 'if true then\n';
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': broken });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe(broken);
        expect(logger.warnings.join('\n')).toContain('format-source-unparseable');
    });

    it('never formats library sources or generated output', () => {
        const files = {
            ...defaultProjectFiles(),
            'node_modules/luam-lib/src/shared/util.luam': UNFORMATTED,
            'build/luam-demo/src/shared/stale.luam': UNFORMATTED,
        };
        const { context, fixture } = harness(files);

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('node_modules/luam-lib/src/shared/util.luam')).toBe(UNFORMATTED);
        expect(fixture.read('build/luam-demo/src/shared/stale.luam')).toBe(UNFORMATTED);
    });

    it('formats declaration files that no source pattern matches', () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'config.d.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('config.d.luam')).toBe(FORMATTED);
    });

    it('never formats the manifest', () => {
        const { context, fixture } = harness(defaultProjectFiles());
        const manifest = fixture.read('.luam.manifest');

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('.luam.manifest')).toBe(manifest);
    });

    it('formats a path argument without a manifest', () => {
        const fixture = createProjectFixture({ 'lib/util.luam': UNFORMATTED });
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(runFormatCommand({ root: fixture.root, config: null, logger }, { check: false, paths: ['lib'] })).toBe(EXIT_OK);
        expect(fixture.read('lib/util.luam')).toBe(FORMATTED);
    });

    it('reports a path that does not exist', () => {
        const fixture = createProjectFixture({ 'lib/util.luam': FORMATTED });
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(runFormatCommand({ root: fixture.root, config: null, logger }, { check: false, paths: ['missing'] })).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.join('\n')).toContain('format-path-unreadable');
    });

    it('finds the repository corpus already formatted', () => {
        const files = corpus();
        const logger = createMemoryLogger();
        const paths = files.map((file) => relative(repositoryRoot, file));

        expect(files.length).toBeGreaterThan(40);
        expect(runFormatCommand({ root: repositoryRoot, config: null, logger }, { check: true, paths })).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(logger.lines.filter((line) => line.endsWith('.luam'))).toEqual([]);
    });

    it('leaves the corpus on disk untouched in check mode', () => {
        const before = corpus().map((file) => readFileSync(file, 'utf8'));

        runFormatCommand(
            { root: repositoryRoot, config: null, logger: createMemoryLogger() },
            { check: true, paths: corpus().map((file) => relative(repositoryRoot, file)) },
        );

        expect(corpus().map((file) => readFileSync(file, 'utf8'))).toEqual(before);
    });
});

describe('the formatter configuration', () => {
    it('formats to the style the nearest .luam.formatter names', () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), '.luam.formatter': "indent = 'tab'\n", 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe('local function draw(): void\n\tif visible then\n\t\treturn\n\tend\nend\n');
    });

    it('agrees with the formatter under a non-default configuration', () => {
        const style = { indent: 'tab' as const, keywordParenSpace: false, maxBlankLines: 0 };
        const configuration = ["indent = 'tab'", 'keywordParenSpace = false', 'maxBlankLines = 0'].join('\n');
        const source = 'local render = function (value: number): void\n\n\n    print(value)\nend\n';
        const { context, fixture } = harness({ ...defaultProjectFiles(), '.luam.formatter': `${configuration}\n`, 'src/client/hud.luam': source });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe(formatSource(source, style));
    });

    it('stops the run on a configuration that does not parse and writes nothing', () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), '.luam.formatter': 'indent = \n', 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_USAGE);
        expect(fixture.read('src/client/hud.luam')).toBe(UNFORMATTED);
        expect(logger.errors.join('\n')).toContain('formatter-parse-error');
    });

    it('stops the run on an unknown field', () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), '.luam.formatter': "quoteStyle = 'double'\n", 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_USAGE);
        expect(fixture.read('src/client/hud.luam')).toBe(UNFORMATTED);
        expect(logger.errors.join('\n')).toContain('formatter-unknown-field');
    });

    it('formats byte-identically to the defaults when there is no configuration', () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/client/hud.luam': UNFORMATTED });

        expect(runFormatCommand(context, { check: false, paths: [] })).toBe(EXIT_OK);
        expect(fixture.read('src/client/hud.luam')).toBe(formatSource(UNFORMATTED));
    });
});
