import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const CLIENT_FILE = pathToUri('/project/src/client/main.luam');

const NETWORK = 'class Network {\n    events: table<string, table> = {}\n\n    init = function (): void\n    end\n\n    on = function (name: string): void\n    end\n}\n\n';

function labels(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(CLIENT_FILE, 1, text);

    return service.completion(CLIENT_FILE, markerAt(text, marker)).map((item) => item.label);
}

describe('completion on an optional receiver', () => {
    it('offers the members of an optional global', () => {
        const text = `${NETWORK}network?: Network = nil\n\nnetwork:\n`;
        const found = labels(text, 'network:');

        expect(found).toContain('on');
        expect(found).toContain('init');
    });

    it('offers the members of an optional local', () => {
        const text = `${NETWORK}local net?: Network = nil\n\nnet:\n`;

        expect(labels(text, 'net:')).toContain('init');
    });

    it('offers the fields of an optional interface', () => {
        const text = 'interface Config {\n    limit: number\n}\n\nsettings?: Config = nil\n\nsettings.\n';

        expect(labels(text, 'settings.')).toContain('limit');
    });

    it('still offers the members of a non-optional receiver', () => {
        const text = `${NETWORK}local net: Network = new Network()\n\nnet:\n`;

        expect(labels(text, 'net:')).toContain('init');
    });
});
