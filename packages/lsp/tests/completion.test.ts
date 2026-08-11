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

    it('offers the keys of an object type after a dot', () => {
        const text = ['local args: { name: string, tag?: string } = {}', 'args.'].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, 'args.');

        expect(found).toContain('name');
        expect(found).toContain('tag');
    });

    it('offers the keys of an object type parameter inside the function body', () => {
        const text = ['function take(args: { name: string, tag?: string }): void', '    args.', 'end'].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, 'args.');

        expect(found).toContain('name');
        expect(found).toContain('tag');
    });

    it('offers the keys of an aliased object type inside a constructor body', () => {
        const text = ['type Args = { name: string }', 'class Teste {', '    constructor(args: Args) {', '        args.', '    }', '}'].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, 'args.');

        expect(found).toContain('name');
    });

    it('offers class members of a parameter inside the function body', () => {
        const text = ['class Player {', '    name: string', '}', 'function take(one: Player): void', '    one.', 'end'].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, '    one.');

        expect(found).toContain('name');
    });

    it('offers the keys of an object type nested in another object type', () => {
        const text = ['function make(): { owner: { id: number } }', '    return {}', 'end', '', 'local args = make()', 'args.owner.'].join('\n');
        const found = labels(new LanguageService(), SERVER_FILE, text, 'args.owner.');

        expect(found).toContain('id');
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

describe('class header completion', () => {
    it('offers extends and implements after a class name', () => {
        expect(labels(new LanguageService(), SERVER_FILE, 'class Vip \n', 'class Vip ')).toEqual(['extends', 'implements']);
    });

    it('offers only implements once the class already extends a base', () => {
        const text = 'class Base {\n}\n\nclass Vip extends Base \n';

        expect(labels(new LanguageService(), SERVER_FILE, text, 'class Vip extends Base ')).toEqual(['implements']);
    });

    it('offers declared classes after extends', () => {
        const text = 'class Base {\n}\n\ninterface Shape {\n}\n\nclass Vip extends \n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'class Vip extends ');

        expect(found).toContain('Base');
        expect(found).not.toContain('Shape');
        expect(found).not.toContain('Vip');
    });

    it('offers declared interfaces after implements', () => {
        const text = 'class Base {\n}\n\ninterface Shape {\n}\n\nclass Vip implements \n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'class Vip implements ');

        expect(found).toContain('Shape');
        expect(found).not.toContain('Base');
    });

    it('offers declared interfaces after a comma in an implements list', () => {
        const text = 'interface Shape {\n}\n\ninterface Named {\n}\n\nclass Vip implements Shape, \n';
        const found = labels(new LanguageService(), SERVER_FILE, text, 'implements Shape, ');

        expect(found).toContain('Named');
    });
});

describe('argument aware completion', () => {
    function rankOf(text: string, marker: string, label: string): string {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, text);

        const item = service.completion(SERVER_FILE, markerAt(text, marker)).find((candidate) => candidate.label === label);

        return item?.sortText?.slice(0, 1) ?? '';
    }

    const HANDLER = 'local root = getRootElement()\nlocal count = 1\naddEventHandler("onPlayerWasted", ';

    it('ranks element values first on the element argument of addEventHandler', () => {
        expect(rankOf(`${HANDLER})\n`, HANDLER, 'root')).toBe('0');
    });

    it('ranks functions that return an element after element values', () => {
        expect(rankOf(`${HANDLER})\n`, HANDLER, 'getRootElement')).toBe('1');
    });

    it('ranks unrelated values and keywords last', () => {
        expect(rankOf(`${HANDLER})\n`, HANDLER, 'count')).toBe('2');
        expect(rankOf(`${HANDLER})\n`, HANDLER, 'local')).toBe('2');
    });

    it('ranks values that match the declared parameter of a project function first', () => {
        const text = [
            'class Weapon {',
            '    name: string = "gun"',
            '}',
            '',
            'function equip(weapon: Weapon): void',
            'end',
            '',
            'local gun = new Weapon()',
            'local count = 2',
            'equip()',
        ].join('\n');

        expect(rankOf(text, 'equip(', 'gun')).toBe('0');
        expect(rankOf(text, 'equip(', 'count')).toBe('2');
    });

    it('leaves items unranked outside of a typed argument', () => {
        const text = 'local count = 1\nco\n';
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, text);

        const item = service.completion(SERVER_FILE, markerAt(text, '\nco')).find((candidate) => candidate.label === 'count');

        expect(item?.sortText).toBeUndefined();
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
