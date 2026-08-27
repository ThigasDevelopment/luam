import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

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

describe('api documentation', () => {
    it('describes what an mta function does instead of only naming its scope', () => {
        const text = 'outputChatBox("hi")\n';
        const hover = hoverText(text, 'outputChatBox', 'outputChatBox');

        expect(hover).toContain('outputs the specified text string to the chatbox');
        expect(hover).toContain('mta api (shared)');
    });

    it('names the parameters of an mta function in the hover signature', () => {
        const hover = hoverText('outputChatBox("hi")\n', 'outputChatBox', 'outputChatBox');

        expect(hover).toContain('function outputChatBox(text: string');
        expect(hover).toContain('colorCoded?');
    });

    it('lists the documented parameters and links the wiki page', () => {
        const hover = hoverText('outputChatBox("hi")\n', 'outputChatBox', 'outputChatBox');

        expect(hover).toContain('**Parameters**');
        expect(hover).toContain('`visibleTo`');
        expect(hover).toContain('https://wiki.multitheftauto.com/wiki/OutputChatBox');
    });

    it('documents the return value when the upstream declares one', () => {
        expect(hoverText('getPlayerName(source)\n', 'getPlayerName', 'getPlayerName')).toContain('**Returns**');
    });

    it('carries the same documentation into the completion item', () => {
        const service = new LanguageService();
        const text = 'outputCh\n';

        service.update(SERVER_FILE, 1, text);

        const item = service.completion(SERVER_FILE, markerAt(text, 'outputCh')).find((entry) => entry.label === 'outputChatBox');
        const documentation = item?.documentation;

        expect(item?.detail).toContain('text: string');
        expect(typeof documentation === 'object' && documentation !== null ? documentation.value : '').toContain('chatbox');
    });
});

describe('variable hover', () => {
    it('shows the inferred type and the literal value of a local', () => {
        const text = 'local maxPlayers = 32\nlocal copy = maxPlayers\n';

        expect(hoverText(text, 'copy', 'maxPlayers')).toContain('local maxPlayers: number = 32');
    });

    it('shows a string value quoted the way the language writes it, with its size', () => {
        const text = 'local title = "ready"\nlocal copy = title\n';

        expect(hoverText(text, 'copy', 'title')).toContain("local title: string = 'ready' # 5 bytes");
    });

    it('counts the bytes of a value rather than its characters', () => {
        const text = "local city = 'Assunção'\nlocal copy = city\n";

        expect(hoverText(text, 'copy', 'city')).toContain("local city: string = 'Assunção' # 10 bytes");
    });

    it('says byte in the singular for a value of one', () => {
        const text = "local tag = 'x'\nlocal copy = tag\n";

        expect(hoverText(text, 'copy', 'tag')).toContain("local tag: string = 'x' # 1 byte");
    });

    it('measures a field value on hover and leaves it out of the class shape', () => {
        const text = ['class Round {', "    version: string = '0.18.3'", '}', '', 'local round: Round = new Round()', 'local value = round.version', ''].join('\n');

        expect(hoverText(text, 'round.', 'version')).toContain("field version: string = '0.18.3' # 6 bytes");
        expect(hoverText(text, 'local round', 'Round')).toContain('version: string\n');
    });

    it('leaves a value that is not a literal unmeasured', () => {
        const text = ['class Round {', '    label: string = tostring(1)', '}', '', 'local round: Round = new Round()', 'local value = round.label', ''].join('\n');

        expect(hoverText(text, 'round.', 'label')).not.toContain('bytes');
    });

    it('shows the annotated type together with the value', () => {
        const text = 'local health: number = 100\nlocal copy = health\n';

        expect(hoverText(text, 'copy', 'health')).toContain('local health: number = 100');
    });

    it('shows the call that produced the value', () => {
        const text = 'local name = getPlayerName(source)\nlocal copy = name\n';

        expect(hoverText(text, 'copy', 'name')).toContain('= getPlayerName(source)');
    });

    it('leaves a local with no initializer without a value', () => {
        const text = 'local pending: string\nlocal copy = pending\n';

        expect(hoverText(text, 'copy', 'pending')).not.toContain('=');
    });

    it('leaves the value out when two locals share one statement', () => {
        const text = 'local first, second = 1, 2\nlocal copy = second\n';

        expect(hoverText(text, 'copy', 'second')).toContain('local second: number = 2');
    });
});

describe('self inside a class', () => {
    const account = ['class Account {', '    name: string', '', '    bump = function (amount: number): number', '        return amount', '    end', '}', ''];

    it('types self as the enclosing class in a method', () => {
        const text = `${[...account.slice(0, 4), '        return self.name and amount', ...account.slice(5)].join('\n')}`;

        expect(hoverText(text, 'return self', 'self')).toContain('self: Account');
    });

    it('suggests self inside an assignment-style class method', () => {
        const service = new LanguageService();
        const text = [...account.slice(0, 4), '        self', ...account.slice(5)].join('\n');

        service.update(SERVER_FILE, 1, text);

        expect(service.completion(SERVER_FILE, markerAt(text, '        self')).map((item) => item.label)).toContain('self');
    });

    it('suggests implicit self without an explicit method parameter', () => {
        const service = new LanguageService();
        const text = [
            'type TesteOptions = { name: string }',
            'class Teste {',
            '\tname: string',
            '',
            '\tconstructor = function (options: TesteOptions)',
            '\t\tself.name = options.name',
            '\tend',
            '',
            '\tdescribe = function (): string',
            '\t\tself.',
            '\tend',
            '}',
            "local teste = new Teste ({ name = 'Ola Mundo!' });",
        ].join('\n');

        service.update(SERVER_FILE, 1, text);

        expect(service.completion(SERVER_FILE, markerAt(text, '\t\tself.')).map((item) => item.label)).toContain('name');
    });

    it('separates class fields and methods after self', () => {
        const service = new LanguageService();
        const text = [...account.slice(0, 4), '        self.\n        self:', ...account.slice(5)].join('\n');

        service.update(SERVER_FILE, 1, text);

        expect(service.completion(SERVER_FILE, markerAt(text, 'self.')).map((item) => item.label)).toEqual(['name']);
        expect(service.completion(SERVER_FILE, markerAt(text, 'self:')).map((item) => item.label)).toEqual(['bump']);
    });

    it('keeps self typed inside a callback declared in a method', () => {
        const body = '        addEventHandler("onPlayerJoin", root, function()\n            return self.name\n        end)';
        const text = [...account.slice(0, 4), body, ...account.slice(5)].join('\n');

        expect(hoverText(text, 'return self', 'self')).toContain('self: Account');
    });
});
