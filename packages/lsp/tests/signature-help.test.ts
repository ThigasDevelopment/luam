import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function helpFor(text: string, marker: string): ReturnType<LanguageService['signatureHelp']> {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service.signatureHelp(SERVER_FILE, markerAt(text, marker));
}

describe('signature help', () => {
    it('names the parameters of an mta function instead of listing bare types', () => {
        const help = helpFor('outputChatBox(\n', 'outputChatBox(');

        expect(help?.signatures[0]?.label).toContain('outputChatBox(text: string');
        expect(help?.signatures[0]?.label).toContain('colorCoded?');
        expect(help?.activeParameter).toBe(0);
    });

    it('follows the cursor to the argument being typed', () => {
        expect(helpFor('outputChatBox("hi", root, 255, \n', '255, ')?.activeParameter).toBe(3);
    });

    it('documents the active parameter of an mta function', () => {
        const parameters = helpFor('outputChatBox(\n', 'outputChatBox(')?.signatures[0]?.parameters ?? [];
        const documentation = parameters[0]?.documentation;

        expect(typeof documentation === 'object' && documentation !== null ? documentation.value : '').toContain('text string');
    });

    it('links the wiki page in the signature documentation', () => {
        const documentation = helpFor('outputChatBox(\n', 'outputChatBox(')?.signatures[0]?.documentation;

        expect(typeof documentation === 'object' && documentation !== null ? documentation.value : '').toContain('chatbox');
    });

    it('describes a function declared in the same file', () => {
        const text = 'function greet(player: Player, times: number): string\n    return "hi"\nend\n\ngreet(root, \n';
        const help = helpFor(text, 'greet(root, ');

        expect(help?.signatures[0]?.label).toBe('greet(player: Player, times: number): string');
        expect(help?.activeParameter).toBe(1);
    });

    it('describes a generated setter parameter', () => {
        const text = 'class Player {\n    @Setter\n    name: string\n}\nlocal player = new Player()\nplayer:setName(\n';
        const help = helpFor(text, 'player:setName(');

        expect(help?.signatures[0]?.label).toBe('Player.setName(value: string): void');
    });

    it('offers nothing outside a call and nothing inside a comment', () => {
        expect(helpFor('local value = 1\n', 'local value')).toBeNull();
        expect(helpFor('-- outputChatBox(\n', 'outputChatBox(')).toBeNull();
    });

    it('offers nothing for a grouping paren that is not a call', () => {
        expect(helpFor('local value = (\n', '= (')).toBeNull();
    });
});
