import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER = pathToUri('/project/src/server/main.luam');

const CLIENT = pathToUri('/project/src/client/main.luam');

function itemFor(text: string, marker: string, label: string, uri = SERVER, snippets = true): ReturnType<LanguageService['completion']>[number] | undefined {
    const service = new LanguageService();

    service.useSnippets(snippets);
    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).find((entry) => entry.label === label);
}

function accepted(text: string, marker: string, label: string, uri = SERVER): string {
    const edit = itemFor(text, marker, label, uri)?.textEdit;

    if (edit === undefined || !('range' in edit)) {
        return '';
    }

    const lines = text.split('\n');
    const indent = /^[ \t]*/.exec(lines[edit.range.start.line] ?? '')?.[0] ?? '';
    const body = edit.newText.split('\n').map((line, index) => (index === 0 ? line : `${indent}${line}`)).join('\n');
    const before = lines.slice(0, edit.range.start.line).join('\n');
    const head = `${before}${before.length > 0 ? '\n' : ''}${lines[edit.range.start.line]?.slice(0, edit.range.start.character) ?? ''}`;
    const tail = `${lines[edit.range.end.line]?.slice(edit.range.end.character) ?? ''}\n${lines.slice(edit.range.end.line + 1).join('\n')}`;

    return `${head}${body}${tail}`;
}

function compiles(source: string, uri: string): string[] {
    return compile(source.replace(/\$0/g, ''), { filePath: uri.includes('client') ? 'src/client/main.luam' : 'src/server/main.luam' }).diagnostics.map((entry) => entry.code);
}

describe('event handler scaffolding', () => {
    it('writes the whole handler with the typed parameters of the event', () => {
        const result = accepted("addEventHandler ('onPlayerLo')\n", "'onPlayerLo", 'onPlayerLogin');

        expect(result).toBe(
            "addEventHandler ('onPlayerLogin', root,\n    function (thePreviousAccount: Account, theCurrentAccount: Account)\n        $0\n    end\n);\n",
        );
        expect(compiles(result, SERVER)).toEqual([]);
    });

    it('writes an empty parameter list for an event that carries none', () => {
        const result = accepted("addEventHandler('onClientRend')\n", "'onClientRend", 'onClientRender', CLIENT);

        expect(result).toContain('function ()');
        expect(compiles(result, CLIENT)).toEqual([]);
    });

    it('keeps the quote style the author typed', () => {
        expect(accepted('addEventHandler("onPlayerCha")\n', '"onPlayerCha', 'onPlayerChat')).toContain('addEventHandler("onPlayerChat", root,');
    });

    it('completes a call whose string is still unterminated', () => {
        const result = accepted("addEventHandler('onPlayerWast\n", "'onPlayerWast", 'onPlayerWasted');

        expect(result).toContain('function (totalAmmo: number, killer: Element');
        expect(compiles(result, SERVER)).toEqual([]);
    });

    it('nests under the indentation of the line it lands on', () => {
        const result = accepted("function setup()\n    addEventHandler('onPlayerJo')\nend\n", "'onPlayerJo", 'onPlayerJoin');

        expect(result).toBe("function setup()\n    addEventHandler('onPlayerJoin', root,\n        function ()\n            $0\n        end\n    );\nend\n");
        expect(compiles(result, SERVER)).toEqual([]);
    });

    it('leaves a call that already carries a handler alone', () => {
        expect(itemFor("addEventHandler('onPlayerQu', root, handler)\n", "'onPlayerQu", 'onPlayerQuit')?.textEdit).toBeUndefined();
    });

    it('scaffolds nothing where a handler is not the point', () => {
        expect(itemFor("triggerEvent('onPlayerLo')\n", "'onPlayerLo", 'onPlayerLogin')?.textEdit).toBeUndefined();
        expect(itemFor("addEvent('onPlayerLo')\n", "'onPlayerLo", 'onPlayerLogin')?.textEdit).toBeUndefined();
    });

    it('drops the tab stop for a client that cannot take snippets', () => {
        const plain = itemFor("addEventHandler('onPlayerLo')\n", "'onPlayerLo", 'onPlayerLogin', SERVER, false);
        const edit = plain?.textEdit;

        expect(plain?.insertTextFormat).toBe(1);
        expect(edit !== undefined && 'range' in edit ? edit.newText : '').not.toContain('$0');
    });

    it('still filters by the event name as it is typed', () => {
        expect(itemFor("addEventHandler('onPlayerLo')\n", "'onPlayerLo", 'onPlayerLogin')?.filterText).toBe('onPlayerLogin');
    });
});
