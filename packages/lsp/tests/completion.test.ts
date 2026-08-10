import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { createWorkspace, markerAt, removeWorkspace } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const CLIENT_FILE = pathToUri('/project/src/client/hud.luam');

const SHARED_FILE = pathToUri('/project/src/shared/util.luam');

function labels(service: LanguageService, uri: string, text: string, marker: string): string[] {
    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

describe('completion', () => {
    it('offers server apis in a server file and hides client apis', () => {
        const text = 'local player = nil\nout\n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'out');

        expect(found).toContain('outputChatBox');
        expect(found).toContain('setElementHealth');
        expect(found).not.toContain('dxDrawText');
    });

    it('offers client apis in a client file and hides server apis', () => {
        const text = 'local hud = nil\ndx\n';
        const found = labels(new LanguageService(), CLIENT_FILE, text, 'dx');

        expect(found).toContain('dxDrawText');
        expect(found).not.toContain('kickPlayer');
    });

    it('offers only shared apis in a shared file', () => {
        const text = 'local value = 1\nget\n';
        const found = labels(new LanguageService(), SHARED_FILE, text, 'get');

        expect(found).toContain('getElementType');
        expect(found).not.toContain('dxDrawText');
        expect(found).not.toContain('kickPlayer');
    });

    it('offers locals, parameters, and keywords in scope', () => {
        const text = 'function greet(name: string): string\n    local prefix = "hi"\n    return prefix\nend\n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'return prefix');

        expect(found).toContain('prefix');
        expect(found).toContain('name');
        expect(found).toContain('greet');
        expect(found).toContain('local');
    });

    it('offers class fields after a dot on an instance', () => {
        const text = ['class Player {', '    name: string', '    greet(): void {', '    }', '}', '', 'local one = new Player()', 'one.'].join(
            '\n',
        );
        const found = labels(new LanguageService(), SERVER_FILE, text, 'one.');

        expect(found).toContain('name');
        expect(found).not.toContain('greet');
    });

    it('offers class methods after a colon on an instance', () => {
        const text = ['class Player {', '    name: string', '    greet(): void {', '    }', '}', '', 'local one = new Player()', 'one:'].join(
            '\n',
        );
        const found = labels(new LanguageService(), SERVER_FILE, text, 'one:');

        expect(found).toContain('greet');
        expect(found).not.toContain('name');
    });

    it('offers inherited class members', () => {
        const text = [
            'class Base {',
            '    health: number = 100',
            '}',
            '',
            'class Vip extends Base {',
            '    level: number = 1',
            '}',
            '',
            'local vip = new Vip()',
            'vip.',
        ].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, 'vip.');

        expect(found).toContain('level');
        expect(found).toContain('health');
    });

    it('offers enum members after a dot on the enum name', () => {
        const text = 'enum GameState {\n    LOBBY,\n    PLAYING,\n}\n\nlocal state = GameState.\n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'GameState.');

        expect(found).toEqual(['LOBBY', 'PLAYING']);
    });

    it('offers native extensions for a string receiver', () => {
        const text = 'local name: string = "thigas"\nname.\n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'name.');

        expect(found).toContain('trim');
        expect(found).toContain('upper');
        expect(found).not.toContain('count');
    });

    it('offers library members after a dot on a library name', () => {
        const text = 'local value = string.\n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'string.');

        expect(found).toContain('template');
        expect(found).toContain('format');
    });

    it('offers globals declared by a shared module in a server file', () => {
        const service = new LanguageService();

        service.update(SHARED_FILE, 1, 'function sharedHelper(): void\nend\n');

        const found = labels(service, SERVER_FILE, 'shared\n', 'shared');

        expect(found).toContain('sharedHelper');
    });

    it('hides globals declared by a client module from a server file', () => {
        const service = new LanguageService();

        service.update(CLIENT_FILE, 1, 'function clientHelper(): void\nend\n');

        const found = labels(service, SERVER_FILE, 'client\n', 'client');

        expect(found).not.toContain('clientHelper');
    });
});

describe('project environment completion', () => {
    const roots: string[] = [];

    function environmentService(): LanguageService {
        const root = createWorkspace({ '.env': 'SERVER_NAME="Luam"\nMAX_PLAYERS=32\n' });
        const service = new LanguageService();

        roots.push(root);
        service.loadWorkspace([root]);

        return service;
    }

    afterEach(() => {
        for (const root of roots.splice(0)) {
            removeWorkspace(root);
        }
    });

    it('offers the declared keys after "process.env." in a server file', () => {
        const found = labels(environmentService(), SERVER_FILE, 'local value = process.env.\n', 'process.env.');

        expect(found).toEqual(['MAX_PLAYERS', 'SERVER_NAME']);
    });

    it('offers "env" after "process." in a server file', () => {
        expect(labels(environmentService(), SERVER_FILE, 'local value = process.\n', 'process.')).toEqual(['env']);
    });

    it('offers nothing after "process." in a client file', () => {
        expect(labels(environmentService(), CLIENT_FILE, 'local value = process.\n', 'process.')).toEqual([]);
    });

    it('offers the declared keys after "env." in a server file', () => {
        expect(labels(environmentService(), SERVER_FILE, 'local value = env.\n', 'env.')).toEqual(['MAX_PLAYERS', 'SERVER_NAME']);
    });

    it('offers nothing after "env." in a client file', () => {
        expect(labels(environmentService(), CLIENT_FILE, 'local value = env.\n', 'env.')).toEqual([]);
    });

    it('reports the declared type of a key in the completion detail', () => {
        const service = environmentService();

        service.update(SERVER_FILE, 1, 'local value = process.env.\n');

        const items = service.completion(SERVER_FILE, markerAt('local value = process.env.\n', 'process.env.'));

        expect(items.map((item) => item.detail)).toEqual(['process.env.MAX_PLAYERS: number', 'process.env.SERVER_NAME: string']);
    });
});
