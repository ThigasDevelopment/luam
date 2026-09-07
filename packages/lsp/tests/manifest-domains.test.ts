import { afterEach, describe, expect, it } from 'vitest';

import { migrateManifestSource } from '@compiler/manifest/manifest-migration';

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

function table(...lines: readonly string[]): string {
    return ['{', ...lines.map((line) => `    ${line}`), '}', ''].join('\n');
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

describe('section completion', () => {
    it('offers every section at the top level of the table', () => {
        const manifest = openManifest('{\n    \n}\n');

        expect(labels(manifest, '{\n    ')).toEqual(['info', 'environment', 'scripts', 'files', 'build']);
    });

    it('leaves out a section that is already written', () => {
        const manifest = openManifest('{\n    files = { },\n    \n}\n');

        expect(labels(manifest, 'files = { },\n    ')).not.toContain('files');
    });

    it('offers the members of environment and nothing from another section', () => {
        const manifest = openManifest('{\n    environment = {\n        \n    },\n}\n');
        const found = labels(manifest, 'environment = {\n        ');

        expect(found).toContain('secret');
        expect(found).toContain('strict');
        expect(found).toContain('oop');
        expect(found).toContain('libraries');
        expect(found).not.toContain('output');
    });

    it('offers the author keys the catalog names, and keeps the record open', () => {
        const manifest = openManifest('{\n    info = {\n        author = {  },\n    },\n}\n');

        expect(labels(manifest, 'author = { ')).toEqual(['name', 'discord', 'github', 'email']);
    });

    it('accepts an author key the catalog does not name', () => {
        const manifest = openManifest(table("info = { author = { name = 'a', twitch = 't' } },"));

        expect(codes(manifest)).toEqual([]);
    });

    it('offers the members of info', () => {
        const manifest = openManifest('{\n    info = {\n        \n    },\n}\n');

        expect(labels(manifest, 'info = {\n        ')).toEqual(['author', 'version', 'description', 'dependencies']);
    });

    it('offers the two members of a scripts entry', () => {
        const manifest = openManifest('{\n    scripts = {\n        {\n            \n        },\n    },\n}\n');

        expect(labels(manifest, '{\n            ')).toEqual(['path', 'type']);
    });

    it('offers exactly the three sides of a scripts entry', () => {
        const manifest = openManifest("{\n    scripts = {\n        { path = 'a.luam', type = '' },\n    },\n}\n");

        expect(labels(manifest, "type = '")).toEqual(['server', 'client', 'shared']);
    });

    it('offers the members of the build details', () => {
        const manifest = openManifest('{\n    build = {\n        details = {\n            \n        },\n    },\n}\n');

        expect(labels(manifest, 'details = {\n            ')).toEqual(['bundle', 'map', 'minify', 'obfuscate']);
    });

    it('offers booleans for a nested boolean option', () => {
        const manifest = openManifest('{\n    environment = {\n        strict = \n    },\n}\n');

        expect(labels(manifest, 'strict = ')).toEqual(['true', 'false']);
    });
});

describe('section hover', () => {
    it('names the full path of a nested option', () => {
        const manifest = openManifest(table('environment = { oop = true },'));

        expect(hoverText(manifest, 'environment = { ', 'oop')).toContain('environment.oop');
    });

    it('names the full path of a build switch', () => {
        const manifest = openManifest(table('build = { details = { bundle = true } },'));

        expect(hoverText(manifest, 'details = { ', 'bundle')).toContain('build.details.bundle');
    });

    it('names the runtime call that reads an author key back', () => {
        const manifest = openManifest(table("info = { author = { name = 'dracoN*', discord = 'draconzx' } },"));

        expect(codes(manifest)).toEqual([]);
        expect(hoverText(manifest, "name = 'dracoN*', ", 'discord')).toContain("getResourceInfo(resource, 'discord')");
    });

    it('describes an author key the catalog does not name', () => {
        const manifest = openManifest(table("info = { author = { name = 'dracoN*', twitch = 'drac' } },"));

        expect(hoverText(manifest, "name = 'dracoN*', ", 'twitch')).toContain('info.author.twitch: string');
        expect(hoverText(manifest, "name = 'dracoN*', ", 'twitch')).toContain('written to the generated file as an attribute');
    });

    it('says on the author record that its extra keys reach the info element', () => {
        const manifest = openManifest(table("info = { author = { name = 'dracoN*' } },"));

        expect(hoverText(manifest, 'info = { ', 'author')).toContain('Every extra key is emitted as an info attribute');
    });

    it('states the default of the field it hovers', () => {
        const manifest = openManifest(table("build = { output = 'build' },"));

        expect(hoverText(manifest, 'build = { ', 'output')).toContain("Default: `'build'`");
    });
});

describe('manifest diagnostics in the editor', () => {
    it('reports a removed field where it is written', () => {
        const manifest = openManifest(table("sourceDirs = { 'src' },"));

        expect(codes(manifest)).toEqual(['config-removed-field']);
        expect(manifest.service.diagnostics(manifest.uri)[0]?.range.start.line).toBe(1);
    });

    it('puts the caret on a misspelled key rather than on its value', () => {
        const manifest = openManifest(table("builds = { output = 'build' },"));
        const [diagnostic] = manifest.service.diagnostics(manifest.uri);

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.range.start.character).toBe(4);
    });

    it('reports a pattern the grammar does not allow', () => {
        expect(codes(openManifest(table("scripts = { { path = 'src/{a,b}/*.luam', type = 'server' } },")))).toEqual(['config-invalid-pattern']);
    });

    it('names the assignment form and the command that rewrites it', () => {
        const manifest = openManifest("name = 'demo'\n");

        expect(codes(manifest)).toContain('config-manifest-form');
        expect(manifest.service.diagnostics(manifest.uri)[0]?.message).toContain('luam migrate');
    });

    it('accepts the full contract without a diagnostic', () => {
        const text = table(
            "info = { author = { name = 'you' }, version = '1.0.0', description = 'A demo' },",
            "environment = { strict = true, oop = false, secret = '.env', version = { server = '1.6.0' } },",
            "scripts = { { path = 'src/server/**/*.luam', type = 'server' } },",
            "files = { 'assets/**/*.png' },",
            "build = { output = 'build', details = { bundle = true } },",
        );

        expect(codes(openManifest(text))).toEqual([]);
    });
});

