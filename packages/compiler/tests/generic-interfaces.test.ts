import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

const SHAPES = "interface Shape {\n    area: number\n}\n\nclass Circle implements Shape {\n    area: number = 1\n}\n\nclass Word {\n    text: string = 'a'\n}\n\n";

const PROMISE = "interface Promise<T> {\n    state: 'pending' | 'fulfilled' | 'rejected'\n    value: T[]\n    handlers: fun[]\n}\n\n";

function boxed(argument: string): string {
    return `${SHAPES}interface Box<T extends Shape> {\n    value: T\n}\n\nlocal function take(b: Box<${argument}>): void\n    print(b.value)\nend\n`;
}

describe('a generic interface', () => {
    it('parses the reproduction', () => {
        expect(codes(PROMISE)).toEqual([]);
    });

    it('substitutes a member at the point it is read', () => {
        const source = `${PROMISE}local function take(p: Promise<Vehicle>): void\n    local held: Vehicle[] = p.value\n\n    print(held)\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a member read against the wrong substituted type', () => {
        const source = 'interface Box<T> {\n    value: T\n}\n\nlocal function take(b: Box<string>): void\n    local held: number = b.value\n\n    print(held)\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('received "string"');
    });

    it('resolves a recursive generic interface without warning', () => {
        const source = 'interface Node<T> {\n    value: T\n    next?: Node<T>\n}\n\nlocal function take(n: Node<string>): void\n    print(n.next)\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('infers the element type through a generic function', () => {
        const source = `${PROMISE}local function await<T>(p: Promise<T>): T[]\n    return p.value\nend\n\nlocal function take(p: Promise<Vehicle>): void\n    local held: Vehicle[] = await(p)\n\n    print(held)\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a wrong type-argument count with the generic arity code', () => {
        const source = 'interface Box<T> {\n    value: T\n}\n\nlocal function take(b: Box): void\n    print(b.value)\nend\n';

        expect(codes(source)).toEqual(['check-generic-arity']);
        expect(messages(source)[0]).toContain('Interface "Box" expects 1 type argument but received 0.');
    });

    it('reports a type argument that does not satisfy the constraint', () => {
        expect(codes(boxed('Word'))).toEqual(['check-generic-constraint']);
        expect(messages(boxed('Word'))[0]).toContain('on interface "Box"');
    });

    it('accepts a type argument that satisfies the constraint', () => {
        expect(codes(boxed('Circle'))).toEqual([]);
    });
});

describe('implements a generic interface', () => {
    it('accepts a class that satisfies the substituted contract', () => {
        expect(codes("interface Box<T> {\n    value: T\n}\n\nclass Holder implements Box<string> {\n    value: string = 'a'\n}\n")).toEqual([]);
    });

    it('names the substituted type in a mismatch', () => {
        const source = 'interface Box<T> {\n    value: T\n}\n\nclass Holder implements Box<string> {\n    value: number = 1\n}\n';

        expect(codes(source)).toEqual(['check-unimplemented-interface']);
        expect(messages(source)[0]).toContain('expects "string" from interface "Box<string>"');
    });

    it('reports a missing type argument on the implements clause', () => {
        const source = "interface Box<T> {\n    value: T\n}\n\nclass Holder implements Box {\n    value: string = 'a'\n}\n";

        expect(codes(source)).toContain('check-generic-arity');
    });

    it('leaves a plain interface unchanged', () => {
        expect(codes("interface Named {\n    name: string\n}\n\nclass Holder implements Named {\n    name: string = 'a'\n}\n")).toEqual([]);
    });
});

describe('a generic interface emits nothing', () => {
    it('leaves the generated Lua free of the declaration', () => {
        expect(compile(`${PROMISE}local value = 1\n`).code).not.toContain('Promise');
    });
});
