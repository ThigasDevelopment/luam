import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function hoverText(text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const contents = service.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    return contents !== undefined && typeof contents !== 'string' && !Array.isArray(contents) ? contents.value : '';
}

describe('hover documentation', () => {
    it('shows consecutive comments immediately before a function', () => {
        const text = '# Greets a person.\n# Supports an optional tag.\nfunction greet(name: string): string\n    return name\nend\n\ngreet("Thigas")\n';
        const hover = hoverText(text, '\ngreet(', 'greet');

        expect(hover).toContain('greet(name: string): string');
        expect(hover).toContain('Greets a person.\nSupports an optional tag.');
    });

    it('shows a comment immediately before a class method', () => {
        const text = 'class Thigas {\n    # Example\n    constructor = function ()\n    end\n}\n';
        const hover = hoverText(text, 'constructor =', 'constructor');

        expect(hover).toContain('constructor(): void');
        expect(hover).toContain('Example');
    });

    it('does not attach a comment separated by a blank line', () => {
        const text = '# Unrelated\n\nfunction greet(): void\nend\n';

        expect(hoverText(text, 'function ', 'greet')).not.toContain('Unrelated');
    });
});
