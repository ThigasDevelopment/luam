import { type Range } from 'vscode-languageserver';
import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const CLIENT_FILE = pathToUri('/project/src/client/hud.luam');

const TRIPLE = ['function triple(): (number, string, boolean)', '    return 1, "a", true', 'end', ''].join('\n');

const COMPONENT = [
    'local vehicle = createVehicle(411, 0, 0, 0)',
    "local cX, cY, cZ = getVehicleComponentPosition(vehicle, 'wheel_lf_dummy', 'root')",
    '',
].join('\n');

function wholeDocument(text: string): Range {
    const lines = text.split('\n');

    return { start: { line: 0, character: 0 }, end: { line: lines.length - 1, character: lines[lines.length - 1]?.length ?? 0 } };
}

function service(text: string, uri: string = SERVER_FILE): LanguageService {
    const created = new LanguageService();

    created.update(uri, 1, text);

    return created;
}

function labels(text: string, uri: string = SERVER_FILE): string[] {
    return service(text, uri)
        .inlayHints(uri, wholeDocument(text))
        .map((hint) => String(hint.label));
}

function hoverText(created: LanguageService, text: string, before: string, uri: string = SERVER_FILE): string {
    const contents = created.hover(uri, markerAt(text, before))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function codes(source: string): string[] {
    return compile(source, { filePath: 'src/server/main.luam' }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('the inlay hints of a multi-return local', () => {
    it('hints every name a destructured call declares', () => {
        expect(labels(`${TRIPLE}local a, b, c = triple()\n`)).toEqual([': number', ': string', ': boolean']);
    });

    it('narrows a single name to the first value', () => {
        expect(labels(`${TRIPLE}local only = triple()\n`)).toEqual([': number']);
    });

    it('narrows a call in non-final position to its first value', () => {
        expect(labels(`${TRIPLE}local x, y = 1, triple()\n`)).toEqual([': number', ': number']);
    });

    it('hints nothing past the last value the list accounts for', () => {
        expect(labels('local a, b, c = 1\n')).toEqual([': number']);
    });

    it('stays quiet on a vararg it cannot count', () => {
        expect(labels('local a, b = ...\n')).toEqual([]);
    });

    it('skips an annotated name in the middle and still hints the others', () => {
        expect(labels(`${TRIPLE}local a, b: string, c = triple()\n`)).toEqual([': number', ': boolean']);
    });

    it('anchors the three hints at the three names', () => {
        const text = `${TRIPLE}local a, b, c = triple()\n`;
        const positions = service(text)
            .inlayHints(SERVER_FILE, wholeDocument(text))
            .map((hint) => hint.position);

        expect(positions).toEqual([
            { line: 3, character: 7 },
            { line: 3, character: 10 },
            { line: 3, character: 13 },
        ]);
    });

    it('keeps the range filter per hint rather than per line', () => {
        const text = `${TRIPLE}local a, b, c = triple()\n`;
        const range: Range = { start: { line: 3, character: 0 }, end: { line: 3, character: 8 } };

        expect(
            service(text)
                .inlayHints(SERVER_FILE, range)
                .map((hint) => String(hint.label)),
        ).toEqual([': number']);
    });

    it('hints number on each name of the reported catalog call', () => {
        const text = `${COMPONENT}`;
        const found = service(text, CLIENT_FILE)
            .inlayHints(CLIENT_FILE, wholeDocument(text))
            .filter((hint) => hint.position.line === 1);

        expect(found.map((hint) => String(hint.label))).toEqual([': number', ': number', ': number']);
        expect(found.map((hint) => hint.position.character)).toEqual([8, 12, 16]);
    });
});

describe('the hover of a multi-return local', () => {
    it('answers each name with the type it holds', () => {
        const text = `${TRIPLE}local a, b, c = triple()\n`;
        const created = service(text);

        expect(hoverText(created, text, 'local ')).toContain('local a: number');
        expect(hoverText(created, text, 'local a, ')).toContain('local b: string');
        expect(hoverText(created, text, 'local a, b, ')).toContain('local c: boolean');
    });

    it('narrows a single name to the first value', () => {
        const text = `${TRIPLE}local only = triple()\n`;

        expect(hoverText(service(text), text, 'local ')).toContain('local only: number');
    });

    it('shows the call on the first name only', () => {
        const text = `${TRIPLE}local a, b, c = triple()\n`;
        const created = service(text);

        expect(hoverText(created, text, 'local ')).toContain('= triple()');
        expect(hoverText(created, text, 'local a, ')).not.toContain('= triple()');
        expect(hoverText(created, text, 'local a, b, ')).not.toContain('= triple()');
    });

    it('answers number on each name of the reported catalog call', () => {
        const created = service(COMPONENT, CLIENT_FILE);

        expect(hoverText(created, COMPONENT, '\nlocal ', CLIENT_FILE)).toContain('local cX: number');
        expect(hoverText(created, COMPONENT, 'local cX, ', CLIENT_FILE)).toContain('local cY: number');
        expect(hoverText(created, COMPONENT, 'local cX, cY, ', CLIENT_FILE)).toContain('local cZ: number');
    });
});

describe('the completion of a multi-return local', () => {
    it('details a name declared by the second element of a tuple', () => {
        const text = `${TRIPLE}local first, second, third = triple()\nsec\n`;
        const created = service(text);
        const found = created.completion(SERVER_FILE, markerAt(text, 'sec')).find((item) => item.label === 'second');

        expect(found?.detail).toContain('local second: string');
    });
});

describe('the checker and the editor agree on a multi-return local', () => {
    it('type-checks the name the hint labels string', () => {
        expect(codes(`${TRIPLE}local a, b, c = triple()\nlocal named: string = b\n`)).toEqual([]);
    });

    it('rejects the same name where a number is expected', () => {
        expect(codes(`${TRIPLE}local a, b, c = triple()\nlocal wrong: number = b\n`)).not.toEqual([]);
    });
});
