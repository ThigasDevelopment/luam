import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function hoverText(text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const contents = service.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

describe('hover on a multi-return signature', () => {
    it('prints an authored tuple the way a catalog tuple prints', () => {
        const text = 'local function positions(): (number, number, number)\n    return 1, 2, 3\nend\n\nprint(positions())\n';

        expect(hoverText(text, 'print(positions())', 'positions')).toContain('(number, number, number)');
    });

    it('prints a catalog tuple the same way', () => {
        const text = 'local element = createObject(1337, 0, 0, 0)\n\nprint(getElementPosition(element))\n';

        expect(hoverText(text, 'print(getElementPosition', 'getElementPosition')).toContain('(number, number, number)');
    });
});
