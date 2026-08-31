import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const IDENTITY = 'function identity<T>(value: T): T\n    return value\nend\n';

function hoverText(text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const contents = service.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

describe('a generic function in the editor', () => {
    it('shows its type parameters on hover', () => {
        const text = `${IDENTITY}local text = identity('a')\n`;

        expect(hoverText(text, 'local text', 'identity')).toContain('identity<T>(value: T): T');
    });

    it('shows the specialized type of a call result', () => {
        const text = `${IDENTITY}local text = identity('a')\nprint(text)\n`;

        expect(hoverText(text, 'print(', 'text')).toContain('string');
    });

    it('shows the type parameters of a generic method', () => {
        const text = 'class Reader {\n    read = function <T>(value: T): T\n        return value\n    end\n}\n';

        expect(hoverText(text, 'read = function', 'read')).toContain('read<T>(value: T): T');
    });

    it('reports no diagnostics on a generic declaration', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, IDENTITY);

        expect(service.diagnostics(SERVER_FILE)).toEqual([]);
    });
});
