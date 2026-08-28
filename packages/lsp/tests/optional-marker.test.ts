import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { namedAnnotationText } from '@lsp/symbols/signature-text';
import { parse } from '@compiler/parser/parser';
import type { LocalStatement } from '@compiler/parser/ast';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function annotationText(source: string, name: string): string {
    const statement = parse(source).program.body[0] as LocalStatement | undefined;
    const annotation = statement?.kind === 'local-statement' ? (statement.declarations[0]?.annotation ?? null) : null;

    return namedAnnotationText(name, annotation);
}

function hoverText(source: string, line: number, character: number): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, source);

    const hover = service.hover(SERVER_FILE, { line, character });
    const contents = hover?.contents;

    return typeof contents === 'object' && contents !== null && 'value' in contents ? String(contents.value) : '';
}

describe('rendering an optional declaration', () => {
    it('never prints a marker on both the name and the type', () => {
        expect(annotationText('local tag?: string? = nil\n', 'tag')).toBe('tag?: string');
        expect(annotationText('local tag?: string = nil\n', 'tag')).toBe('tag?: string');
    });

    it('renders a signature without a doubled marker', () => {
        const source = 'local function open(tag?: string?): void\nend\n\nopen(nil)\n';

        expect(hoverText(source, 0, 16)).not.toContain('string?');
    });

    it('keeps an optional return type on the type, where it belongs', () => {
        expect(annotationText('local find: fun(): string? = nil\n', 'find')).toBe('find: fun(): string?');
    });
});
