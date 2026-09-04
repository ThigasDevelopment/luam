import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

const SHARED_A = "RESOURCE_A_NAME = 'a'\n\nfunction announceA(): void\nend\n";

const SHARED_B = "RESOURCE_B_NAME = 'b'\n\nfunction announceB(): void\nend\n";

function workspace(files: Readonly<Record<string, string>>): { service: LanguageService; root: string } {
    const root = createWorkspace(files);
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, root };
}

function twoResources(extra: Readonly<Record<string, string>> = {}): { service: LanguageService; root: string } {
    return workspace({
        'resource-a/.luam.manifest': "name = 'resource-a'\n",
        'resource-a/src/shared/api.luam': SHARED_A,
        'resource-a/src/server/main.luam': 'announceA()\n',
        'resource-b/.luam.manifest': "name = 'resource-b'\n",
        'resource-b/src/shared/api.luam': SHARED_B,
        'resource-b/src/server/main.luam': 'announceB()\n',
        ...extra,
    });
}

function codesFor(service: LanguageService, root: string, relative: string): string[] {
    return service.diagnostics(uriFor(root, relative)).map((diagnostic) => String(diagnostic.code ?? ''));
}

function labelsFor(service: LanguageService, root: string, relative: string, text: string): string[] {
    const uri = uriFor(root, relative);
    const lines = text.split('\n');

    service.update(uri, 2, text);

    return service.completion(uri, { line: lines.length - 2, character: (lines[lines.length - 2] ?? '').length }).map((item) => item.label);
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('a folder that holds two resources', () => {
    it('keeps one resource declarations out of the other', () => {
        const project = twoResources();

        expect(codesFor(project.service, project.root, 'resource-a/src/server/main.luam')).toEqual([]);
        expect(codesFor(project.service, project.root, 'resource-b/src/server/main.luam')).toEqual([]);

        const labels = labelsFor(project.service, project.root, 'resource-b/src/server/main.luam', 'announceB()\nannounce\n');

        expect(labels).toContain('announceB');
        expect(labels).not.toContain('announceA');
    });

    it('cannot reach a definition in the other resource', () => {
        const project = twoResources();
        const inA = uriFor(project.root, 'resource-a/src/server/main.luam');
        const inB = uriFor(project.root, 'resource-b/src/server/main.luam');

        project.service.update(inB, 2, 'announceA()\n');

        expect(project.service.definition(inA, { line: 0, character: 2 })).toHaveLength(1);
        expect(project.service.definition(inB, { line: 0, character: 2 })).toEqual([]);
    });

    it('does not check one resource under the other compiler options', () => {
        const project = twoResources({
            'resource-a/.luam.manifest': "name = 'resource-a'\ncompiler = { noUnusedLocals = true }\n",
            'resource-b/src/server/main.luam': 'local unread: number = 1\n\nannounceB()\n',
        });

        expect(codesFor(project.service, project.root, 'resource-b/src/server/main.luam')).toEqual([]);
        expect(codesFor(project.service, project.root, 'resource-a/src/server/main.luam')).toEqual([]);
    });

    it('resolves each file side against its own manifest root', () => {
        const project = twoResources({ 'resource-a/src/server/main.luam': 'announceA()\n\noutputChatBox(RESOURCE_A_NAME, root)\n' });

        expect(project.service.environment(uriFor(project.root, 'resource-a/src/server/main.luam'))).toBe('server');
        expect(codesFor(project.service, project.root, 'resource-a/src/server/main.luam')).toEqual([]);
    });

    it('re-analyses only the project whose manifest was saved', () => {
        const project = twoResources();
        const uri = uriFor(project.root, 'resource-a/.luam.manifest');
        const updated = project.service.update(uri, 2, "name = 'resource-a'\ncompiler = { strict = false }\n");
        const touched = updated.map((analysis) => analysis.path);

        expect(touched.some((path) => path.includes('resource-a'))).toBe(true);
        expect(touched.some((path) => path.includes('resource-b'))).toBe(false);
    });
});

describe('a file with no manifest above it', () => {
    it('analyses under the default settings', () => {
        const project = workspace({ 'src/server/main.luam': 'local value: number = 1\n\noutputChatBox(tostring(value), root)\n' });

        expect(codesFor(project.service, project.root, 'src/server/main.luam')).toEqual([]);
        expect(project.service.environment(uriFor(project.root, 'src/server/main.luam'))).toBe('server');
    });
});

describe('a project nested inside another', () => {
    it('is scoped to the nearer manifest', () => {
        const project = workspace({
            '.luam.manifest': "name = 'outer'\n",
            'src/shared/outer.luam': "OUTER_NAME = 'outer'\n\nfunction announceOuter(): void\nend\n",
            'inner/.luam.manifest': "name = 'inner'\n",
            'inner/src/shared/inner.luam': "INNER_NAME = 'inner'\n\nfunction announceInner(): void\nend\n",
            'inner/src/server/main.luam': 'announceInner()\n',
        });

        expect(codesFor(project.service, project.root, 'inner/src/server/main.luam')).toEqual([]);

        const labels = labelsFor(project.service, project.root, 'inner/src/server/main.luam', 'announceInner()\nannounce\n');

        expect(labels).toContain('announceInner');
        expect(labels).not.toContain('announceOuter');
    });
});

describe('a single resource directory', () => {
    it('behaves as it always has', () => {
        const project = workspace({
            '.luam.manifest': "name = 'only'\n",
            'src/shared/api.luam': SHARED_A,
            'src/server/main.luam': 'announceA()\n',
        });

        expect(codesFor(project.service, project.root, 'src/server/main.luam')).toEqual([]);
        expect(project.service.environment(uriFor(project.root, 'src/server/main.luam'))).toBe('server');
    });
});
