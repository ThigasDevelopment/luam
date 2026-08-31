import { afterEach, describe, expect, it } from 'vitest';

import { runCompile } from '@cli/build/build-runner';
import { loadManifest } from '@cli/config/manifest-loader';
import type { FileDiagnostic } from '@compiler/project/module';

import { asyncPackage, collectionsPackage, consumerFiles, packageFiles, ASYNC, COLLECTIONS } from './support/library-fixture';
import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const RIVAL = 'mta-rival-fixture';

const MISUSED_METHOD = [
    'function report(): string',
    '    local list = new FixtureList()',
    '',
    "    list:add('x')",
    '',
    '    return list:describe()',
    'end',
    '',
].join('\n');

const MISUSED_DECLARATION = ['function report(): number', '    return fixtureLegacy()', 'end', ''].join('\n');

function compileFixture(files: Readonly<Record<string, string>>): { diagnostics: FileDiagnostic[]; configCodes: string[]; built: boolean } {
    const fixture = createProjectFixture(files);
    const config = loadManifest(fixture.root).config;

    fixtures.push(fixture);

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    const outcome = runCompile(fixture.root, config);

    return { diagnostics: outcome.fileDiagnostics, configCodes: outcome.diagnostics.map((entry) => entry.code), built: outcome.build !== null };
}

function codes(diagnostics: readonly FileDiagnostic[]): string[] {
    return diagnostics.map((entry) => entry.diagnostic.code);
}

function find(diagnostics: readonly FileDiagnostic[], code: string): FileDiagnostic | undefined {
    return diagnostics.find((entry) => entry.diagnostic.code === code);
}

function rivalPackage(source: string, side = 'shared'): Record<string, string> {
    return packageFiles(RIVAL, { sources: { [side]: ['src/**/*.luam'] } }, { 'src/rival.luam': source });
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('library diagnostics', () => {
    it('checks a call into a library class against the signature its source declares', () => {
        const result = compileFixture({
            ...consumerFiles([COLLECTIONS, ASYNC]),
            ...collectionsPackage(),
            ...asyncPackage(),
            'src/shared/main.luam': MISUSED_METHOD,
        });

        expect(find(result.diagnostics, 'check-type-mismatch')?.path).toBe('src/shared/main.luam');
        expect(find(result.diagnostics, 'check-type-mismatch')?.diagnostic.message).toContain('Argument 1 expects "number"');
    });

    it('takes the types of verbatim library Lua from the declaration file beside it', () => {
        const result = compileFixture({
            ...consumerFiles([COLLECTIONS, ASYNC]),
            ...collectionsPackage(),
            ...asyncPackage(),
            'src/shared/main.luam': MISUSED_DECLARATION,
        });

        expect(find(result.diagnostics, 'check-type-mismatch')?.diagnostic.message).toContain('received "string"');
    });

    it('fails the build with the package path when a library does not type check', () => {
        const broken = { 'src/list.luam': 'function describeList(): string\n    return 1\nend\n' };
        const result = compileFixture({
            ...consumerFiles([ASYNC]),
            ...asyncPackage(),
            ...packageFiles(RIVAL, { sources: { shared: ['src/**/*.luam'] } }, broken),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
            '.luam.manifest': consumerFiles([ASYNC, RIVAL])['.luam.manifest'] ?? '',
        });

        expect(result.built).toBe(false);
        expect(find(result.diagnostics, 'check-type-mismatch')?.path).toBe(`${RIVAL}/src/list.luam`);
    });

    it('reports a library symbol used from a side that cannot reach it', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...asyncPackage(),
            ...rivalPackage("function rivalOnly(): string\n    return 'server'\nend\n", 'server'),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': 'local label: string = rivalOnly()\n\ndxDrawText(label, 10, 10)\n',
        });

        expect(codes(result.diagnostics)).toContain('project-environment-import');
    });

    it('keeps a project global invisible to a library file', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...asyncPackage(),
            ...rivalPackage('function rivalOnly(): string\n    return projectSecret\nend\n'),
            'src/shared/main.luam': "projectSecret = 'visible'\n\nfunction report(): string\n    return projectSecret\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        expect(result.built).toBe(false);
        expect(find(result.diagnostics, 'project-library-project-reference')?.path).toBe(`${RIVAL}/src/rival.luam`);
    });

    it('reports an environment directive that disagrees with the library declaration', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...asyncPackage(),
            ...rivalPackage("#!client\n\nfunction rivalOnly(): string\n    return 'client'\nend\n"),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        expect(find(result.diagnostics, 'env-library-directive')?.path).toBe(`${RIVAL}/src/rival.luam`);
    });

    it('reports two libraries that claim one name on one side', () => {
        const result = compileFixture({
            ...consumerFiles([COLLECTIONS, ASYNC, RIVAL]),
            ...collectionsPackage(),
            ...asyncPackage(),
            ...rivalPackage("function describeList(): string\n    return 'rival'\nend\n"),
        });

        const collision = find(result.diagnostics, 'project-library-collision');

        expect(collision?.diagnostic.message).toContain(COLLECTIONS);
        expect(collision?.diagnostic.message).toContain(RIVAL);
        expect(collision?.diagnostic.message).toContain('"shared" side');
    });

    it('says nothing when two libraries claim one name on sides that never meet', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...packageFiles(ASYNC, { sources: { server: ['src/**/*.luam'] } }, { 'src/async.luam': "function bothSides(): string\n    return 'server'\nend\n" }),
            ...rivalPackage("function bothSides(): string\n    return 'client'\nend\n", 'client'),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        expect(codes(result.diagnostics)).not.toContain('project-library-collision');
    });

    it('reads a collision with a project file as the library intruding', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...asyncPackage(),
            ...rivalPackage("function report(): string\n    return 'rival'\nend\n"),
            'src/shared/main.luam': "function report(): string\n    return 'project'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        const collision = find(result.diagnostics, 'project-library-collision');

        expect(collision?.path).toBe(`${RIVAL}/src/rival.luam`);
        expect(collision?.diagnostic.message).toContain(`the library "${RIVAL}"`);
        expect(collision?.diagnostic.message).toContain('the project file "src/shared/main.luam"');
    });

    it('warns when a library claims a name the MTA API defines', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC, RIVAL]),
            ...asyncPackage(),
            ...rivalPackage("function getPlayerName(): string\n    return 'wrapped'\nend\n"),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        const shadow = find(result.diagnostics, 'project-library-shadows-api');

        expect(shadow?.diagnostic.severity).toBe('warning');
        expect(result.built).toBe(true);
    });

    it('reports a "loadOrder" entry that names a library file', () => {
        const result = compileFixture({
            ...consumerFiles([ASYNC], { loadOrder: [`${ASYNC}/src/async.luam`] }),
            ...asyncPackage(),
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        expect(codes(result.diagnostics)).toContain('project-load-order-library');
    });
});
