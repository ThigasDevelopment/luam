import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { readProjectSettings } from '@lsp/workspace/project-settings';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const SERVER_PATH = 'src/server/main.luam';

const CLIENT_PATH = 'src/client/hud.luam';

const roots: string[] = [];

interface Workspace {
    service: LanguageService;
    uri: (relative: string) => string;
}

function openProject(oop: boolean, files: Readonly<Record<string, string>>): Workspace {
    const root = createWorkspace({ 'luam.json': JSON.stringify({ name: 'luam-demo', oop }), ...files });
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, uri: (relative: string): string => uriFor(root, relative) };
}

function labels(workspace: Workspace, path: string, text: string, marker: string): string[] {
    const uri = workspace.uri(path);

    workspace.service.update(uri, 2, text);

    return workspace.service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('oop completion', () => {
    const source = 'local player = getPlayerFromName("bob")\nplayer:get\n';

    it('offers the members of the element and the members it inherits', () => {
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const found = labels(workspace, SERVER_PATH, source, 'player:get');

        expect(found).toContain('getName');
        expect(found).toContain('getSerial');
        expect(found).toContain('getType');
    });

    it('scopes the members by environment', () => {
        const server = openProject(true, { [SERVER_PATH]: source });
        const client = openProject(true, { [CLIENT_PATH]: source });

        expect(labels(server, SERVER_PATH, source, 'player:get')).toContain('getSerial');
        expect(labels(server, SERVER_PATH, source, 'player:get')).not.toContain('getLighting');
        expect(labels(client, CLIENT_PATH, source, 'player:get')).toContain('getLighting');
        expect(labels(client, CLIENT_PATH, source, 'player:get')).not.toContain('getSerial');
    });

    it('names the procedural function in the item detail', () => {
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const uri = workspace.uri(SERVER_PATH);

        workspace.service.update(uri, 2, source);

        const item = workspace.service.completion(uri, markerAt(source, 'player:get')).find((entry) => entry.label === 'getName');

        expect(item?.detail).toBe('Player.getName: fun(): string — wraps getPlayerName (shared)');
    });

    it('offers nothing from the OOP surface when the flag is off', () => {
        const workspace = openProject(false, { [SERVER_PATH]: source });

        expect(labels(workspace, SERVER_PATH, source, 'player:get')).toEqual([]);
    });

    it('resolves a chained receiver through the element hierarchy', () => {
        const chained = 'local player = getPlayerFromName("bob")\nplayer.account:get\n';
        const workspace = openProject(true, { [SERVER_PATH]: chained });

        expect(labels(workspace, SERVER_PATH, chained, 'player.account:get')).toContain('getSerial');
    });
});

describe('oop hover', () => {
    const source = 'local player = getPlayerFromName("bob")\nlocal name = player:getName()\n';

    it('names the return type and the procedural function', () => {
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const uri = workspace.uri(SERVER_PATH);

        workspace.service.update(uri, 2, source);

        const hover = workspace.service.hover(uri, positionOf(source, 'player:', 'getName'));
        const value = typeof hover?.contents === 'object' && 'value' in hover.contents ? hover.contents.value : '';

        expect(value).toContain('Player.getName: fun(): string');
        expect(value).toContain('wraps `getPlayerName` (shared)');
    });

    it('says nothing about the OOP surface when the flag is off', () => {
        const workspace = openProject(false, { [SERVER_PATH]: source });
        const uri = workspace.uri(SERVER_PATH);

        workspace.service.update(uri, 2, source);

        expect(workspace.service.hover(uri, positionOf(source, 'player:', 'getName'))).toBeNull();
    });
});

describe('oop diagnostics in the editor', () => {
    it('publishes check-oop-disabled with the flag off and nothing with it on', () => {
        const source = 'local player = getPlayerFromName("bob")\nlocal name = player:getName()\n';
        const off = openProject(false, { [SERVER_PATH]: source });
        const on = openProject(true, { [SERVER_PATH]: source });

        expect(off.service.diagnostics(off.uri(SERVER_PATH)).map((entry) => entry.code)).toEqual(['check-oop-disabled']);
        expect(on.service.diagnostics(on.uri(SERVER_PATH))).toEqual([]);
    });
});

describe('project settings', () => {
    it('reads the oop flag and defaults it to false', () => {
        expect(readProjectSettings({ name: 'demo', oop: true })).toEqual({ oop: true });
        expect(readProjectSettings({ name: 'demo' })).toEqual({ oop: false });
        expect(readProjectSettings({ name: 'demo', oop: 'yes' })).toEqual({ oop: false });
        expect(readProjectSettings(['demo'])).toBeNull();
    });
});