describe('project settings drive analysis', () => {
    const HUD = 'ui/hud.luam';

    it('gives a file the side its scripts entry assigns', () => {
        const manifest = openManifest(table("scripts = { { path = 'ui/**/*.luam', type = 'client' } },"), { [HUD]: 'dxDrawText("hi", 1, 1)\n' });

        expect(manifest.service.environment(uriFor(manifest.root, HUD))).toBe('client');
        expect(manifest.service.diagnostics(uriFor(manifest.root, HUD))).toEqual([]);
    });

    it('reanalyzes open files when a compiler option changes', () => {
        const manifest = openManifest('{ }\n', { 'src/server/main.luam': 'local unused = 1\n' });
        const source = uriFor(manifest.root, 'src/server/main.luam');

        expect(manifest.service.diagnostics(source)).toEqual([]);

        manifest.service.update(manifest.uri, 2, table('environment = { noUnusedLocals = true },'));

        expect(manifest.service.diagnostics(source).map((diagnostic) => diagnostic.code)).toEqual(['check-unused-local']);
    });

    it('types env against the environment file the manifest names', () => {
        const text = 'local players: number = env.MAX_PLAYERS\n\nprint(players)\n';
        const manifest = openManifest(table("environment = { secret = '.env.development' },"), {
            '.env': 'OTHER=1\n',
            '.env.development': 'MAX_PLAYERS=32\n',
            'src/server/main.luam': text,
        });
        const source = uriFor(manifest.root, 'src/server/main.luam');

        expect(manifest.service.diagnostics(source)).toEqual([]);
        expect(manifest.service.completion(source, markerAt(text, 'env.')).map((item) => item.label)).toEqual(['MAX_PLAYERS']);
    });

    it('falls back to the defaults when the manifest is invalid', () => {
        const manifest = openManifest(table("sourceDirs = { 'src' },"), { 'src/server/main.luam': 'kickPlayer(source)\n' });

        expect(manifest.service.environment(uriFor(manifest.root, 'src/server/main.luam'))).toBe('server');
    });

    it('gives a file in the workspace root the side its directive declares, and "shared" without one', () => {
        const manifest = openManifest('{ }\n', {
            'index.luam': 'function greet(): void\nend\n',
            'boot.luam': '#!server\n\nfunction boot(): void\nend\n',
        });

        expect(manifest.service.environment(uriFor(manifest.root, 'index.luam'))).toBe('shared');
        expect(manifest.service.environment(uriFor(manifest.root, 'boot.luam'))).toBe('server');
    });
});

