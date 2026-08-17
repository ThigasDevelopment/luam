import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const MANIFEST = '.luam.manifest';

const roots: string[] = [];

interface Manifest {
    service: LanguageService;
    uri: string;
    text: string;
}

function openManifest(text: string, files: Readonly<Record<string, string>> = {}): Manifest {
    const root = createWorkspace({ [MANIFEST]: text, ...files });
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, uri: uriFor(root, MANIFEST), text };
}

function labels(manifest: Manifest, marker: string): string[] {
    return manifest.service.completion(manifest.uri, markerAt(manifest.text, marker)).map((item) => item.label);
}

function hoverText(manifest: Manifest, marker: string, word: string): string {
    const hover = manifest.service.hover(manifest.uri, positionOf(manifest.text, marker, word));

    return typeof hover?.contents === 'object' && 'value' in hover.contents ? hover.contents.value : '';
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('manifest diagnostics', () => {
    it('publishes nothing for a valid manifest', () => {
        const manifest = openManifest("name = 'demo'\noutDir = 'build'\n");

        expect(manifest.service.diagnostics(manifest.uri)).toEqual([]);
    });

    it('points at an unknown field', () => {
        const manifest = openManifest("name = 'demo'\noutdir = 'build'\n");
        const [diagnostic] = manifest.service.diagnostics(manifest.uri);

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.range.start).toEqual({ line: 1, character: 0 });
    });

    it('points at the value that has the wrong type', () => {
        const manifest = openManifest("name = 'demo'\noutDir = 5\n");
        const [diagnostic] = manifest.service.diagnostics(manifest.uri);

        expect(diagnostic?.code).toBe('config-invalid-type');
        expect(diagnostic?.range.start).toEqual({ line: 1, character: 9 });
    });

    it('rejects a statement the dialect does not allow', () => {
        const manifest = openManifest("name = 'demo'\nreturn 1\n");

        expect(manifest.service.diagnostics(manifest.uri).map((diagnostic) => diagnostic.code)).toEqual(['config-invalid-statement']);
    });

    it('never reports the environment checks a source file gets', () => {
        const manifest = openManifest("name = 'demo'\ndescription = getPlayerFromName('bob')\n");

        expect(manifest.service.diagnostics(manifest.uri).map((diagnostic) => diagnostic.code)).toEqual(['config-invalid-expression']);
    });
});

describe('manifest completion', () => {
    it('offers the configuration fields at the top level', () => {
        const manifest = openManifest("name = 'demo'\nout\n");
        const found = labels(manifest, '\nout');

        expect(found).toContain('outDir');
        expect(found).toContain('sources');
        expect(found).toContain('transport');
    });

    it('leaves out a field that is already assigned', () => {
        const manifest = openManifest("name = 'demo'\noutDir = 'build'\n\n");

        expect(labels(manifest, "outDir = 'build'\n")).not.toContain('outDir');
    });

    it('offers the members of a nested table', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    \n}\n");
        const found = labels(manifest, 'transport = {\n    ');

        expect(found).toContain('kind');
        expect(found).toContain('host');
        expect(found).toContain('passwordEnv');
        expect(found).not.toContain('outDir');
    });

    it('offers the closed set of a field value', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    kind = \n}\n");

        expect(labels(manifest, 'kind = ')).toContain("'http'");
    });

    it('offers the closed set inside an open string', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    kind = ''\n}\n");

        expect(labels(manifest, "kind = '")).toEqual(['none', 'http']);
    });

    it('offers the build modes when comparing against mode', () => {
        const manifest = openManifest("name = 'demo'\noutDir = mode == '' and 'dist' or 'build'\n");

        expect(labels(manifest, "mode == '")).toEqual(['development', 'production']);
    });

    it('offers booleans for a boolean field and the injected values elsewhere', () => {
        const manifest = openManifest("name = 'demo'\ncompilerOptions = {\n    oop = \n}\nresourcesDir = \n");

        expect(labels(manifest, 'oop = ')).toEqual(['true', 'false']);
        expect(labels(manifest, 'resourcesDir = ')).toEqual(['mode', 'env', 'root']);
    });

    it('offers the keys declared in the environment file', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    password = env.\n}\n", { '.env': 'MTA_PASSWORD=secret\n' });

        expect(labels(manifest, 'env.')).toEqual(['MTA_PASSWORD']);
    });

    it('offers nothing inside a comment', () => {
        const manifest = openManifest("name = 'demo'\n# out\n");

        expect(labels(manifest, '# out')).toEqual([]);
    });
});

describe('manifest hover', () => {
    it('describes a top level field', () => {
        const manifest = openManifest("name = 'demo'\noutDir = 'build'\n");
        const value = hoverText(manifest, '\n', 'outDir');

        expect(value).toContain('outDir: string');
        expect(value).toContain("Default: `'build'`");
    });

    it('names a required field as required', () => {
        const manifest = openManifest("name = 'demo'\n");

        expect(hoverText(manifest, '', 'name')).toContain('Required.');
    });

    it('describes a nested field by its full path', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    port = 22005,\n}\n");

        expect(hoverText(manifest, '{\n', 'port')).toContain('transport.port: number');
    });

    it('describes an environment key as an optional string', () => {
        const manifest = openManifest("name = 'demo'\ntransport = {\n    password = env.MTA_PASSWORD,\n}\n");

        expect(hoverText(manifest, 'env.', 'MTA_PASSWORD')).toContain('env.MTA_PASSWORD: string?');
    });

    it('says nothing about a name the manifest does not define', () => {
        const manifest = openManifest("name = 'demo'\nlocal target = 'build'\n");

        expect(hoverText(manifest, 'local ', 'target')).toBe('');
    });
});
