import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

const SERVER_FILE = '.luam.server';

function opened(text: string): { service: LanguageService; uri: string } {
    const root = createWorkspace({ [SERVER_FILE]: text });
    const service = new LanguageService();
    const uri = uriFor(root, SERVER_FILE);

    roots.push(root);
    service.update(uri, 1, text);

    return { service, uri };
}

function hoverText(text: string, marker: string, word: string): string {
    const file = opened(text);
    const contents = file.service.hover(file.uri, positionOf(text, marker, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function labels(text: string, marker: string): string[] {
    const file = opened(text);

    return file.service.completion(file.uri, markerAt(text, marker)).map((item) => item.label);
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('the server file in the editor', () => {
    it('reports its own diagnostics rather than the manifest ones', () => {
        const file = opened("serverPath = 'server'\noutDir = 'build'\n");
        const diagnostics = file.service.diagnostics(file.uri);

        expect(diagnostics.map((entry) => entry.code)).toEqual(['server-unknown-field']);
        expect(diagnostics[0]?.message).toContain('is not a ".luam.server" field');
        expect(diagnostics[0]?.message).toContain('"resourcesDir"');
    });

    it('reports a missing serverPath', () => {
        const file = opened("resourcesDir = 'resources'\n");

        expect(file.service.diagnostics(file.uri).map((entry) => entry.code)).toEqual(['config-missing-field']);
    });

    it('hovers a field with its summary, its type and whether it is required', () => {
        const text = "serverPath = 'server'\n";
        const hover = hoverText(text, '', 'serverPath');

        expect(hover).toContain('serverPath');
        expect(hover).toContain('string');
        expect(hover.toLowerCase()).toContain('required');
    });

    it('hovers a defaulted field with its default', () => {
        const text = "serverPath = 'server'\nresourcesDir = 'mods/deathmatch/resources'\n";

        expect(hoverText(text, '', 'resourcesDir')).toContain('mods/deathmatch/resources');
    });

    it('completes exactly the server fields at the top level', () => {
        const offered = labels('', '');

        expect(offered).toEqual(expect.arrayContaining(['serverPath', 'resourcesDir', 'executable', 'logs']));
        expect(offered).not.toContain('outDir');
        expect(offered).not.toContain('name');
    });

    it('completes exactly the log fields inside logs', () => {
        const text = "serverPath = 'server'\nlogs = {  }\n";
        const offered = labels(text, 'logs = { ');

        expect(offered).toEqual(expect.arrayContaining(['enabled', 'maxMessageLength', 'rateLimit', 'rateWindowMs']));
        expect(offered).not.toContain('serverPath');
    });
});
