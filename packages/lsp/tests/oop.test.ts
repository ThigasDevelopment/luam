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

    it('ranks values that match the parameter type of a native method first', () => {
        const text = 'local player = getPlayerFromName("bob")\nlocal amount = 50\nplayer:setHealth()\n';
        const workspace = openProject(true, { [SERVER_PATH]: text });
        const uri = workspace.uri(SERVER_PATH);

        workspace.service.update(uri, 2, text);

        const found = workspace.service.completion(uri, markerAt(text, 'player:setHealth('));

        expect(found.find((item) => item.label === 'amount')?.sortText).toBe('0amount');
        expect(found.find((item) => item.label === 'player')?.sortText).toBe('2player');
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

    it('separates properties and methods for an explicitly typed element', () => {
        const explicit = 'local player: Player = getRandomPlayer()\nplayer.\nplayer:\n';
        const workspace = openProject(true, { [SERVER_PATH]: explicit });
        const properties = labels(workspace, SERVER_PATH, explicit, 'player.');
        const methods = labels(workspace, SERVER_PATH, explicit, '\nplayer:');

        expect(properties).toContain('name');
        expect(properties).toContain('health');
        expect(properties).not.toContain('getName');
        expect(properties).not.toContain('getHealth');
        expect(methods).toContain('getName');
        expect(methods).toContain('getHealth');
        expect(methods).not.toContain('name');
        expect(methods).not.toContain('health');
    });

    it('offers static methods on an MTA class value', () => {
        const staticCall = 'local player = Player.getRandom()\nPlayer.\n';
        const workspace = openProject(true, { [SERVER_PATH]: staticCall });
        const found = labels(workspace, SERVER_PATH, staticCall, 'Player.');

        expect(found).toContain('getRandom');
        expect(found).not.toContain('getName');
        expect(found).not.toContain('name');
    });

    it('scopes static methods and class values by environment', () => {
        const source = 'Player.\n';
        const server = openProject(true, { [SERVER_PATH]: source });
        const client = openProject(true, { [CLIENT_PATH]: source });

        expect(labels(server, SERVER_PATH, source, 'Player.')).toContain('getRandom');
        expect(labels(client, CLIENT_PATH, source, 'Player.')).not.toContain('getRandom');
        expect(labels(server, SERVER_PATH, 'Fil\n', 'Fil')).toContain('File');
    });

    it('offers File static methods separately from instance members', () => {
        const source = 'File.\n';
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const found = labels(workspace, SERVER_PATH, source, 'File.');

        expect(found).toContain('new');
        expect(found).toContain('exists');
        expect(found).not.toContain('close');
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

    it('describes a static method and its procedural function', () => {
        const source = 'local player = Player.getRandom()\n';
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const hover = workspace.service.hover(workspace.uri(SERVER_PATH), positionOf(source, 'Player.', 'getRandom'));
        const value = typeof hover?.contents === 'object' && 'value' in hover.contents ? hover.contents.value : '';

        expect(value).toContain('Player.getRandom: fun(): Player');
        expect(value).toContain('wraps `getRandomPlayer` (server)');
    });
});

describe('oop signature help', () => {
    it('describes callable MTA classes', () => {
        const source = 'local file = File(\n';
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const help = workspace.service.signatureHelp(workspace.uri(SERVER_PATH), markerAt(source, 'File('));

        expect(help?.signatures[0]?.label).toBe('File(argument1: string): File');
    });

    it('describes static MTA methods', () => {
        const source = 'local player = Player.getRandom(\n';
        const workspace = openProject(true, { [SERVER_PATH]: source });
        const help = workspace.service.signatureHelp(workspace.uri(SERVER_PATH), markerAt(source, 'Player.getRandom('));

        expect(help?.signatures[0]?.label).toBe('Player.getRandom(): Player');
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
