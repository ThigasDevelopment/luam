import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { FunctionDeclaration, Statement } from '@compiler/parser/ast';
import { parse } from '@compiler/parser/parser';

const SERVER_FILE = 'src/server/main.luam';

function codes(source: string, filePath = SERVER_FILE): string[] {
    return compile(source, { filePath }).diagnostics.map((diagnostic) => diagnostic.code);
}

function firstStatement(source: string): Statement {
    const body = parse(source).program.body;
    const statement = body[0];

    expect(statement).toBeDefined();

    return statement as Statement;
}

function exportedNames(source: string, filePath = SERVER_FILE): string[] {
    return compile(source, { filePath }).directives.exports.map((entry) => entry.name);
}

describe('export directive parsing', () => {
    it('marks a top level function as exported', () => {
        const statement = firstStatement('export function score(): number\n    return 1\nend\n') as FunctionDeclaration;

        expect(statement.kind).toBe('function-declaration');
        expect(statement.isExported).toBe(true);
        expect(statement.isLocal).toBe(false);
    });

    it('leaves an ordinary function unexported', () => {
        const statement = firstStatement('function score(): number\n    return 1\nend\n') as FunctionDeclaration;

        expect(statement.isExported).toBe(false);
    });

    it('reserves "export" so it cannot name a variable', () => {
        expect(codes('local export = 1\n')).toEqual(['parse-unexpected-token']);
        expect(codes('export = getPlayers()\n')).toEqual(['parse-unexpected-token']);
    });

    it('keeps "export" usable as a table field and a call target', () => {
        expect(codes("local settings: table = { export = true }\nprint(settings.export)\n")).toEqual([]);
    });

    it('reports parse-export-local for an exported local function', () => {
        expect(codes('export local function score()\n    return 1\nend\n')).toEqual(['parse-export-local']);
    });
});

describe('export directive checking', () => {
    it('accepts an exported top level function', () => {
        const source = 'export function score(player: Player): number\n    return 1\nend\n';

        expect(codes(source)).toEqual([]);
        expect(exportedNames(source)).toEqual(['score']);
    });

    it('lists nothing for a file with no directive', () => {
        expect(exportedNames('function score()\n    return 1\nend\n')).toEqual([]);
    });

    it('reports check-export-not-top-level inside an if statement', () => {
        expect(codes('if true then\n    export function score()\n        return 1\n    end\nend\n')).toEqual(['check-export-not-top-level']);
    });

    it('reports check-export-not-top-level inside a function body', () => {
        const source = 'function outer()\n    export function score()\n        return 1\n    end\nend\n';

        expect(codes(source)).toEqual(['check-export-not-top-level']);
    });

    it('reports check-export-member for a function declared on a table', () => {
        const source = 'local api: table = {}\n\nexport function api.score()\n    return 1\nend\n';

        expect(codes(source)).toEqual(['check-export-member']);
    });

    it('reports check-export-in-declaration-file', () => {
        const source = 'export function score(): number\n    return 1\nend\n';

        expect(codes(source, 'src/server/api.d.luam')).toEqual(['check-export-in-declaration-file']);
    });
});

describe('export directive emission', () => {
    it('emits Lua identical to the same function without the directive', () => {
        const body = 'function score(player: Player): number\n    return 1\nend\n';
        const exported = compile(`export ${body}`, { filePath: SERVER_FILE });
        const plain = compile(body, { filePath: SERVER_FILE });

        expect(exported.code).toBe(plain.code);
        expect(exported.code).toBe('function score(player)\n    return 1\nend\n');
    });
});

describe('removed build directives', () => {
    it('reads "setting" as an ordinary identifier', () => {
        expect(codes('local setting = 1\nsetting = setting + 1\nprint(setting)\n')).toEqual([]);
        expect(firstStatement('local setting = 1\n').kind).toBe('local-statement');
    });

    it('reads "depends" as an ordinary identifier and a call target', () => {
        expect(codes('local depends = 1\nprint(depends)\n')).toEqual([]);
        expect(codes("function depends(name: string): void\n    print(name)\nend\n\ndepends('scoreboard')\n")).toEqual([]);
        expect(firstStatement("function depends(name: string): void\n    print(name)\nend\n").kind).toBe('function-declaration');
    });

    it('leaves "export" as the only build directive', () => {
        const directives = compile('export function score(): number\n    return 1\nend\n', { filePath: SERVER_FILE }).directives;

        expect(Object.keys(directives)).toEqual(['exports']);
    });
});
