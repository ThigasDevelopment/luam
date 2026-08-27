import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const COUNTER = "class Counter {\n    static total: number = 0\n\n    static bump = function (amount: number): number\n        return amount\n    end\n\n    label: string = 'counter'\n\n    describe = function (): string\n        return self.label\n    end\n}\n";

function labels(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service.completion(SERVER_FILE, markerAt(text, marker)).map((item) => item.label);
}

describe('static member completion', () => {
    it('offers statics after a class value', () => {
        const found = labels(`${COUNTER}Counter.`, 'Counter.');

        expect(found).toContain('total');
        expect(found).toContain('bump');
    });

    it('hides instance members from a class value', () => {
        const found = labels(`${COUNTER}Counter.`, 'Counter.');

        expect(found).not.toContain('label');
        expect(found).not.toContain('describe');
    });

    it('offers nothing after a colon on a class value', () => {
        expect(labels(`${COUNTER}Counter:`, 'Counter:')).toEqual([]);
    });

    it('offers instance members on an instance', () => {
        const found = labels(`${COUNTER}local counter = new Counter()\ncounter.`, 'counter.');

        expect(found).toContain('label');
        expect(found).not.toContain('total');
    });
});
