import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER = pathToUri('/project/src/server/main.luam');

function ranked(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(SERVER, 1, text);

    return service
        .completion(SERVER, markerAt(text, marker))
        .filter((item) => item.sortText !== undefined && item.sortText.startsWith('0'))
        .sort((left, right) => (left.sortText ?? '').localeCompare(right.sortText ?? ''))
        .map((item) => item.label);
}

const HANDLER = "addEventHandler('onPlayerJoin', root,\n    function ()\n        s\n    end\n);\n";

describe('event context ranking', () => {
    it('lifts source above the other event globals inside a handler body', () => {
        expect(ranked(HANDLER, '        s')).toEqual(['source', 'client', 'eventName', 'sourceResource', 'sourceResourceRoot']);
    });

    it('lifts them from inside a nested call in the handler body', () => {
        const text = "addEventHandler('onPlayerJoin', root,\n    function ()\n        outputChatBox('hi', )\n    end\n);\n";

        expect(ranked(text, "'hi', ")).toContain('source');
    });

    it('leaves the ranking alone outside a handler', () => {
        expect(ranked('local value = s\n', '= s')).toEqual([]);
    });

    it('leaves the ranking alone in a call that takes no handler', () => {
        expect(ranked("triggerEvent('onPlayerJoin', root)\nlocal value = s\n", '= s')).toEqual([]);
    });
});