describe('the migration code action', () => {
    const WHOLE: Parameters<LanguageService['codeActions']>[1] = { start: { line: 0, character: 0 }, end: { line: 4, character: 0 } };

    it('offers the rewrite on an assignment-form manifest', () => {
        const manifest = openManifest("name = 'demo'\nsources = { server = { 'src/**/*.luam' } }\n");
        const [action] = manifest.service.codeActions(manifest.uri, WHOLE);

        expect(action?.title).toBe('Rewrite this manifest as one table of sections');
        expect(action?.edit?.changes?.[manifest.uri]?.[0]?.newText).toContain("{ path = 'src/**/*.luam', type = 'server' }");
    });

    it('produces the same text the command writes', () => {
        const source = "name = 'demo'\ncompiler = { oop = true }\n";
        const manifest = openManifest(source);
        const [action] = manifest.service.codeActions(manifest.uri, WHOLE);

        expect(action?.edit?.changes?.[manifest.uri]?.[0]?.newText).toBe(migrateManifestSource(source).text);
    });

    it('offers nothing on a manifest already in the table form', () => {
        const manifest = openManifest(table("build = { output = 'build' },"));

        expect(manifest.service.codeActions(manifest.uri, WHOLE)).toEqual([]);
    });
});

describe('library completion', () => {
    const PACKAGE = JSON.stringify({ name: 'mta-async-fixture', version: '1.0.0', luam: { sources: { shared: ['src/**/*.luam'] } } }, null, 4);

    const SCOPED = JSON.stringify({ name: '@luam-fixture/collections', version: '1.0.0', luam: { sources: { shared: ['src/**/*.luam'] } } }, null, 4);

    const INSTALLED: Readonly<Record<string, string>> = {
        'node_modules/mta-async-fixture/package.json': `${PACKAGE}\n`,
        'node_modules/mta-async-fixture/src/async.luam': 'function fixtureDelay(): void\nend\n',
        'node_modules/@luam-fixture/collections/package.json': `${SCOPED}\n`,
        'node_modules/@luam-fixture/collections/src/list.luam': 'function fixtureList(): void\nend\n',
        'node_modules/plain-package/package.json': '{ "name": "plain-package", "version": "1.0.0" }\n',
    };

    it('offers every installed package that ships a Luam library', () => {
        const manifest = openManifest('{\n    environment = {\n        libraries = {\n            \n        },\n    },\n}\n', INSTALLED);

        expect(labels(manifest, 'libraries = {\n            ')).toEqual(["'@luam-fixture/collections'", "'mta-async-fixture'"]);
    });

    it('offers the same names unquoted inside an open string', () => {
        const manifest = openManifest("{\n    environment = {\n        libraries = { '' },\n    },\n}\n", INSTALLED);

        expect(labels(manifest, "libraries = { '")).toEqual(['@luam-fixture/collections', 'mta-async-fixture']);
    });

    it('leaves an installed package that ships no Luam library out', () => {
        const manifest = openManifest('{\n    environment = {\n        libraries = {\n            \n        },\n    },\n}\n', INSTALLED);

        expect(labels(manifest, 'libraries = {\n            ')).not.toContain("'plain-package'");
    });
});
