import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { normalizeFsPath, pathToUri, uriToPath } from '@lsp/workspace/document-uri';
import { isManifestPath } from '@lsp/workspace/project-settings';
import { scanSources } from '@lsp/workspace/source-scanner';

import { createWorkspace, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

function workspace(files: Readonly<Record<string, string>>): string {
    const root = createWorkspace(files);

    roots.push(root);

    return root;
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        removeWorkspace(root);
    }
});

describe('document uri', () => {
    it('round trips a posix path', () => {
        expect(uriToPath(pathToUri('/project/src/server/main.luam'))).toBe('/project/src/server/main.luam');
    });

    it('round trips a windows path', () => {
        expect(uriToPath(pathToUri('C:\\project\\src\\server\\main.luam'))).toBe('C:/project/src/server/main.luam');
    });

    it('normalizes a lowercase drive letter', () => {
        expect(normalizeFsPath('c:/project/main.luam')).toBe('C:/project/main.luam');
    });
});

describe('source scanner', () => {
    it('finds every source file and skips ignored directories', () => {
        const root = workspace({
            'src/server/main.luam': 'local value = 1\n',
            'src/client/hud.luam': 'local value = 1\n',
            'node_modules/other/skip.luam': 'local value = 1\n',
            'src/server/main.lua': 'local value = 1\n',
        });

        const found = scanSources([root]).map((file) => file.path.slice(normalizeFsPath(root).length));

        expect(found).toEqual(['/src/client/hud.luam', '/src/server/main.luam']);
    });
});

