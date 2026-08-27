import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SHARED_FILE = pathToUri('/project/src/shared/util.luam');

const BOX = `class Box<T> {
    value: T

    constructor = function (value: T)
        self.value = value
    end

    read = function (): T
        return self.value
    end
}
`;

function detailOf(text: string, marker: string, label: string): string {
    const service = new LanguageService();

    service.update(SHARED_FILE, 1, text);

    const item = service.completion(SHARED_FILE, markerAt(text, marker)).find((candidate) => candidate.label === label);

    return item?.detail ?? '';
}

describe('generic class completion', () => {
    it('offers a field at its specialization', () => {
        const text = `${BOX}local box = new Box<string>('text')\nlocal value = box.\n`;

        expect(detailOf(text, 'box.', 'value')).toContain('string');
    });

    it('offers a method at its specialization', () => {
        const text = `${BOX}local box = new Box<number>(1)\nlocal value = box:\n`;

        expect(detailOf(text, 'box:', 'read')).toContain('number');
    });

    it('offers a field through an annotated local', () => {
        const text = `${BOX}local box: Box<boolean> = new Box<boolean>(true)\nlocal value = box.\n`;

        expect(detailOf(text, 'box.', 'value')).toContain('boolean');
    });
});
