import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const SHARED_FILE = pathToUri('/project/src/shared/util.luam');

function serviceWith(text: string): LanguageService {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service;
}

describe('definition', () => {
    it('resolves a local to its declaration', () => {
        const text = 'local health: number = 100\nlocal copy = health\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'copy', 'health'));

        expect(locations).toHaveLength(1);
        expect(locations[0]?.range.start).toEqual({ line: 0, character: 6 });
    });

    it('resolves a parameter inside its function', () => {
        const text = 'function greet(name: string): string\n    return name\nend\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'return', 'name'));

        expect(locations[0]?.range.start).toEqual({ line: 0, character: 15 });
    });

    it('prefers the innermost declaration when a local is shadowed', () => {
        const text = 'local value = 1\nfunction run(): void\n    local value = 2\n    print(value)\nend\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'print(', 'value'));

        expect(locations[0]?.range.start.line).toBe(2);
    });

    it('resolves a class name to its declaration', () => {
        const text = 'class Player {\n    name: string\n}\n\nlocal one = new Player()\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'new ', 'Player'));

        expect(locations[0]?.range.start).toEqual({ line: 0, character: 6 });
    });

    it('resolves a class member through an instance', () => {
        const text = 'class Player {\n    name: string\n}\n\nlocal one = new Player()\nlocal value = one.name\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'one.', 'name'));

        expect(locations[0]?.range.start.line).toBe(1);
    });

    it('resolves a global declared in another file', () => {
        const service = new LanguageService();
        const text = 'sharedHelper()\n';

        service.update(SHARED_FILE, 1, 'function sharedHelper(): void\nend\n');
        service.update(SERVER_FILE, 1, text);

        const locations = service.definition(SERVER_FILE, positionOf(text, '', 'sharedHelper'));

        expect(locations.map((location) => location.uri)).toContain(SHARED_FILE);
    });
});

describe('references', () => {
    it('finds every use of a local including its declaration', () => {
        const text = 'local health = 100\nhealth = health + 1\nprint(health)\n';
        const locations = serviceWith(text).references(SERVER_FILE, positionOf(text, 'print(', 'health'));

        expect(locations).toHaveLength(4);
    });

    it('finds uses of a function across files', () => {
        const service = new LanguageService();
        const text = 'sharedHelper()\nsharedHelper()\n';

        service.update(SHARED_FILE, 1, 'function sharedHelper(): void\nend\n');
        service.update(SERVER_FILE, 1, text);

        const locations = service.references(SERVER_FILE, positionOf(text, '', 'sharedHelper'));
        const uris = locations.map((location) => location.uri);

        expect(uris.filter((uri) => uri === SERVER_FILE)).toHaveLength(2);
        expect(uris).toContain(SHARED_FILE);
    });

    it('keeps a shadowed local out of the outer results', () => {
        const text = 'local value = 1\nfunction run(): void\n    local value = 2\n    print(value)\nend\nprint(value)\n';
        const locations = serviceWith(text).references(SERVER_FILE, positionOf(text, '    print(', 'value'));

        expect(locations).toHaveLength(2);
        expect(locations.every((location) => location.range.start.line >= 2 && location.range.start.line <= 3)).toBe(true);
    });
});

describe('rename', () => {
    it('renames every occurrence of a local', () => {
        const text = 'local health = 100\nhealth = health + 1\n';
        const edit = serviceWith(text).rename(SERVER_FILE, positionOf(text, '', 'health'), 'hp');

        expect(edit?.changes?.[SERVER_FILE]).toHaveLength(3);
        expect(edit?.changes?.[SERVER_FILE]?.every((change) => change.newText === 'hp')).toBe(true);
    });

    it('renames a global across files', () => {
        const service = new LanguageService();
        const text = 'sharedHelper()\n';

        service.update(SHARED_FILE, 1, 'function sharedHelper(): void\nend\n');
        service.update(SERVER_FILE, 1, text);

        const edit = service.rename(SERVER_FILE, positionOf(text, '', 'sharedHelper'), 'helper');

        expect(Object.keys(edit?.changes ?? {}).sort()).toEqual([SERVER_FILE, SHARED_FILE].sort());
    });

    it('rejects a new name that is not an identifier', () => {
        const text = 'local health = 100\n';

        expect(serviceWith(text).rename(SERVER_FILE, positionOf(text, '', 'health'), '2hp')).toBeNull();
    });
});
