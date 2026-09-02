import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

const CHILD_FIRST = "class VIPPlayer extends Player {\n    rank: string = 'gold'\n}\n\nclass Player {\n    name: string = ''\n}\n";

const PLAYER = 'class Player {\n    constructor = function (name: string)\n        self.name = name\n    end\n}\n\n';

describe('class declaration order', () => {
    it('resolves a parent declared further down the file', () => {
        expect(codes(CHILD_FIRST)).toEqual([]);
    });

    it('keeps the authored order of the generated declarations', () => {
        const code = emit(CHILD_FIRST);

        expect(code.indexOf("class 'VIPPlayer' :extends 'Player'")).toBeLessThan(code.indexOf("class 'Player'"));
    });

    it('keeps a non-class top level effect between two class declarations', () => {
        const source = "class First {\n    a: number = 1\n}\n\nprint('between')\n\nclass Second extends First {\n    b: number = 2\n}\n";
        const code = emit(source);

        expect(code.indexOf("print('between')")).toBeGreaterThan(code.indexOf("class 'First'"));
        expect(code.indexOf("print('between')")).toBeLessThan(code.indexOf("class 'Second'"));
    });

    it('resolves a chain declared in reverse', () => {
        const source = 'class C extends B {\n}\n\nclass B extends A {\n}\n\nclass A {\n    id: number = 1\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it('instantiates a class declared further down from inside a function body', () => {
        const source = "function spawn(): void\n    local player = new Player()\n\n    print(player.name)\nend\n\nclass Player {\n    name: string = ''\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('instantiates a class declared further down from inside a method body', () => {
        const source = "class Spawner {\n    run = function (): void\n        local player = new Player()\n\n        print(player.name)\n    end\n}\n\nclass Player {\n    name: string = ''\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('rejects a top level instantiation of a class declared further down', () => {
        const source = "local player = new Player()\n\nclass Player {\n    name: string = ''\n}\n";

        expect(codes(source)).toEqual(['check-class-before-declaration']);
    });

    it('rejects a field initializer that instantiates a class declared further down', () => {
        const source = "class Holder {\n    player = new Player()\n}\n\nclass Player {\n    name: string = ''\n}\n";

        expect(codes(source)).toEqual(['check-class-before-declaration']);
    });

    it('checks the constructor of a class declared earlier', () => {
        const source = `${PLAYER}function spawn(): void\n    local player = new Player()\nend\n`;

        expect(codes(source)).toEqual(['check-argument-count']);
    });

    it('leaves the constructor of a class declared further down unchecked', () => {
        const source = `function spawn(): void\n    local player = new Player()\nend\n\n${PLAYER}`;

        expect(codes(source)).toEqual([]);
    });

    it('reports an inheritance cycle once and keeps checking the file', () => {
        const source = 'class A extends B {\n}\n\nclass B extends A {\n}\n';

        expect(codes(source)).toEqual(['check-class-cycle']);
    });

    it('reports a class that extends itself', () => {
        expect(codes('class Loop extends Loop {\n}\n')).toEqual(['check-class-cycle']);
    });

    it('still reports a parent no file declares', () => {
        expect(codes('class Orphan extends Missing {\n}\n')).toEqual(['check-unknown-class']);
    });

    it('still reports two declarations of one class', () => {
        expect(codes('class Twice {\n}\n\nclass Twice {\n}\n')).toEqual(['check-duplicate-class']);
    });

    it('checks an inherited member when the parent is declared first', () => {
        const source = "class Base {\n    greet = function (): string\n        return 'hi'\n    end\n}\n\nclass Child extends Base {\n    run = function (): string\n        return self:greet()\n    end\n}\n";

        expect(codes(source)).toEqual([]);
    });
});

describe('a subclass whose parent is in another file', () => {
    it('is assignable to the parent it extends', () => {
        const files: ProjectFile[] = [
            { path: 'src/server/base.luam', source: 'class Event {\n    id: number = 0\n}\n' },
            { path: 'src/server/derived.luam', source: 'class Buy extends Event {\n}\n' },
            { path: 'src/server/use.luam', source: 'local held: Event = new Buy()\n\nprint(held)\n' },
        ];

        expect(compileProject(files).diagnostics).toEqual([]);
    });

    it('is assignable through a map the parent types', () => {
        const files: ProjectFile[] = [
            { path: 'src/server/base.luam', source: 'class Event {\n    id: number = 0\n\n    handle = function (...): void\n    end\n}\n' },
            { path: 'src/server/derived.luam', source: 'class Buy extends Event {\n    handle = function (request: table): void\n    end\n}\n' },
            { path: 'src/server/use.luam', source: "local events: table<string, Event> = {}\n\nevents['buy'] = new Buy()\n" },
        ];

        expect(compileProject(files).diagnostics).toEqual([]);
    });

    it('still reports a parent no file declares', () => {
        const files: ProjectFile[] = [{ path: 'src/server/orphan.luam', source: 'class Buy extends Missing {\n}\n' }];
        const found = compileProject(files).diagnostics.map((entry) => entry.diagnostic.code);

        expect(found).toContain('check-unknown-class');
    });
});
