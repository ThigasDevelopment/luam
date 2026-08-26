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

    it('shows a comment immediately before a class field', () => {
        const text = 'class Counter {\n    # How many bumps happened.\n    total: number = 0\n}\n';

        expect(hoverText(text, 'total: number', 'total')).toContain('How many bumps happened.');
    });

    it('shows a comment immediately before a local', () => {
        const text = '# The current round.\nlocal round = 1\n';

        expect(hoverText(text, 'local round', 'round')).toContain('The current round.');
    });

    it('shows a comment immediately before a class', () => {
        const text = '# Counts things.\nclass Counter {\n}\n';

        expect(hoverText(text, 'class Counter', 'Counter')).toContain('Counts things.');
    });

    it('shows a comment immediately before an enum member', () => {
        const text = 'enum Colour {\n    # The warm one.\n    RED,\n}\n';

        expect(hoverText(text, 'RED,', 'RED')).toContain('The warm one.');
    });

    it('does not attach the comment of a function to its parameters', () => {
        const text = '# Greets a person.\nfunction greet(name: string): string\n    return name\nend\n';

        expect(hoverText(text, 'greet(name', 'name')).not.toContain('Greets a person.');
    });

    it('does not attach the comment of a loop to its variable', () => {
        const text = '# Counts up.\nfor index = 1, 10 do\nend\n';

        expect(hoverText(text, 'for index', 'index')).not.toContain('Counts up.');
    });

    it('shows a comment immediately before a type alias', () => {
        const text = '# The identifier of a round.\ntype RoundId = number\n';

        expect(hoverText(text, 'type RoundId', 'RoundId')).toContain('The identifier of a round.');
    });

    it('shows a comment immediately before a declared event', () => {
        const text = "# Fires when a match starts.\ndeclare event 'onMatchStart'(round: number)\n";

        expect(hoverText(text, "'onMatchStart'", 'onMatchStart')).toContain('Fires when a match starts.');
    });

    it('reads across the decorators of a member', () => {
        const text = 'class Counter {\n    # How many bumps happened.\n    @readonly\n    total: number = 0\n}\n';

        expect(hoverText(text, 'total: number', 'total')).toContain('How many bumps happened.');
    });
});
