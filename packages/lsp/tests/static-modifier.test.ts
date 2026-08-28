import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function service(text: string): LanguageService {
    const created = new LanguageService();

    created.update(SERVER_FILE, 1, text);

    return created;
}

function hoverAt(text: string, marker: string): string {
    const position = markerAt(text, marker);
    const hover = service(text).hover(SERVER_FILE, { line: position.line, character: position.character - 1 });
    const contents = hover?.contents;

    return typeof contents === 'object' && contents !== null && 'value' in contents ? String(contents.value) : '';
}

function labelsAt(text: string, marker: string): string[] {
    const position = markerAt(text, marker);

    return service(text)
        .completion(SERVER_FILE, position)
        .map((item) => item.label);
}

describe('the static modifier hover', () => {
    it('explains the modifier on a static field', () => {
        const hover = hoverAt('class Counter {\n    static total: number = 0\n}\n', '    stat');

        expect(hover).toContain('puts a member on the class value');
        expect(hover).toContain('check-static-receiver');
    });

    it('explains the modifier on a static method', () => {
        expect(hoverAt('class Counter {\n    static bump = function (): void\n    end\n}\n', '    stat')).toContain('class value');
    });

    it('says nothing about the modifier for a local named static', () => {
        expect(hoverAt('local static = 1\n', 'local stat')).not.toContain('puts a member on the class value');
    });

    it('says nothing about the modifier when no member name follows on the same line', () => {
        expect(hoverAt('class Counter {\n    static = 1\n}\n', '    stat')).not.toContain('puts a member on the class value');
    });
});

describe('the class hover', () => {
    it('no longer denies static members and type parameters', () => {
        const hover = hoverAt('class Counter {\n}\n', 'clas');

        expect(hover).not.toContain('Static members, declared metamethods, and generic classes are not supported');
        expect(hover).toContain('static');
    });
});

describe('class body completion', () => {
    it('offers static inside a class body', () => {
        expect(labelsAt('class Counter {\n    \n}\n', 'class Counter {\n    ')).toContain('static');
    });

    it('offers the constructor beside it while the class has none', () => {
        const labels = labelsAt('class Counter {\n    \n}\n', 'class Counter {\n    ');

        expect(labels).toContain('constructor');
        expect(labels).toContain('static');
    });

    it('does not offer static at the top level', () => {
        expect(labelsAt('local a = 1\n', 'local a = 1\n')).not.toContain('static');
    });

    it('does not offer static inside a method body', () => {
        const text = 'class Counter {\n    bump = function (): void\n        \n    end\n}\n';

        expect(labelsAt(text, 'void\n        ')).not.toContain('static');
    });
});
