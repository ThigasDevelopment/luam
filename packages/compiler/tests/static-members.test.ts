import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compileProject } from '@compiler/project/project';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

const COUNTER = "class Counter {\n    static total: number = 0\n\n    static bump = function (amount: number): number\n        return amount\n    end\n\n    label: string = 'counter'\n}\n";

describe('static members', () => {
    it('declares a static field and a static method', () => {
        expect(codes(COUNTER)).toEqual([]);
    });

    it('emits statics into the class table', () => {
        const code = emit(COUNTER);

        expect(code).toContain('total = 0');
        expect(code).toContain('bump = function(amount)');
    });

    it('keeps the instance methods receiving self', () => {
        const source = "class Counter {\n    static bump = function (): void\n    end\n\n    describe = function (): string\n        return 'counter'\n    end\n}\n";
        const code = emit(source);

        expect(code).toContain('bump = function()');
        expect(code).toContain('describe = function(self)');
    });

    it('reads a static through the class value', () => {
        expect(codes(`${COUNTER}local total: number = Counter.total\n`)).toEqual([]);
    });

    it('lowers a static read to the class table', () => {
        expect(emit(`${COUNTER}local total: number = Counter.total\n`)).toContain("local total = getClass('Counter').total");
    });

    it('lowers a static call to the class table', () => {
        expect(emit(`${COUNTER}local next: number = Counter.bump(2)\n`)).toContain("local next = getClass('Counter').bump(2)");
    });

    it('checks the arguments of a static call', () => {
        expect(codes(`${COUNTER}local next: number = Counter.bump()\n`)).toEqual(['check-argument-count']);
        expect(codes(`${COUNTER}local next: number = Counter.bump('two')\n`)).toEqual(['check-type-mismatch']);
    });

    it('rejects an instance member read through the class value', () => {
        expect(codes(`${COUNTER}local label: string = Counter.label\n`)).toEqual(['check-unknown-member']);
    });

    it('rejects a static read through an instance', () => {
        expect(codes(`${COUNTER}local counter = new Counter()\nlocal total: number = counter.total\n`)).toEqual(['check-static-receiver']);
    });

    it('rejects a static called with a colon', () => {
        expect(codes(`${COUNTER}local next: number = Counter:bump(2)\n`)).toEqual(['check-static-receiver']);
    });

    it('rejects a name declared in both spaces', () => {
        const source = "class Counter {\n    static total: number = 0\n\n    total: number = 0\n}\n";

        expect(codes(source)).toEqual(['check-duplicate-class-member']);
    });

    it('rejects "self" inside a static method', () => {
        const source = "class Counter {\n    static bump = function (): void\n        self.total = 1\n    end\n}\n";

        expect(codes(source)).toEqual(['check-invalid-self']);
    });

    it('rejects "super" inside a static method', () => {
        const source = "class Base {\n    reset = function (): void\n    end\n}\n\nclass Counter extends Base {\n    static reset = function (): void\n        super()\n    end\n}\n";

        expect(codes(source)).toEqual(['check-invalid-super']);
    });

    it('inherits a static from the parent class', () => {
        const source = "class Base {\n    static origin: string = 'base'\n}\n\nclass Child extends Base {\n}\n\nlocal origin: string = Child.origin\n";

        expect(codes(source)).toEqual([]);
    });

    it('rejects a static that changes the inherited type', () => {
        const source = "class Base {\n    static origin: string = 'base'\n}\n\nclass Child extends Base {\n    static origin: number = 1\n}\n";

        expect(codes(source)).toEqual(['check-invalid-override']);
    });

    it('accepts a static that repeats the inherited type', () => {
        const source = "class Base {\n    static origin: string = 'base'\n}\n\nclass Child extends Base {\n    static origin: string = 'child'\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('keeps a field named static usable', () => {
        const source = "class Counter {\n    static: number = 1\n}\n\nlocal counter = new Counter()\nlocal value: number = counter.static\n";

        expect(codes(source)).toEqual([]);
    });

    it('keeps a local named static usable', () => {
        expect(codes('local static: number = 1\nprint(static)\n')).toEqual([]);
    });

    it('reads a static from inside an instance method', () => {
        const source = "class Counter {\n    static total: number = 0\n\n    describe = function (): number\n        return Counter.total\n    end\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('reads a static from inside another static method', () => {
        const source = "class Counter {\n    static total: number = 0\n\n    static read = function (): number\n        return Counter.total\n    end\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('keeps a readable build on the authored lines', () => {
        const source = `${COUNTER}\nlocal next: number = Counter.bump(1)\n`;
        const result = compile(source, { filePath: 'src/server/main.luam', development: true });

        expect(result.diagnostics).toEqual([]);
        expect((result.code ?? '').split('\n')).toHaveLength(source.split('\n').length);
        expect(result.code).toContain("local next = getClass('Counter').bump(1)");
        expect(result.code).not.toContain('static');
    });

    it('reads a static declared by another module', () => {
        const project = compileProject([
            { path: 'src/shared/counter.luam', source: COUNTER },
            { path: 'src/server/main.luam', source: 'local total: number = Counter.total\n' },
        ]);

        expect(project.diagnostics).toEqual([]);

        const reader = project.modules.find((module) => module.path === 'src/server/main.luam');

        expect(reader?.code).toContain("getClass('Counter').total");
        expect(reader?.requiredHelpers).toEqual(['class']);
    });

    it('rejects an unknown static declared by another module', () => {
        const project = compileProject([
            { path: 'src/shared/counter.luam', source: COUNTER },
            { path: 'src/server/main.luam', source: 'local missing: number = Counter.missing\n' },
        ]);

        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-unknown-member']);
    });
});
