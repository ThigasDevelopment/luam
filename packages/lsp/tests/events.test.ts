import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');
const CLIENT_FILE = pathToUri('/project/src/client/main.luam');

const roots: string[] = [];

function serviceFor(text: string, uri = SERVER_FILE): LanguageService {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service;
}

function completionAt(text: string, marker: string, uri = SERVER_FILE): { labels: string[]; details: string[] } {
    const items = serviceFor(text, uri).completion(uri, markerAt(text, marker));

    return { labels: items.map((item) => item.label), details: items.map((item) => item.detail ?? '') };
}

function hoverAt(text: string, marker: string, word: string, uri = SERVER_FILE): string {
    const contents = serviceFor(text, uri).hover(uri, positionOf(text, marker, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function labelAt(text: string, marker: string, uri = SERVER_FILE): string {
    return serviceFor(text, uri).signatureHelp(uri, markerAt(text, marker))?.signatures[0]?.label ?? '';
}

function eventProject(files: Readonly<Record<string, string>>): { service: LanguageService; root: string } {
    const root = createWorkspace({ '.luam.manifest': "name = 'events'\n", ...files });
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, root };
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('event callback typing', () => {
    it('suggests the built-in handler parameters of the named event', () => {
        const text = "addEventHandler('onPlayerQuit', root, function ()\nend)\n";
        const items = completionAt(text, 'function (');

        expect(items.labels).toEqual(['quitType: string, reason: string, responsibleElement: Element']);
    });

    it('resolves the handler parameters in the environment of the file', () => {
        const text = "addEventHandler('onClientPlayerWeaponFire', root, function ()\nend)\n";

        expect(completionAt(text, 'function (', CLIENT_FILE).labels).toEqual([
            'weapon: number, ammo: number, ammoInClip: number, hitX: number, hitY: number, hitZ: number, hitElement: Element, startX: number, startY: number, startZ: number',
        ]);
        expect(completionAt(text, 'function (').labels).not.toContain('weapon: number');
    });

    it('names the event callback parameters in signature help', () => {
        const label = labelAt("addEventHandler('onPlayerQuit', root, \n", "'onPlayerQuit', root, ");

        expect(label).toContain('handlerFunction: function(quitType: string, reason: string, responsibleElement: Element): void');
    });

    it('names the payload arguments of a built-in trigger in signature help', () => {
        const label = labelAt("triggerEvent('onPlayerQuit', root, \n", "'onPlayerQuit', root, ");

        expect(label).toBe('triggerEvent(eventName: string, baseElement: Element, quitType: string, reason: string, responsibleElement: Element): boolean');
    });

    it('describes a built-in event name under the cursor', () => {
        const text = "addEventHandler('onPlayerQuit', root, function ()\nend)\n";
        const hover = hoverAt(text, 'addEventHandler(', 'onPlayerQuit');

        expect(hover).toContain("event 'onPlayerQuit'(quitType: string, reason: string, responsibleElement: Element)");
        expect(hover).toContain('mta event (server)');
    });

    it('documents a built-in event name from the wiki catalog', () => {
        const text = "addEventHandler('onPlayerQuit', root, function ()\nend)\n";
        const hover = hoverAt(text, 'addEventHandler(', 'onPlayerQuit');

        expect(hover).toContain('This event is triggered when a player disconnects from the server.');
        expect(hover).toContain('**Parameters**');
        expect(hover).toContain('- `reason` — If the player was kicked or banned');
        expect(hover).toContain('**Source** — The source of this event is the player that left the server.');
        expect(hover).toContain('**Cancel effect** — This event cannot be canceled.');
        expect(hover).toContain('mta event (server) · [wiki](https://wiki.multitheftauto.com/wiki/OnPlayerQuit)');
    });

    it('keeps unknown event names permissive', () => {
        const text = "addEventHandler('onWhateverHappens', root, function ()\nend)\n";

        expect(completionAt(text, 'function (').labels).not.toContain('quitType: string');
        expect(hoverAt(text, 'addEventHandler(', 'onWhateverHappens')).toBe('');
    });
});

describe('declared event contracts', () => {
    const contract = "declare event 'onMatchStart'(player: Player, round: number, ...tags: string)\n";

    it('suggests the declared parameters of a project event across files', () => {
        const project = eventProject({
            'src/shared/events.d.luam': contract,
            'src/server/main.luam': "addEventHandler('onMatchStart', root, function ()\nend)\n",
        });
        const uri = uriFor(project.root, 'src/server/main.luam');
        const text = "addEventHandler('onMatchStart', root, function ()\nend)\n";
        const items = project.service.completion(uri, markerAt(text, 'function ('));

        expect(items.map((item) => item.label)).toEqual(['player: Player, round: number, ...: string']);
    });

    it('offers declared events before built-in events and shows their contract', () => {
        const project = eventProject({
            'src/shared/events.d.luam': contract,
            'src/server/main.luam': "addEventHandler('', root, function ()\nend)\n",
        });
        const uri = uriFor(project.root, 'src/server/main.luam');
        const text = "addEventHandler('', root, function ()\nend)\n";
        const items = project.service.completion(uri, markerAt(text, "addEventHandler('"));
        const declared = items.find((item) => item.label === 'onMatchStart');

        expect(declared?.detail).toBe("event 'onMatchStart'(player: Player, round: number, ...: string) — custom event (shared)");
        expect(items.map((item) => item.label)).toContain('onPlayerQuit');
    });

    it('describes a declared event name under the cursor with its origin', () => {
        const project = eventProject({
            'src/shared/events.d.luam': contract,
            'src/server/main.luam': "triggerEvent('onMatchStart', root)\n",
        });
        const uri = uriFor(project.root, 'src/server/main.luam');
        const text = "triggerEvent('onMatchStart', root)\n";
        const contents = project.service.hover(uri, positionOf(text, 'triggerEvent(', 'onMatchStart'))?.contents;
        const value = contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;

        expect(value).toContain("event 'onMatchStart'(player: Player, round: number, ...: string)");
        expect(value).toContain('custom event declared in src/shared/events.d.luam (shared)');
    });

    it('documents a declared event from the comment above its declaration', () => {
        const project = eventProject({
            'src/shared/events.d.luam': `# Fired when a new match begins.\n# The round counter starts at one.\n${contract}`,
            'src/server/main.luam': "triggerEvent('onMatchStart', root)\n",
        });
        const uri = uriFor(project.root, 'src/server/main.luam');
        const text = "triggerEvent('onMatchStart', root)\n";
        const contents = project.service.hover(uri, positionOf(text, 'triggerEvent(', 'onMatchStart'))?.contents;
        const value = contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;

        expect(value).toContain('Fired when a new match begins.\nThe round counter starts at one.');
        expect(value).toContain('custom event declared in src/shared/events.d.luam (shared)');
    });

    it('lists the target environment events of a cross-environment trigger', () => {
        const project = eventProject({
            'src/client/events.d.luam': "declare event 'onHudReady'(slot: number)\n",
            'src/server/main.luam': "triggerClientEvent(root, '', root)\n",
        });
        const uri = uriFor(project.root, 'src/server/main.luam');
        const text = "triggerClientEvent(root, '', root)\n";
        const labels = project.service.completion(uri, markerAt(text, "triggerClientEvent(root, '")).map((item) => item.label);

        expect(labels).toContain('onHudReady');
        expect(labels).toContain('onClientPlayerWeaponFire');
        expect(labels).not.toContain('onPlayerQuit');
    });

    it('reports a declared event in the document outline', () => {
        const service = serviceFor(contract);
        const symbols = service.documentSymbols(SERVER_FILE);

        expect(symbols.map((symbol) => symbol.name)).toEqual(['onMatchStart']);
        expect(symbols[0]?.detail).toBe("event 'onMatchStart'(player: Player, round: number, ...tags: string)");
    });

    it('keeps event names out of identifier completion', () => {
        const text = `${contract}local value = \n`;

        expect(completionAt(text, 'local value = ').labels).not.toContain('onMatchStart');
    });
});
