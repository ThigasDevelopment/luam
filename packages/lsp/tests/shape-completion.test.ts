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

    it('offers the shared keys inside a union literal', () => {
        const found = labels(`${TYPES}local data: Config = { `, '= { ');

        expect(found.slice(0, 2)).toEqual(['id', 'kind']);
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
