import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const FILE = pathToUri('/project/src/server/main.luam');

const ALL = ['server', 'client', 'shared', 'strict', 'nonstrict', 'nocheck'];

function labels(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(FILE, 1, text);

    return service.completion(FILE, markerAt(text, marker)).map((item) => item.label);
}

describe('directive completion', () => {
    it('offers every directive right after the marker', () => {
        expect(labels('#!', '#!')).toEqual(ALL);
    });

    it('offers them with a space after the marker', () => {
        expect(labels('#! ', '#! ')).toEqual(ALL);
    });

    it('offers them while the name is being typed', () => {
        expect(labels('#!non', '#!non')).toEqual(ALL);
    });

    it('offers them on a line below the first', () => {
        expect(labels('#!client\n#!', '#!client\n#!')).toEqual(ALL);
    });

    it('offers them on an indented line', () => {
        expect(labels('    #!', '    #!')).toEqual(ALL);
    });

    it('says nothing inside an ordinary comment', () => {
        expect(labels('# a comment ', '# a comment ')).toEqual([]);
    });

    it('says nothing once the directive line has ended', () => {
        expect(labels('#!strict\nlocal ', 'local ')).not.toEqual(ALL);
    });

    it('says nothing after a length operator', () => {
        expect(labels('local items = {}\nlocal size = #', '= #')).toEqual([]);
    });

    it('describes what each directive does', () => {
        const service = new LanguageService();
        const text = '#!';

        service.update(FILE, 1, text);

        const found = service.completion(FILE, markerAt(text, '#!'));

        expect(found.find((item) => item.label === 'nocheck')?.detail).toContain('not type checked');
        expect(found.find((item) => item.label === 'server')?.detail).toContain('runs on the server');
    });
});
