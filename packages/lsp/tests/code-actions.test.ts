import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { parse } from '@compiler/parser/parser';
import type { TextEdit } from 'vscode-languageserver';

import { LanguageService } from '@lsp/server/language-service';
import { FIXABLE_CODES, quickFixFor, type SourceEdit } from '@lsp/features/quick-fixes';
import { offsetAt } from '@lsp/support/source-text';
import { lineStarts } from '@lsp/support/source-text';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_PATH = '/project/src/server/main.luam';

const SERVER_FILE = pathToUri(SERVER_PATH);

const WHOLE = { start: { line: 0, character: 0 }, end: { line: 200, character: 0 } };

function applied(text: string, edits: readonly TextEdit[]): string {
    const starts = lineStarts(text);
    const ordered = [...edits].sort((left, right) => right.range.start.line - left.range.start.line || right.range.start.character - left.range.start.character);

    return ordered.reduce((current, edit) => {
        const from = offsetAt(starts, edit.range.start.line, edit.range.start.character, current.length);
        const to = offsetAt(starts, edit.range.end.line, edit.range.end.character, current.length);

        return current.slice(0, from) + edit.newText + current.slice(to);
    }, text);
}

function applyEdits(text: string, edits: readonly SourceEdit[]): string {
    return [...edits]
        .sort((left, right) => right.start - left.start)
        .reduce((current, edit) => current.slice(0, edit.start) + edit.newText + current.slice(edit.end), text);
}

function codesOf(text: string): string[] {
    return compile(text, { filePath: 'src/server/main.luam' }).diagnostics.map((diagnostic) => diagnostic.code);
}

function fix(text: string): { title: string; result: string; code: string } {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const actions = service.codeActions(SERVER_FILE, WHOLE);
    const action = actions[0];

    expect(actions).toHaveLength(1);
    expect(action).toBeDefined();

    return {
        title: action?.title ?? '',
        result: applied(text, action?.edit?.changes?.[SERVER_FILE] ?? []),
        code: String(action?.diagnostics?.[0]?.code ?? ''),
    };
}

describe('quick fixes', () => {
    it('moves an optional marker onto the name', () => {
        const fixed = fix('local title: string? = nil\n');

        expect(fixed.code).toBe('parse-optional-position');
        expect(fixed.result).toBe('local title?: string = nil\n');
        expect(codesOf(fixed.result)).toEqual([]);
    });

    it('removes a redundant optional marker', () => {
        const fixed = fix('local titulo?: string? = nil\n');

        expect(fixed.code).toBe('parse-redundant-optional');
        expect(fixed.result).toBe('local titulo?: string = nil\n');
        expect(codesOf(fixed.result)).toEqual([]);
    });

    it('calls super directly', () => {
        const source =
            'class Base {\n    constructor = function ()\n    end\n}\n\n' +
            'class Session extends Base {\n    constructor = function ()\n        self:super()\n    end\n}\n';
        const fixed = fix(source);

        expect(fixed.code).toBe('check-invalid-super');
        expect(fixed.result).toContain('        super()\n');
        expect(codesOf(fixed.result)).toEqual([]);
    });

    it('reads a static member with a dot', () => {
        const fixed = fix('class Session {\n    static open = function (): void\n    end\n}\nSession:open()\n');

        expect(fixed.code).toBe('check-static-receiver');
        expect(fixed.result).toContain('Session.open()');
        expect(codesOf(fixed.result)).toEqual([]);
    });

    it('rewrites a native constructor call', () => {
        const source = "local pool = Threads.new('concurrent', 'normal')\n";
        const parsed = parse(source);
        const diagnostic = compile(source, { filePath: 'src/server/main.luam' }).diagnostics[0];

        expect(diagnostic?.code).toBe('check-native-constructor');

        const found = diagnostic === undefined ? null : quickFixFor(diagnostic, parsed.tokens);
        const result = found === null ? source : applyEdits(source, found.edits);

        expect(result).toBe("local pool = new Threads('concurrent', 'normal')\n");
        expect(codesOf(result)).toEqual([]);
    });

    it('removes an explicit self parameter', () => {
        const fixed = fix('class Session {\n    start = function (self: Session, id: number): void\n    end\n}\n');

        expect(fixed.code).toBe('check-explicit-self-parameter');
        expect(fixed.result).toContain('function (id: number): void');
        expect(codesOf(fixed.result)).toEqual([]);
    });

    it('removes a lone self parameter', () => {
        const fixed = fix('class Session {\n    start = function (self: Session): void\n    end\n}\n');

        expect(fixed.result).toContain('function (): void');
        expect(codesOf(fixed.result)).toEqual([]);
    });
});

describe('diagnostics without a fix', () => {
    it('offers nothing for a type mismatch', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local total: number = "one"\n');

        expect(service.codeActions(SERVER_FILE, WHOLE)).toEqual([]);
    });

    it('offers nothing for an unknown record key', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'type Args = { name: string }\nlocal args: Args = { name = "a" }\nlocal value = args.nmae\n');

        expect(service.codeActions(SERVER_FILE, WHOLE)).toEqual([]);
    });

    it('offers nothing outside the requested range', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local a = 1\nlocal title: string? = nil\n');

        expect(service.codeActions(SERVER_FILE, { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } })).toEqual([]);
    });

    it('names exactly the codes the provider fixes', () => {
        expect([...FIXABLE_CODES].sort()).toEqual([
            'check-explicit-self-parameter',
            'check-invalid-super',
            'check-native-constructor',
            'check-static-receiver',
            'parse-optional-position',
            'parse-redundant-optional',
        ]);
    });
});
