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

function table(...lines: readonly string[]): string {
    return ['{', ...lines.map((line) => `    ${line}`), '}', ''].join('\n');
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
        const manifest = openManifest(table("build = { output = 'build' },"));

        expect(manifest.service.diagnostics(manifest.uri)).toEqual([]);
    });

    it('points at an unknown key rather than at its value', () => {
        const manifest = openManifest(table("outdir = 'build',"));
        const [diagnostic] = manifest.service.diagnostics(manifest.uri);

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.range.start).toEqual({ line: 1, character: 4 });
    });

    it('points at the value that has the wrong type', () => {
        const manifest = openManifest(table('build = { output = 5 },'));
        const [diagnostic] = manifest.service.diagnostics(manifest.uri);

        expect(diagnostic?.code).toBe('config-invalid-type');
        expect(diagnostic?.range.start.line).toBe(1);
    });

    it('rejects a statement the dialect does not allow', () => {
        const manifest = openManifest('return 1\n');

        expect(manifest.service.diagnostics(manifest.uri).map((diagnostic) => diagnostic.code)).toEqual(['config-unexpected-statement']);
    });

    it('never reports the environment checks a source file gets', () => {
        const manifest = openManifest(table("info = { description = getPlayerFromName('bob') },"));

        expect(manifest.service.diagnostics(manifest.uri).map((diagnostic) => diagnostic.code)).toEqual(['config-invalid-expression']);
    });
});

describe('manifest completion', () => {
    it('offers the sections at the top level', () => {
        const manifest = openManifest('{\n    bui\n}\n');
        const found = labels(manifest, '    bui');

        expect(found).toContain('build');
        expect(found).toContain('scripts');
        expect(found).toContain('files');
    });

    it('leaves out a section that is already written', () => {
        const manifest = openManifest('{\n    build = { },\n    \n}\n');

        expect(labels(manifest, 'build = { },\n    ')).not.toContain('build');
    });

    it('offers the members of a nested table', () => {
        const manifest = openManifest('{\n    build = {\n        \n    },\n}\n');
        const found = labels(manifest, 'build = {\n        ');

        expect(found).toContain('output');
        expect(found).toContain('details');
        expect(found).not.toContain('scripts');
    });

    it('offers the closed set of a field value', () => {
        const manifest = openManifest("{\n    scripts = { { path = 'a.luam', type =  } },\n}\n");

        expect(labels(manifest, 'type = ')).toContain("'server'");
    });

    it('offers the closed set inside an open string', () => {
        const manifest = openManifest("{\n    scripts = { { path = 'a.luam', type = '' } },\n}\n");

        expect(labels(manifest, "type = '")).toEqual(['server', 'client', 'shared']);
    });

    it('offers the build modes when comparing against mode', () => {
        const manifest = openManifest("{\n    build = { output = mode == '' and 'dist' or 'build' },\n}\n");

        expect(labels(manifest, "mode == '")).toEqual(['development', 'production']);
    });

    it('offers booleans for a boolean field and the injected values elsewhere', () => {
        const manifest = openManifest('{\n    environment = {\n        oop = \n    },\n\n    build = { output =  },\n}\n');

        expect(labels(manifest, 'oop = ')).toEqual(['true', 'false']);
        expect(labels(manifest, 'output = ')).toEqual(['mode', 'env', 'root']);
    });

    it('offers the keys declared in the environment file', () => {
        const manifest = openManifest('{\n    build = { output = env. },\n}\n', { '.env': 'MTA_PASSWORD=secret\n' });

        expect(labels(manifest, 'env.')).toEqual(['MTA_PASSWORD']);
    });

    it('offers nothing inside a comment', () => {
        const manifest = openManifest('{\n    # out\n}\n');

        expect(labels(manifest, '# out')).toEqual([]);
    });
});

describe('manifest hover', () => {
    it('describes a field of a section', () => {
        const manifest = openManifest(table("build = { output = 'build' },"));
        const value = hoverText(manifest, 'build = { ', 'output');

        expect(value).toContain('build.output: string');
        expect(value).toContain("Default: `'build'`");
    });

    it('names a required field as required', () => {
        const manifest = openManifest(table("info = { author = { name = 'you' } },"));

        expect(hoverText(manifest, 'author = { ', 'name')).toContain('Required.');
    });

    it('describes a nested field by its full path', () => {
        const manifest = openManifest(table('build = {', '    details = { map = true },', '},'));

        expect(hoverText(manifest, 'details = { ', 'map')).toContain('build.details.map: boolean');
    });

    it('describes an environment key as an optional string', () => {
        const manifest = openManifest('{\n    build = { output = env.MTA_OUT },\n}\n');

        expect(hoverText(manifest, 'env.', 'MTA_OUT')).toContain('env.MTA_OUT: string?');
    });

    it('says nothing about a name the manifest does not define', () => {
        const manifest = openManifest('{\n    build = { output = target },\n}\n');

        expect(hoverText(manifest, 'output = ', 'target')).toBe('');
    });
});
