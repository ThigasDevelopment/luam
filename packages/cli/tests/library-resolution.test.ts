import { afterEach, describe, expect, it } from 'vitest';

import { resolveLibraries } from '@cli/build/library-resolution';
import { validateConfig } from '@cli/config/config-validation';
import { analyzeManifest } from '@compiler/manifest/manifest-analysis';

import { asyncPackage, collectionsPackage, consumerFiles, ASYNC, COLLECTIONS } from './support/library-fixture';
import { createProjectFixture, manifestSource, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function fixture(files: Readonly<Record<string, string>>): string {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created.root;
}

function codes(diagnostics: readonly { code: string }[]): string[] {
    return diagnostics.map((diagnostic) => diagnostic.code);
}

function manifestCodes(config: Readonly<Record<string, unknown>>): string[] {
    const analysis = analyzeManifest(manifestSource(config), { mode: 'check', root: '/project', env: {} });
    const validated = validateConfig(analysis.value, analysis.positions);

    return codes([...analysis.diagnostics, ...validated.diagnostics]);
}

afterEach(() => {
    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('library resolution', () => {
    it('resolves a listed package to its sources and their declared sides', () => {
        const root = fixture({ ...consumerFiles([COLLECTIONS, ASYNC]), ...collectionsPackage(), ...asyncPackage() });
        const resolved = resolveLibraries(root, [COLLECTIONS, ASYNC]);

        expect(resolved.diagnostics).toEqual([]);
        expect(resolved.libraries.map((library) => library.declaration.name)).toEqual([COLLECTIONS, ASYNC]);
        expect(resolved.files.map((file) => [file.path, file.environment])).toEqual([
            [`${COLLECTIONS}/src/legacy.d.luam`, 'shared'],
            [`${COLLECTIONS}/src/list.luam`, 'shared'],
            [`${COLLECTIONS}/client/hud.luam`, 'client'],
            [`${ASYNC}/src/async.luam`, 'shared'],
        ]);
        expect(resolved.verbatim.map((file) => file.origin.relativePath)).toEqual(['src/legacy.lua']);
    });

    it('reports a listed package that is not installed and names the install command', () => {
        const root = fixture(consumerFiles([COLLECTIONS]));
        const resolved = resolveLibraries(root, [COLLECTIONS]);

        expect(codes(resolved.diagnostics)).toEqual(['config-library-missing']);
        expect(resolved.diagnostics[0]?.message).toContain(`npm install ${COLLECTIONS}`);
        expect(resolved.files).toEqual([]);
    });

    it('leaves an installed package the manifest does not name unresolved', () => {
        const root = fixture({ ...consumerFiles([ASYNC]), ...collectionsPackage(), ...asyncPackage() });
        const resolved = resolveLibraries(root, [ASYNC]);

        expect(resolved.libraries.map((library) => library.declaration.name)).toEqual([ASYNC]);
        expect(resolved.files.every((file) => file.origin?.package === ASYNC)).toBe(true);
    });

    it('reports a package with no "luam" field', () => {
        const root = fixture({ ...consumerFiles([ASYNC]), 'node_modules/mta-async-fixture/package.json': '{ "name": "mta-async-fixture" }\n' });

        expect(codes(resolveLibraries(root, [ASYNC]).diagnostics)).toEqual(['config-library-invalid']);
    });

    it('reports a "luam" field that declares no sources', () => {
        const root = fixture({ ...consumerFiles([ASYNC]), ...asyncPackage(), ...packageWithout() });

        expect(codes(resolveLibraries(root, [ASYNC]).diagnostics)).toEqual(['config-library-invalid']);
    });

    it('reports a pattern that leaves the package directory', () => {
        const files = { ...consumerFiles([ASYNC]), ...asyncPackage(), ...escapingPackage() };

        expect(codes(resolveLibraries(fixture(files), [ASYNC]).diagnostics)).toEqual(['config-library-escape']);
    });

    it('reports a duplicate entry from the manifest', () => {
        expect(manifestCodes({ name: 'luam-demo', libraries: [COLLECTIONS, COLLECTIONS] })).toContain('config-library-duplicate');
    });

    it('reports an entry that is not a package name', () => {
        expect(manifestCodes({ name: 'luam-demo', libraries: ['Not A Package'] })).toContain('config-library-invalid');
    });

    it('reports a requirement the manifest does not list', () => {
        const root = fixture({ ...consumerFiles([COLLECTIONS]), ...collectionsPackage() });
        const resolved = resolveLibraries(root, [COLLECTIONS]);

        expect(codes(resolved.diagnostics)).toEqual(['config-library-requirement-missing']);
        expect(resolved.diagnostics[0]?.message).toContain(ASYNC);
    });

    it('accepts a requirement satisfied by a package listed later', () => {
        const root = fixture({ ...consumerFiles([COLLECTIONS, ASYNC]), ...collectionsPackage(), ...asyncPackage() });

        expect(resolveLibraries(root, [COLLECTIONS, ASYNC]).diagnostics).toEqual([]);
    });
});

function packageWithout(): Record<string, string> {
    return { 'node_modules/mta-async-fixture/package.json': '{ "name": "mta-async-fixture", "luam": { "requires": [] } }\n' };
}

function escapingPackage(): Record<string, string> {
    const luam = JSON.stringify({ sources: { shared: ['../outside/**/*.luam'] } });

    return { 'node_modules/mta-async-fixture/package.json': `{ "name": "mta-async-fixture", "luam": ${luam} }\n` };
}
