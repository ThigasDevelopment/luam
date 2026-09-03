import { describe, expect, it } from 'vitest';

import { InsertTextFormat, InsertTextMode, type CompletionItem } from 'vscode-languageserver';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const FILE = pathToUri('/project/src/server/main.luam');

function items(text: string, marker: string, snippets = true): CompletionItem[] {
    const service = new LanguageService();

    service.useSnippets(snippets);
    service.update(FILE, 1, text);

    return service.completion(FILE, markerAt(text, marker));
}

function itemFor(text: string, marker: string, label: string, snippets = true): CompletionItem | undefined {
    return items(text, marker, snippets).find((entry) => entry.label === label);
}

function labels(text: string, marker: string): string[] {
    return items(text, marker).map((entry) => entry.label);
}

describe('block completion closers', () => {
    it('writes the header, an indented body and the end of an if block', () => {
        const item = itemFor('if 1 + 1 == 2 the\n', 'the', 'then .. end');

        expect(item?.insertText).toBe('then\n    $0\nend');
        expect(item?.filterText).toBe('then');
        expect(item?.insertTextFormat).toBe(InsertTextFormat.Snippet);
        expect(item?.insertTextMode).toBe(InsertTextMode.adjustIndentation);
        expect(item?.detail).toBe('then ... end — close the if block');
    });

    it('ranks the closer above the plain keyword', () => {
        expect(itemFor('if 1 + 1 == 2 the\n', 'the', 'then .. end')?.sortText).toBe('0then');
        expect(itemFor('if 1 + 1 == 2 the\n', 'the', 'then')?.sortText).toBeUndefined();
    });

    it('closes a numeric loop header with do .. end', () => {
        const item = itemFor('for index = 1, 10 d\n', '10 d', 'do .. end');

        expect(item?.insertText).toBe('do\n    $0\nend');
        expect(item?.filterText).toBe('do');
        expect(item?.detail).toBe('do ... end — close the for block');
    });

    it('closes a while header with do .. end', () => {
        const item = itemFor('local running = true\nwhile running d\n', 'running d', 'do .. end');

        expect(item?.detail).toBe('do ... end — close the while block');
    });

    it('closes a repeat block with until condition', () => {
        const item = itemFor('repeat\n    x\n', '    x', 'until condition');

        expect(item?.insertText).toBe('until ${1:condition}');
        expect(item?.filterText).toBe('until');
        expect(item?.sortText).toBe('0until');
        expect(item?.detail).toBe('until condition — close the repeat block');
    });

    it('preselects the closer only while the block is unclosed', () => {
        expect(itemFor('if ready the\n', 'the', 'then .. end')?.preselect).toBe(true);
        expect(itemFor('if ready then return end\n', 'then', 'then .. end')?.preselect).toBeUndefined();
    });

    it('keeps the plain block keywords in the list beside the new rows', () => {
        const found = labels('if ready the\n', 'the');

        expect(found).toContain('then .. end');
        expect(found).toContain('then');
        expect(found).toContain('do');
        expect(found).toContain('until');
    });
});

describe('block completion refusals', () => {
    it('offers nothing inside a string', () => {
        expect(labels("if ready then\n    local text = 'the'\n", "'the")).not.toContain('then .. end');
    });

    it('offers nothing inside a line comment', () => {
        expect(labels('if ready the\n# the\n', '# the')).not.toContain('then .. end');
    });

    it('offers nothing inside a block comment', () => {
        expect(labels('if ready the\n#* the *#\n', '#* the')).not.toContain('then .. end');
    });

    it('offers nothing in a type annotation', () => {
        expect(labels('if ready then\n    local value: st\n', ': st')).not.toContain('then .. end');
    });

    it('offers nothing after a member access', () => {
        expect(labels('if ready then\n    local value = table.\n', 'table.')).not.toContain('then .. end');
        expect(labels('if ready then\n    local value = self:\n', 'self:')).not.toContain('then .. end');
    });

    it('offers nothing inside the arguments of a call', () => {
        const found = labels('if ready then\n    print (the\n', '(the');

        expect(found).not.toContain('then .. end');
        expect(found).not.toContain('if .. then .. end');
    });

    it('still offers the closer inside a function written as a call argument', () => {
        const text = "addEventHandler ('onPlayerLogin', root,\n    function ()\n        if ready the\n";

        expect(labels(text, 'ready the')).toContain('then .. end');
    });
});

describe('block completion scaffolds', () => {
    it('offers every opener at a statement start', () => {
        const found = labels('local ready = true\nif\n', '\nif');

        expect(found).toContain('if .. then .. end');
        expect(found).toContain('for .. do .. end');
        expect(found).toContain('for .. in .. do .. end');
        expect(found).toContain('while .. do .. end');
        expect(found).toContain('repeat .. until');
        expect(found).toContain('do .. end');
        expect(found).toContain('function .. end');
    });

    it('writes the tab stops in the order a reader would fill them', () => {
        const scaffold = itemFor('local ready = true\nif\n', '\nif', 'if .. then .. end');
        const numeric = itemFor('local ready = true\nif\n', '\nif', 'for .. do .. end');
        const generic = itemFor('local ready = true\nif\n', '\nif', 'for .. in .. do .. end');

        expect(scaffold?.insertText).toBe('if ${1:condition} then\n    $0\nend');
        expect(numeric?.insertText).toBe('for ${1:index} = ${2:1}, ${3:10} do\n    $0\nend');
        expect(generic?.insertText).toBe('for ${1:key}, ${2:value} in pairs(${3:items}) do\n    $0\nend');
    });

    it('ranks a scaffold below the closers and never preselects one', () => {
        const scaffold = itemFor('local ready = true\nif\n', '\nif', 'if .. then .. end');

        expect(scaffold?.sortText).toBe('~if');
        expect(scaffold?.preselect).toBeUndefined();
        expect(scaffold?.filterText).toBe('if');
    });

    it('offers no scaffold mid-expression', () => {
        expect(labels('local value = if\n', '= if')).not.toContain('if .. then .. end');
    });
});

describe('block completion without snippet support', () => {
    it('writes the same block as plain text with no tab stop', () => {
        const item = itemFor('if 1 + 1 == 2 the\n', 'the', 'then .. end', false);

        expect(item?.insertText).toBe('then\n    \nend');
        expect(item?.insertTextFormat).toBe(InsertTextFormat.PlainText);
    });

    it('fills the defaults of a scaffold in the plain-text path', () => {
        const item = itemFor('local ready = true\nif\n', '\nif', 'if .. then .. end', false);

        expect(item?.insertText).toBe('if condition then\n    \nend');
        expect(itemFor('repeat\n    x\n', '    x', 'until condition', false)?.insertText).toBe('until condition');
    });
});
