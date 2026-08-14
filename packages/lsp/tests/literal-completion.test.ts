import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const FILE = pathToUri('/project/src/server/main.luam');

function labels(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(FILE, 1, text);

    return service.completion(FILE, markerAt(text, marker)).map((item) => item.label);
}

describe('string literal completion', () => {
    it('offers the members of a literal union on a local', () => {
        const found = labels("local a: 'string' | 'string-2' = '", "= '");

        expect(found).toEqual(['string', 'string-2']);
    });

    it('offers the single value of a literal type', () => {
        expect(labels("local mode: 'auto' = '", "= '")).toEqual(['auto']);
    });

    it('offers the values through an optional', () => {
        expect(labels("local mode: ('auto' | 'manual')? = '", "= '")).toEqual(['auto', 'manual']);
    });

    it('inserts the value without repeating the quotes', () => {
        const service = new LanguageService();
        const text = "local mode: 'auto' = '";

        service.update(FILE, 1, text);

        const [first] = service.completion(FILE, markerAt(text, "= '"));

        expect(first?.insertText).toBe('auto');
        expect(first?.detail).toBe("'auto'");
    });

    it('offers nothing when the type is a plain string', () => {
        expect(labels("local name: string = '", "= '")).toEqual([]);
    });

    it('offers the values of a key inside a table literal', () => {
        const source = ["type Config = {", "    mode: 'auto' | 'manual',", '    id: string', '}', '', 'local config: Config = { mode = \''].join('\n');

        expect(labels(source, "mode = '")).toEqual(['auto', 'manual']);
    });

    it('offers the values of a literal parameter', () => {
        const source = ["function connect(mode: 'tcp' | 'udp'): void\nend\n\nconnect('"].join('');

        expect(labels(source, "connect('")).toEqual(['tcp', 'udp']);
    });

    it('keeps event completion working', () => {
        const found = labels('addEventHandler("", root, function() end)\n', 'addEventHandler("');

        expect(found).toContain('onPlayerJoin');
    });

    it('offers nothing after a member assignment', () => {
        expect(labels("local config = {}\nconfig.mode = '", "mode = '")).toEqual([]);
    });
});
