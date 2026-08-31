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

const BOX = `class Box<T> {
    value: T

    constructor = function (value: T)
        self.value = value
    end

    read = function (): T
        return self.value
    end

    write = function (value: T): void
        self.value = value
    end
}
`;

describe('generic classes', () => {
    it('types a member through an explicit type argument', () => {
        expect(codes(`${BOX}local box: Box<string> = new Box<string>('text')\nlocal value: string = box.value\n`)).toEqual([]);
    });

    it('reports a member read at the wrong specialization', () => {
        const source = `${BOX}local box: Box<string> = new Box<string>('text')\nlocal value: number = box.value\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "number" but received "string"');
    });

    it('types a method result through the specialization', () => {
        expect(codes(`${BOX}local box: Box<number> = new Box<number>(1)\nlocal value: number = box:read()\n`)).toEqual([]);
    });

    it('checks a method argument against the specialization', () => {
        const source = `${BOX}local box: Box<number> = new Box<number>(1)\n\nbox:write('text')\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "number" but received "string"');
    });

    it('infers the type argument from the constructor call', () => {
        expect(codes(`${BOX}local box = new Box('text')\nlocal value: string = box:read()\n`)).toEqual([]);
    });

    it('reports an inferred specialization used at the wrong type', () => {
        expect(codes(`${BOX}local box = new Box('text')\nlocal value: number = box:read()\n`)).toEqual(['check-type-mismatch']);
    });

    it('checks a constructor argument against the explicit type argument', () => {
        expect(codes(`${BOX}local box = new Box<number>('text')\n`)).toEqual(['check-type-mismatch']);
    });

    it('rejects two specializations of the same class', () => {
        expect(codes(`${BOX}local text: Box<string> = new Box<number>(1)\n`)).toEqual(['check-type-mismatch']);
    });

    it('accepts a matching specialization', () => {
        expect(codes(`${BOX}local text: Box<string> = new Box<string>('one')\n`)).toEqual([]);
    });

    it('reports the wrong number of type arguments', () => {
        const source = `${BOX}local box: Box<string, number> = new Box<string>('text')\n`;

        expect(codes(source)).toEqual(['check-generic-arity']);
        expect(messages(source)[0]).toContain('expects 1 type argument but received 2');
    });

    it('reports type arguments on a class that declares none', () => {
        expect(codes('class Plain {\n    id: number = 1\n}\n\nlocal value = new Plain<string>()\n')).toEqual(['check-generic-arity']);
    });

    it('nests a specialization inside another', () => {
        const source = `${BOX}local outer: Box<Box<string>> = new Box<Box<string>>(new Box<string>('text'))\nlocal inner: Box<string> = outer:read()\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a nested specialization read at the wrong type', () => {
        const source = `${BOX}local outer = new Box<Box<string>>(new Box<string>('text'))\nlocal inner: Box<number> = outer:read()\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});

describe('generic inheritance', () => {
    const LABELLED = `${BOX}class Labelled<T> extends Box<T> {
    label: string = ''
}
`;

    it('substitutes the parent members through the child specialization', () => {
        expect(codes(`${LABELLED}local box: Labelled<string> = new Labelled<string>('text')\nlocal value: string = box:read()\n`)).toEqual([]);
    });

    it('reports a parent member read at the wrong specialization', () => {
        expect(codes(`${LABELLED}local box: Labelled<string> = new Labelled<string>('text')\nlocal value: number = box:read()\n`)).toEqual([
            'check-type-mismatch',
        ]);
    });

    it('substitutes a parent pinned to a concrete argument', () => {
        const source = `${BOX}class Tag extends Box<string> {
    prefix: string = ''
}

local tag = new Tag('text')
local value: string = tag:read()
`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a pinned parent read at the wrong type', () => {
        const source = `${BOX}class Tag extends Box<string> {
    prefix: string = ''
}

local tag = new Tag('text')
local value: number = tag:read()
`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});

describe('generic erasure', () => {
    it('emits one class implementation with no type artifacts', () => {
        const output = emit(`${BOX}local text = new Box<string>('one')\nlocal count = new Box<number>(2)\n`);

        expect(output).not.toContain('<');
        expect(output.match(/constructor = function/g)?.length).toBe(1);
        expect(output.match(/read = function/g)?.length).toBe(1);
    });

    it('emits a generic subclass as one ordinary class', () => {
        const source = `${BOX}class Labelled<T> extends Box<T> {
    label: string = ''
}

local box = new Labelled<string>('text')
`;

        expect(emit(source)).not.toContain('<');
    });
});

describe('generic depth', () => {
    it('reports a specialization nested past the bound', () => {
        const nested = (depth: number): string => (depth === 0 ? 'string' : `Box<${nested(depth - 1)}>`);
        const source = `${BOX}local deep: ${nested(12)} = new Box<string>('text')\n`;
        const reported = codes(source);

        expect(reported).toContain('check-generic-depth');
        expect(messages(source).some((message) => message.includes('nested more than'))).toBe(true);
    });

    it('accepts a specialization inside the bound', () => {
        const source = `${BOX}local shallow: Box<Box<Box<string>>> = new Box<Box<Box<string>>>(new Box<Box<string>>(new Box<string>('text')))\n`;

        expect(codes(source)).toEqual([]);
    });
});

describe('generic constraints', () => {
    const SHAPE = `interface Shape {
    area: number
}

class Circle implements Shape {
    area: number = 1
}

class Word {
    text: string = ''
}

class Holder<T extends Shape> {
    item: T

    constructor = function (item: T)
        self.item = item
    end
}
`;

    it('accepts a type argument that satisfies the constraint', () => {
        expect(codes(`${SHAPE}local held: Holder<Circle> = new Holder<Circle>(new Circle())\n`)).toEqual([]);
    });

    it('reports a type argument that does not satisfy the constraint', () => {
        const source = `${SHAPE}local held = new Holder<Word>(new Word())\n`;

        expect(codes(source)).toContain('check-generic-constraint');
        expect(messages(source).some((message) => message.includes('does not satisfy'))).toBe(true);
    });

    it('reports a constraint violation in an annotation', () => {
        expect(codes(`${SHAPE}function take(held: Holder<Word>): void\nend\n`)).toContain('check-generic-constraint');
    });
});
