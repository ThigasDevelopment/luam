import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SHARED = pathToUri('/project/src/shared/network.luam');

const CLIENT = pathToUri('/project/src/client/main.luam');

const NETWORK = [
    'class Network {',
    '    events: table<string, table> = {}',
    '',
    '    on = function (requestName: string, callback: fun(data: any): void): void',
    '        self.events[requestName] = { name = requestName, callback = callback }',
    '    end',
    '}',
    '',
].join('\n');

function service(): LanguageService {
    const created = new LanguageService();

    created.update(SHARED, 1, NETWORK);

    return created;
}

function hover(text: string, anchor: string, word: string): string {
    const created = service();

    created.update(CLIENT, 1, text);

    const contents = created.hover(CLIENT, positionOf(text, anchor, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function signature(text: string, anchor: string, word: string): string {
    const created = service();

    created.update(CLIENT, 1, text);

    return created.signatureHelp(CLIENT, positionOf(text, anchor, word))?.signatures[0]?.label ?? '';
}

describe('a class declared in another file', () => {
    it('hovers a field read through an optional receiver', () => {
        const text = 'network?: Network = nil\n\nprint(network.events)\n';

        expect(hover(text, 'print(network.', 'events')).toContain('events: table<string, table>');
    });

    it('hovers a field read through a plain receiver', () => {
        const text = 'local net: Network = new Network()\n\nprint(net.events)\n';

        expect(hover(text, 'print(net.', 'events')).toContain('events: table<string, table>');
    });

    it('hovers a method called with a colon', () => {
        const text = "network?: Network = nil\n\nnetwork:on('x', print)\n";

        expect(hover(text, 'network:on', 'on')).toContain('on');
        expect(hover(text, 'network:on', 'on')).not.toBe('');
    });

    it('names the parameters in signature help', () => {
        const text = "network?: Network = nil\n\nnetwork:on('x', print)\n";
        const label = signature(text, "network:on('", "'x'");

        expect(label).toContain('requestName: string');
        expect(label).not.toContain('argument1');
    });
});
