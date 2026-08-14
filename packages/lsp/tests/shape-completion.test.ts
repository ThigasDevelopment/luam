import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const FILE = pathToUri('/project/src/server/main.luam');

const TYPES = [
    'type Base = {',
    '    id: string',
    '}',
    '',
    'type SQLite = Base & {',
    '    kind: "sqlite"',
    '    sender: string',
    '}',
    '',
    'type MySQL = Base & {',
    '    kind: "mysql"',
    '    host: string',
    '}',
    '',
    'type Config = SQLite | MySQL',
    '',
].join('\n');

function completion(text: string, marker: string) {
    const service = new LanguageService();

    service.update(FILE, 1, text);

    return service.completion(FILE, markerAt(text, marker));
}

function labels(text: string, marker: string): string[] {
    return completion(text, marker).map((item) => item.label);
}

describe('intersection completion', () => {
    it('offers the keys merged from both parts', () => {
        const found = labels(`${TYPES}local one: SQLite = {}\none.`, 'one.');

        expect(found).toEqual(['id', 'kind', 'sender']);
    });
});

describe('union completion', () => {
    it('offers only the keys every member declares', () => {
        const found = labels(`${TYPES}local data: Config = {}\ndata.`, 'data.');

        expect(found).toEqual(['id', 'kind']);
    });

    it('offers nothing for a union of primitives', () => {
        const found = labels('local value: string | number = 1\nvalue.', 'value.');

        expect(found).not.toContain('id');
    });
});

describe('table literal completion', () => {
    it('offers the keys of the annotated type', () => {
        const found = labels(`${TYPES}local one: SQLite = { `, '= { ');

        expect(found.slice(0, 3)).toEqual(['id', 'kind', 'sender']);
    });

    it('inserts the key with its assignment', () => {
        const [first] = completion(`${TYPES}local one: SQLite = { `, '= { ');

        expect(first?.insertText).toBe('id = ');
        expect(first?.detail).toBe('id: string');
    });

    it('hides a key that is already written', () => {
        const found = labels(`${TYPES}local one: SQLite = { id = "a", `, '"a", ');

        expect(found.slice(0, 2)).toEqual(['kind', 'sender']);
    });

    it('offers every key of the union before a discriminant is written', () => {
        const found = labels(`${TYPES}local data: Config = { `, '= { ');

        expect(found.slice(0, 4)).toEqual(['id', 'kind', 'sender', 'host']);
    });

    it('narrows to one member once the discriminant is written', () => {
        const found = labels(`${TYPES}local data: Config = { kind = "mysql", `, '"mysql", ');

        expect(found.slice(0, 2)).toEqual(['id', 'host']);
        expect(found).not.toContain('sender');
    });

    it('narrows to the other member', () => {
        const found = labels(`${TYPES}local data: Config = { kind = "sqlite", `, '"sqlite", ');

        expect(found.slice(0, 2)).toEqual(['id', 'sender']);
        expect(found).not.toContain('host');
    });

    it('keeps the scope items available after the keys', () => {
        const found = labels(`${TYPES}local one: SQLite = { `, '= { ');

        expect(found).toContain('outputChatBox');
    });

    it('offers nothing extra in a class body', () => {
        const found = labels('class Adapter {\n    ', 'Adapter {\n    ');

        expect(found).not.toContain('id');
    });

    it('offers the keys of an interface', () => {
        const source = 'interface Row {\n    id: string\n    name: string\n}\n\nlocal row: Row = { ';
        const found = labels(source, '= { ');

        expect(found.slice(0, 2)).toEqual(['id', 'name']);
    });
});

describe('type position completion', () => {
    const TYPE_NAMES = ['Base', 'SQLite', 'MySQL', 'Config'];

    function offersOnlyTypes(text: string, marker: string): void {
        const found = labels(text, marker);

        expect(found).toContain('string');
        expect(found).not.toContain('outputChatBox');
        expect(found).not.toContain('pairs');
    }

    it('offers types on the right of a type alias', () => {
        offersOnlyTypes(`${TYPES}type Other = `, 'type Other = ');
        expect(labels(`${TYPES}type Other = `, 'type Other = ')).toEqual(expect.arrayContaining(TYPE_NAMES));
    });

    it('offers types after a union bar in an alias', () => {
        offersOnlyTypes(`${TYPES}type Other = SQLite | `, 'SQLite | ');
    });

    it('offers types after an intersection ampersand in an alias', () => {
        offersOnlyTypes(`${TYPES}type Other = Base & `, 'Base & ');
    });

    it('offers types for a key of an object type', () => {
        offersOnlyTypes(`${TYPES}type Other = {\n    id: `, 'id: ');
    });

    it('offers types for a key of a nested object type', () => {
        offersOnlyTypes(`${TYPES}type Other = {\n    owner: {\n        id: `, 'owner: {\n        id: ');
    });

    it('offers types after an intersection inside an alias body', () => {
        offersOnlyTypes(`${TYPES}type Other = Base & {\n    id: `, 'id: ');
    });

    it('still offers the scope where a value is expected', () => {
        const found = labels(`${TYPES}local value = `, 'local value = ');

        expect(found).toContain('outputChatBox');
    });
});

describe('type alias hover', () => {
    function hoverText(text: string, marker: string): string {
        const service = new LanguageService();

        service.update(FILE, 1, text);

        const hover = service.hover(FILE, markerAt(text, marker));

        return JSON.stringify(hover?.contents ?? '');
    }

    it('shows the union a type alias resolves to', () => {
        expect(hoverText(`${TYPES}local data: Config = {}\n`, 'local data: Confi')).toContain('type Config = SQLite | MySQL');
    });

    it('shows the intersection a type alias resolves to', () => {
        expect(hoverText(`${TYPES}local one: SQLite = {}\n`, 'local one: SQLi')).toContain("type SQLite = Base & { kind: 'sqlite', sender: string }");
    });

    it('shows the type parameters of a generic alias', () => {
        const text = 'type Result<T> = T | string\n\nlocal value: Result<number> = 1\n';

        expect(hoverText(text, 'local value: Resul')).toContain('type Result<T> = T | string');
    });
});
