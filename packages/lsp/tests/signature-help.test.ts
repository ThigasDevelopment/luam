import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');
const CLIENT_FILE = pathToUri('/project/src/client/main.luam');

function helpFor(text: string, marker: string, uri = SERVER_FILE): ReturnType<LanguageService['signatureHelp']> {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service.signatureHelp(uri, markerAt(text, marker));
}

describe('signature help', () => {
    it('names the parameters of an mta function instead of listing bare types', () => {
        const help = helpFor('outputChatBox(\n', 'outputChatBox(');

        expect(help?.signatures[0]?.label).toContain('outputChatBox(text: string');
        expect(help?.signatures[0]?.label).toContain('colorCoded?');
        expect(help?.activeParameter).toBe(0);
    });

    it('uses environment-exact shared MTA signatures', () => {
        const server = helpFor('addCommandHandler(\n', 'addCommandHandler(')?.signatures[0]?.label;
        const client = helpFor('addCommandHandler(\n', 'addCommandHandler(', CLIENT_FILE)?.signatures[0]?.label;

        expect(server).toContain('handlerFunction: function(Player, string');
        expect(client).toContain('handlerFunction: function(string');
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

    it('spells a multi-return out instead of naming the tuple kind', () => {
        const position = helpFor('getElementPosition(\n', 'getElementPosition(')?.signatures[0]?.label;

        expect(position).toBe('getElementPosition(theElement: Element): (number, number, number)');
        expect(position).not.toContain('tuple');
    });

    it('offers nothing outside a call and nothing inside a comment', () => {
        expect(helpFor('local value = 1\n', 'local value')).toBeNull();
        expect(helpFor('# outputChatBox(\n', 'outputChatBox(')).toBeNull();
    });

    it('offers nothing for a grouping paren that is not a call', () => {
        expect(helpFor('local value = (\n', '= (')).toBeNull();
    });
});
