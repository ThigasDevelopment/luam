import { CompletionItemKind, InsertTextFormat, InsertTextMode } from 'vscode-languageserver';
import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const CLIENT_FILE = pathToUri('/project/src/client/hud.luam');

const ACCOUNT = ['class Account {', '    name: string', '', '    bump = function (amount: number): number', '        return amount', '    end', '}', ''].join('\n');

function labels(text: string, marker: string, uri: string = SERVER_FILE): string[] {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

function items(text: string, marker: string) {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service.completion(SERVER_FILE, markerAt(text, marker));
}

describe('event completion', () => {
    it('offers server events inside the name argument of addEventHandler', () => {
        const found = labels('addEventHandler("", root, function() end)\n', 'addEventHandler("');

        expect(found).toContain('onPlayerJoin');
        expect(found).toContain('onResourceStart');
        expect(found).not.toContain('outputChatBox');
    });

    it('hides server events from a client file and offers client events instead', () => {
        const found = labels('addEventHandler("", root, function() end)\n', 'addEventHandler("', CLIENT_FILE);

        expect(found).toContain('onClientRender');
        expect(found).not.toContain('onPlayerJoin');
    });

    it('offers an event declared with addEvent in the same file', () => {
        const text = 'addEvent("onAccountReady", true)\naddEventHandler("", root, function() end)\n';

        expect(labels(text, 'addEventHandler("')).toContain('onAccountReady');
    });

    it('offers events for the name argument of triggerEvent', () => {
        expect(labels('triggerEvent("", root)\n', 'triggerEvent("')).toContain('onPlayerJoin');
    });

    it('offers nothing inside a string that is not an event name', () => {
        expect(labels('local path = "src/main"\n', 'local path = "src')).toEqual([]);
        expect(labels('outputChatBox("")\n', 'outputChatBox("')).toEqual([]);
    });

    it('offers nothing inside a comment', () => {
        expect(labels('# out\n', '# out')).toEqual([]);
        expect(labels('#* outputChatBox(\n*#', 'outputChatBox(')).toEqual([]);
    });
});

describe('type completion', () => {
    it('offers only types after a local annotation colon', () => {
        const found = labels(`${ACCOUNT}local value: \n`, 'local value: ');

        expect(found).toContain('number');
        expect(found).toContain('Account');
        expect(found).toContain('Player');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types in a parameter annotation of a plain function', () => {
        const found = labels('function greet(player: )\nend\n', 'function greet(player: ');

        expect(found).toContain('Player');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types in a parameter annotation of a class method', () => {
        const found = labels('class Account {\n    bump = function (amount: )\n    end\n}\n', 'bump = function (amount: ');

        expect(found).toContain('number');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types in a return annotation', () => {
        const found = labels('function greet(name: string): \nend\n', 'function greet(name: string): ');

        expect(found).toContain('string');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types in a class field annotation', () => {
        const found = labels('class Account {\n    name: \n}\n', '    name: ');

        expect(found).toContain('string');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types in an optional class field annotation', () => {
        const found = labels('class Account {\n    name?: \n}\n', '    name?: ');

        expect(found).toContain('string');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers only types after a union bar', () => {
        const found = labels('local value: string | \n', 'local value: string | ');

        expect(found).toContain('number');
        expect(found).not.toContain('outputChatBox');
    });

    it('offers the fun function type in an annotation', () => {
        const found = labels('local handler: \n', 'local handler: ');

        expect(found).toContain('fun');
    });

    it('keeps a statement level method call out of type position', () => {
        const found = labels(`${ACCOUNT}local account = new Account()\naccount:\n`, 'account:');

        expect(found).toContain('bump');
        expect(found).not.toContain('number');
    });

    it('keeps a method call inside an argument list out of type position', () => {
        const found = labels(`${ACCOUNT}local account = new Account()\noutputChatBox(account.)\n`, 'outputChatBox(account.');

        expect(found).toContain('name');
        expect(found).not.toContain('string');
    });
});

describe('decorator completion', () => {
    const decorators = [
        'Getter',
        'Setter',
        'FluentSetter',
        'ToString',
        'Equals',
        'Clone',
        'Serializable',
        'Deserialize',
        'Lazy',
        'Observable',
        'ReadOnly',
        'Deprecated',
        'Override',
        'Builder',
    ];

    it('offers decorators above a class field', () => {
        const found = labels('class Account {\n    @\n    name: string\n}\n', '    @');

        expect(found).toEqual(decorators);
    });

    it('offers decorators above a class declaration', () => {
        expect(labels('@\nclass Account {\n}\n', '@')).toEqual(decorators);
    });

    it('offers decorators while the declaration is incomplete', () => {
        expect(labels('@', '@')).toEqual(decorators);
        expect(labels('@Get', '@Get')).toEqual(decorators);
    });

    it('does not offer decorators after an expression', () => {
        expect(labels('local value = other @\n', 'other @')).toEqual([]);
    });
});

describe('class body completion', () => {
    it('suggests an assignment-style constructor when the class has none', () => {
        const constructor = items('class Account {\n    \n}\n', '    ').find((item) => item.label === 'constructor');

        expect(constructor).toMatchObject({
            kind: CompletionItemKind.Constructor,
            insertText: 'constructor = function (${1})\n    ${0}\nend',
            insertTextFormat: InsertTextFormat.Snippet,
            insertTextMode: InsertTextMode.adjustIndentation,
        });
    });

    it('does not suggest a constructor when the class already has one', () => {
        const text = 'class Account {\n    constructor = function ()\n    end\n    \n}\n';

        expect(labels(text, '    \n}')).not.toContain('constructor');
    });

    it('does not suggest a constructor from inside a class method', () => {
        const text = 'class Account {\n    describe = function ()\n        \n    end\n}\n';

        expect(labels(text, '        ')).not.toContain('constructor');
    });
});