describe('workspace loading', () => {
    it('resolves a definition into a file that was never opened', () => {
        const root = workspace({
            'src/shared/util.luam': 'function sharedHelper(): void\nend\n',
            'src/server/main.luam': 'sharedHelper()\n',
        });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const uri = uriFor(root, 'src/server/main.luam');
        const text = 'sharedHelper()\n';
        const locations = service.definition(uri, positionOf(text, '', 'sharedHelper'));

        expect(locations.map((location) => location.uri)).toContain(uriFor(root, 'src/shared/util.luam'));
    });

    it('resolves a parent class declared by another file', () => {
        const root = workspace({
            'src/shared/base.luam': 'class Base {\n    id: number = 0\n}\n',
            'src/server/derived.luam': 'class Derived extends Base {\n}\n',
        });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        expect(service.diagnostics(uriFor(root, 'src/server/derived.luam'))).toHaveLength(0);
    });

    it('reports a parent class no file declares', () => {
        const root = workspace({ 'src/server/derived.luam': 'class Derived extends Missing {\n}\n' });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const codes = service.diagnostics(uriFor(root, 'src/server/derived.luam')).map((diagnostic) => diagnostic.code);

        expect(codes).toEqual(['check-unknown-class']);
    });

    it('hides a client declaration from a server file', () => {
        const root = workspace({
            'src/client/base.luam': 'class ClientBase {\n}\n',
            'src/server/derived.luam': 'class Derived extends ClientBase {\n}\n',
        });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const codes = service.diagnostics(uriFor(root, 'src/server/derived.luam')).map((diagnostic) => diagnostic.code);

        expect(codes).toEqual(['check-unknown-class']);
    });

    it('does not report a duplicate when another file only references the class', () => {
        const root = workspace({
            'src/server/core.luam': 'class Core {\n}\n',
            'src/server/bootstrap.luam': 'local core: Core = new Core()\n',
        });
        const service = new LanguageService();
        const uri = uriFor(root, 'src/server/core.luam');

        service.loadWorkspace([root]);
        expect(service.diagnostics(uri)).toEqual([]);

        service.update(uri, 2, 'class Core {\n    id: number = 0\n}\n');
        service.refresh();

        expect(service.diagnostics(uri)).toEqual([]);
    });

    it('still reports a class two files declare', () => {
        const root = workspace({
            'src/server/core.luam': 'class Core {\n}\n',
            'src/server/copy.luam': 'class Core {\n}\n',
        });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const codes = [...service.diagnostics(uriFor(root, 'src/server/core.luam')), ...service.diagnostics(uriFor(root, 'src/server/copy.luam'))];

        expect(codes.map((diagnostic) => diagnostic.code)).toEqual(['check-duplicate-class']);
    });

    it('rechecks the files that see a declaration when it changes', () => {
        const root = workspace({
            'src/shared/base.luam': 'class Base {\n    id: number = 0\n}\n',
            'src/server/derived.luam': 'class Derived extends Base {\n}\n',
        });
        const service = new LanguageService();
        const baseUri = uriFor(root, 'src/shared/base.luam');
        const derivedUri = uriFor(root, 'src/server/derived.luam');

        service.loadWorkspace([root]);
        expect(service.diagnostics(derivedUri)).toEqual([]);

        const affected = service.update(baseUri, 2, 'class Renamed {\n}\n');

        expect(affected.map((analysis) => analysis.uri)).toContain(derivedUri);
        expect(service.diagnostics(derivedUri).map((diagnostic) => diagnostic.code)).toEqual(['check-unknown-class']);
    });

    it('rechecks nothing else when an edit keeps the declarations', () => {
        const root = workspace({
            'src/shared/base.luam': 'class Base {\n    id: number = 0\n}\n',
            'src/server/derived.luam': 'class Derived extends Base {\n}\n',
        });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const affected = service.update(uriFor(root, 'src/shared/base.luam'), 2, 'class Base {\n    id: number = 0\n}\n\nlocal unused = 1\n');

        expect(affected.map((analysis) => analysis.uri)).toEqual([uriFor(root, 'src/shared/base.luam')]);
    });

    it('keeps the open version of a file that was already scanned', () => {
        const root = workspace({ 'src/server/main.luam': 'local value: number = 1\n' });
        const service = new LanguageService();
        const uri = uriFor(root, 'src/server/main.luam');

        service.loadWorkspace([root]);
        expect(service.diagnostics(uri)).toHaveLength(0);

        service.update(uri, 2, 'local value: number = "text"\n');
        expect(service.diagnostics(uri)).toHaveLength(1);
    });

    it('rechecks documents after the OOP setting changes', () => {
        const root = workspace({ '.luam.manifest': "name = 'demo'\noop = true\n", 'src/server/main.luam': 'class Player {\n}\n' });
        const service = new LanguageService();
        const uri = uriFor(root, 'src/server/main.luam');

        service.loadWorkspace([root]);
        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.code)).toEqual(['check-duplicate-class']);

        service.update(uriFor(root, '.luam.manifest'), 2, "name = 'demo'\noop = false\n");

        expect(service.diagnostics(uri)).toEqual([]);
    });

    it('reads the OOP setting from the workspace manifest', () => {
        const root = workspace({ '.luam.manifest': "name = 'demo'\noop = true\n", 'src/server/main.luam': 'class Player {\n}\n' });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        expect(service.diagnostics(uriFor(root, 'src/server/main.luam')).map((diagnostic) => diagnostic.code)).toEqual(['check-duplicate-class']);
    });

    it('falls back to the defaults when the manifest omits the flag', () => {
        const root = workspace({ '.luam.manifest': "name = 'demo'\n", 'src/server/main.luam': 'class Player {\n}\n' });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        expect(service.diagnostics(uriFor(root, 'src/server/main.luam'))).toEqual([]);
    });

    it('recognizes a manifest by its file name', () => {
        expect(isManifestPath(join('project', '.luam.manifest'))).toBe(true);
        expect(isManifestPath(join('project', 'deploy.luam.manifest'))).toBe(true);
        expect(isManifestPath(join('project', 'src', 'server', 'main.luam'))).toBe(false);
    });

    it('drops declarations from a deleted file before refreshing diagnostics', () => {
        const root = workspace({ 'src/shared/old.luam': 'class Config {\n}\n' });
        const service = new LanguageService();
        const oldUri = uriFor(root, 'src/shared/old.luam');
        const newUri = uriFor(root, 'src/shared/new.luam');

        service.loadWorkspace([root]);
        service.update(newUri, 1, 'class Config {\n}\n');
        expect(service.diagnostics(newUri).map((diagnostic) => diagnostic.code)).toEqual(['check-duplicate-class']);

        service.close(oldUri);
        service.refresh();

        expect(service.diagnostics(newUri)).toHaveLength(0);
        expect(service.analysis(oldUri)).toBeNull();
    });
});
