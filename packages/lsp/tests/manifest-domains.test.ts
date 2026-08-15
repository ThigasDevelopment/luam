import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const MANIFEST = '.luam.manifest';

const roots: string[] = [];

interface Manifest {
    service: LanguageService;
    uri: string;
    text: string;
    root: string;
}

function openManifest(text: string, files: Readonly<Record<string, string>> = {}): Manifest {
    const root = createWorkspace({ [MANIFEST]: text, ...files });
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, uri: uriFor(root, MANIFEST), text, root };
}

function labels(manifest: Manifest, marker: string): string[] {
    return manifest.service.completion(manifest.uri, markerAt(manifest.text, marker)).map((item) => item.label);
}

function hoverText(manifest: Manifest, marker: string, word: string): string {
    const hover = manifest.service.hover(manifest.uri, positionOf(manifest.text, marker, word));

    return typeof hover?.contents === 'object' && 'value' in hover.contents ? hover.contents.value : '';
}

function codes(manifest: Manifest): string[] {
    return manifest.service.diagnostics(manifest.uri).map((diagnostic) => String(diagnostic.code));
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('domain completion', () => {
    it('offers every domain at the top level', () => {
        const manifest = openManifest("name = 'demo'\n\n");
        const found = labels(manifest, "name = 'demo'\n");

        expect(found).toContain('compilerOptions');
        expect(found).toContain('sources');
        expect(found).toContain('assets');
        expect(found).toContain('dependencies');
        expect(found).toContain('engine');
        expect(found).toContain('environment');
    });

    it('offers the members of compilerOptions and nothing from another domain', () => {
        const manifest = openManifest("name = 'demo'\ncompilerOptions = {\n    \n}\n");
        const found = labels(manifest, 'compilerOptions = {\n    ');

        expect(found).toContain('strict');
        expect(found).toContain('oop');
        expect(found).toContain('noUnusedLocals');
        expect(found).toContain('warningsAsErrors');
        expect(found).not.toContain('outDir');
    });

    it('offers the three sides of sources', () => {
        const manifest = openManifest("name = 'demo'\nsources = {\n    \n}\n");

        expect(labels(manifest, 'sources = {\n    ')).toEqual(['server', 'client', 'shared']);
    });

    it('offers the members of an asset entry', () => {
        const manifest = openManifest("name = 'demo'\nassets = {\n    {\n        \n    },\n}\n");
        const found = labels(manifest, '{\n        ');

        expect(found).toContain('from');
        expect(found).toContain('to');
    });

    it('offers the member of engine', () => {
        const manifest = openManifest("name = 'demo'\nengine = {\n    \n}\n");

        expect(labels(manifest, 'engine = {\n    ')).toEqual(['minVersion']);
    });

    it('offers the members of environment', () => {
        const manifest = openManifest("name = 'demo'\nenvironment = {\n    \n}\n");

        expect(labels(manifest, 'environment = {\n    ')).toEqual(['file', 'localFile']);
    });

    it('offers booleans for a nested boolean option', () => {
        const manifest = openManifest("name = 'demo'\ncompilerOptions = {\n    strict = \n}\n");

        expect(labels(manifest, 'strict = ')).toEqual(['true', 'false']);
    });

    it('leaves out a domain that is already assigned', () => {
        const manifest = openManifest("name = 'demo'\ndependencies = { }\n\n");

        expect(labels(manifest, 'dependencies = { }\n')).not.toContain('dependencies');
    });
});

describe('domain hover', () => {
    it('names the full path of a nested option', () => {
        const manifest = openManifest("name = 'demo'\ncompilerOptions = { oop = true }\n");

        expect(hoverText(manifest, 'compilerOptions = { ', 'oop')).toContain('compilerOptions.oop');
    });

    it('names the full path of a source side', () => {
        const manifest = openManifest("name = 'demo'\nsources = { server = { 'src/**/*.luam' } }\n");

        expect(hoverText(manifest, 'sources = { ', 'server')).toContain('sources.server');
    });
});

describe('domain diagnostics in the editor', () => {
    it('reports a removed field where it is written', () => {
        const manifest = openManifest("name = 'demo'\nsourceDirs = { 'src' }\n");

        expect(codes(manifest)).toEqual(['config-removed-field']);
        expect(manifest.service.diagnostics(manifest.uri)[0]?.range.start.line).toBe(1);
    });

    it('reports a pattern the grammar does not allow', () => {
        expect(codes(openManifest("name = 'demo'\nsources = { server = { 'src/{a,b}/*.luam' } }\n"))).toEqual(['config-invalid-pattern']);
    });

    it('accepts the full contract without a diagnostic', () => {
        const text = [
            "name = 'demo'",
            'compilerOptions = { strict = true, oop = false }',
            "sources = { server = { 'src/server/**/*.luam' } }",
            "assets = { { from = 'assets/**/*', to = 'assets' } }",
            "dependencies = { 'scoreboard' }",
            "engine = { minVersion = '1.6.0' }",
            "environment = { file = '.env', localFile = '.env.local' }",
            '',
        ].join('\n');

        expect(codes(openManifest(text))).toEqual([]);
    });
});

describe('project settings drive analysis', () => {
    const HUD = 'ui/hud.luam';

    it('gives a file the environment its sources mapping assigns', () => {
        const manifest = openManifest("name = 'demo'\nsources = { client = { 'ui/**/*.luam' } }\n", { [HUD]: 'dxDrawText("hi", 1, 1)\n' });

        expect(manifest.service.environment(uriFor(manifest.root, HUD))).toBe('client');
        expect(manifest.service.diagnostics(uriFor(manifest.root, HUD))).toEqual([]);
    });

    it('reanalyzes open files when a compiler option changes', () => {
        const manifest = openManifest("name = 'demo'\n", { 'src/server/main.luam': 'local unused = 1\n' });
        const source = uriFor(manifest.root, 'src/server/main.luam');

        expect(manifest.service.diagnostics(source)).toEqual([]);

        manifest.service.update(manifest.uri, 2, "name = 'demo'\ncompilerOptions = { noUnusedLocals = true }\n");

        expect(manifest.service.diagnostics(source).map((diagnostic) => diagnostic.code)).toEqual(['check-unused-local']);
    });

    it('types env against the environment file the manifest selects', () => {
        const text = 'local players: number = env.MAX_PLAYERS\n\nprint(players)\n';
        const manifest = openManifest("name = 'demo'\nenvironment = { file = '.env.development', localFile = '.env.development.local' }\n", {
            '.env': 'OTHER=1\n',
            '.env.development': 'MAX_PLAYERS=32\n',
            'src/server/main.luam': text,
        });
        const source = uriFor(manifest.root, 'src/server/main.luam');

        expect(manifest.service.diagnostics(source)).toEqual([]);
        expect(manifest.service.completion(source, markerAt(text, 'env.')).map((item) => item.label)).toEqual(['MAX_PLAYERS']);
    });

    it('falls back to the defaults when the manifest is invalid', () => {
        const manifest = openManifest("name = 'demo'\nsourceDirs = { 'src' }\n", { 'src/server/main.luam': 'kickPlayer(source)\n' });

        expect(manifest.service.environment(uriFor(manifest.root, 'src/server/main.luam'))).toBe('server');
    });
});
