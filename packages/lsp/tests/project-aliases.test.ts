import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const SHARED_FILE = pathToUri('/project/src/shared/types.luam');

const SHARED_SOURCE = "type Position = {\n    x: number,\n    y: number\n}\n\ntype Tag = 'one' | 'two'\n";

function serviceWith(text: string): LanguageService {
    const service = new LanguageService();

    service.update(SHARED_FILE, 1, SHARED_SOURCE);
    service.update(SERVER_FILE, 1, text);

    return service;
}

describe('a project alias in the editor', () => {
    it('is offered in a type position', () => {
        const text = 'local point: Pos\n';
        const found = serviceWith(text)
            .completion(SERVER_FILE, markerAt(text, 'Pos'))
            .map((item) => item.label);

        expect(found).toContain('Position');
        expect(found).toContain('Tag');
    });

    it('resolves go-to-definition to the declaring file', () => {
        const text = 'local point: Position = { x = 1, y = 2 }\n\nprint(point)\n';
        const locations = serviceWith(text).definition(SERVER_FILE, positionOf(text, 'local point', 'Position'));

        expect(locations.map((location) => location.uri)).toContain(SHARED_FILE);
    });

    it('reports no unknown-type diagnostic for the cross-file alias', () => {
        const text = 'local point: Position = { x = 1, y = 2 }\n\nprint(point)\n';
        const codes = serviceWith(text)
            .diagnostics(SERVER_FILE)
            .map((diagnostic) => diagnostic.code);

        expect(codes).toEqual([]);
    });
});
