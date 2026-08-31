import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function emit(source: string): string {
    return compile(source).code ?? '';
}

const IDENTITY = 'function identity<T>(value: T): T\n    return value\nend\n';

const PAIR = 'function pair<K, V>(key: K, value: V): V\n    print(key)\n\n    return value\nend\n';

const SHAPE = "interface Named {\n    name: string\n}\n\nclass Tag implements Named {\n    name: string = 'tag'\n}\n\nclass Plain {\n    id: number = 1\n}\n\nfunction label<T extends Named>(value: T): string\n    return value.name\nend\n";

describe('declaring type parameters', () => {
    it('accepts a function declaration', () => {
        expect(codes(IDENTITY)).toEqual([]);
    });

    it('accepts two parameters', () => {
        expect(codes(PAIR)).toEqual([]);
    });

    it('accepts a local function declaration', () => {
        expect(codes('local function identity<T>(value: T): T\n    return value\nend\n\nprint(identity(1))\n')).toEqual([]);
    });

    it('accepts a function expression', () => {
        expect(codes('local identity = function <T>(value: T): T\n    return value\nend\n\nlocal text: string = identity(\'a\')\n\nprint(text)\n')).toEqual([]);
    });

    it('accepts a class method', () => {
        const source = 'class Reader {\n    read = function <T>(value: T): T\n        return value\n    end\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it('rejects nothing when a name is not a type parameter', () => {
        expect(codes('function take(value: string): string\n    return value\nend\n')).toEqual([]);
    });
});

describe('inference at the call site', () => {
    it('binds a parameter from an argument', () => {
        expect(codes(`${IDENTITY}local text: string = identity('a')\n\nprint(text)\n`)).toEqual([]);
        expect(codes(`${IDENTITY}local total: number = identity(1)\n\nprint(total)\n`)).toEqual([]);
    });

    it('reports a mismatch against the inferred return', () => {
        expect(messages(`${IDENTITY}local total: number = identity('a')\n\nprint(total)\n`)).toEqual([
            'Variable "total" expects "number" but received "string".',
        ]);
    });

    it('binds each parameter independently', () => {
        expect(codes(`${PAIR}local text: string = pair(1, 'a')\n\nprint(text)\n`)).toEqual([]);
        expect(codes(`${PAIR}local total: number = pair('a', 1)\n\nprint(total)\n`)).toEqual([]);
    });

    it('binds the first argument when two arguments disagree', () => {
        const source = "function both<T>(left: T, right: T): T\n    print(right)\n\n    return left\nend\n\nlocal text: string = both('a', 1)\n\nprint(text)\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('makes a parameter that appears only in the return position "any"', () => {
        const source = 'function make<T>(): T?\n    return nil\nend\n\nlocal total: number = make()\n\nprint(total)\n';

        expect(codes(source)).toEqual([]);
    });

    it('binds through an array parameter', () => {
        const source = 'function first<T>(list: T[]): T?\n    return list[1]\nend\n\nlocal head?: string = first({ 1, 2 })\n\nprint(head)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});

describe('explicit type arguments', () => {
    it('accepts the correct count', () => {
        expect(codes(`${IDENTITY}local text: string = identity<string>('a')\n\nprint(text)\n`)).toEqual([]);
    });

    it('reports an argument that does not match the explicit type', () => {
        expect(messages(`${IDENTITY}local text = identity<string>(1)\n\nprint(text)\n`)).toEqual([
            'Argument 1 expects "string" but received "number".',
        ]);
    });

    it('reports too many explicit arguments', () => {
        expect(messages(`${IDENTITY}local text = identity<string, number>('a')\n\nprint(text)\n`)).toEqual([
            'Function "identity" expects 1 type argument but received 2.',
        ]);
    });

    it('reports type arguments on a function that takes none', () => {
        const source = "function take(value: string): string\n    return value\nend\n\nlocal text = take<string>('a')\n\nprint(text)\n";

        expect(messages(source)).toEqual(['Function "take" does not accept type arguments.']);
    });
});

describe('constraints', () => {
    it('accepts an argument that satisfies the constraint', () => {
        expect(codes(`${SHAPE}local name: string = label(new Tag())\n\nprint(name)\n`)).toEqual([]);
    });

    it('reports an argument that violates the constraint', () => {
        expect(messages(`${SHAPE}local name: string = label(new Plain())\n\nprint(name)\n`)).toEqual([
            'Type argument "Plain" does not satisfy "T extends Named" on Function "label".',
        ]);
    });

    it('reports an explicit argument that violates the constraint', () => {
        expect(codes(`${SHAPE}local name = label<Plain>(new Plain())\n\nprint(name)\n`)).toContain('check-generic-constraint');
    });
});

describe('scope', () => {
    const BOX = 'class Box<T> {\n    value: T\n\n    constructor = function (value: T)\n        self.value = value\n    end\n\n    convert = function <U>(change: fun(T): U): U\n        return change(self.value)\n    end\n}\n';

    it('resolves both sets of parameters in a generic method', () => {
        const source = `${BOX}local box = new Box<number>(1)\nlocal shown: string = box:convert(tostring)\n\nprint(shown)\n`;

        expect(codes(source)).toEqual([]);
    });

    it('shadows a class parameter with a method parameter of the same name', () => {
        const source = 'class Box<T> {\n    value: T\n\n    to = function <T>(other: T): T\n        return other\n    end\n}\n\nlocal box = new Box<number>()\nlocal text: string = box:to(\'a\')\n\nprint(text)\n';

        expect(codes(source)).toEqual([]);
    });

    it('does not warn that a type parameter is undefined', () => {
        expect(codes(IDENTITY)).not.toContain('check-unknown-type');
    });
});

describe('the "<" ambiguity', () => {
    it('reads a comparison in a condition as a comparison', () => {
        expect(codes('local a = 1\nlocal b = 2\n\nif a < b then\n    print(1)\nend\n')).toEqual([]);
    });

    it('reads a comparison in an assignment as a comparison', () => {
        expect(codes('local a = 1\nlocal b = 2\nlocal smaller = a < b\n\nprint(smaller)\n')).toEqual([]);
    });

    it('keeps a comparison against a parenthesised call', () => {
        expect(codes('local a = 1\n\nlocal smaller = a < tonumber(\'2\')\n\nprint(smaller)\n')).toEqual([]);
    });

    it('reads a type argument list followed by a call as a generic call', () => {
        expect(emit(`${IDENTITY}local text = identity<string>('a')\n\nprint(text)\n`)).toContain("identity('a')");
    });
});

describe('erasure', () => {
    it('leaves no trace of a declaration', () => {
        expect(emit(IDENTITY)).toBe('function identity(value)\n    return value\nend\n');
    });

    it('leaves no trace of a call', () => {
        expect(emit(`${IDENTITY}local total = identity<number>(1)\n\nprint(total)\n`)).not.toContain('<');
    });

    it('emits the same Lua as the same function without its parameters', () => {
        const generic = 'function identity<T>(value: T): T\n    return value\nend\n';
        const plain = 'function identity(value: any): any\n    return value\nend\n';

        expect(emit(generic)).toBe(emit(plain));
    });
});
