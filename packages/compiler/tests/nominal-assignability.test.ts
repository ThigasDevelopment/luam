import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const SERVER_FILE = 'src/server/main.luam';

function codes(source: string): string[] {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.message);
}

const INTERFACE = 'interface Contract {\n    name: string\n}\n';

const ALIAS = 'type Contract = { name: string }\n';

const CLASSES = 'class Base {\n    id: number = 0\n}\n\nclass Child extends Base {\n}\n\nclass Unrelated {\n    id: number = 0\n}\n';

const IMPLEMENTOR =
    'interface Describable {\n    describe: fun(): string\n}\n\n' +
    'class Slot implements Describable {\n    describe = function (): string\n        return \'slot\'\n    end\n}\n\n' +
    'class Plain {\n    describe = function (): string\n        return \'plain\'\n    end\n}\n';

const POSITIONS: readonly (readonly [string, string])[] = [
    ['return value', "function example(): Contract\n    return 'wrong'\nend\n"],
    ['local initialiser', "local value: Contract = 'wrong'\n"],
    ['call argument', "function example(value: Contract): void\nend\n\nexample('wrong')\n"],
];

describe('an interface is checked like a type alias', () => {
    for (const [position, body] of POSITIONS) {
        it(`reports a wrong value in ${position}`, () => {
            expect(codes(`${INTERFACE}${body}`)).toEqual(['check-type-mismatch']);
            expect(messages(`${INTERFACE}${body}`)).toEqual(messages(`${ALIAS}${body}`));
        });
    }

    it('accepts a record that satisfies it', () => {
        expect(codes(`${INTERFACE}local value: Contract = { name = 'a' }\n`)).toEqual([]);
    });

    it('reports a record missing a member and names the member', () => {
        expect(codes(`${INTERFACE}local value: Contract = { other = 1 }\n`)).toEqual(['check-type-mismatch']);
        expect(messages(`${INTERFACE}local value: Contract = { other = 1 }\n`)[0]).toContain('Key "name" is missing from "Contract".');
    });

    it('reports a record carrying a member at the wrong type', () => {
        expect(codes(`${INTERFACE}local value: Contract = { name = 1 }\n`)).toEqual(['check-type-mismatch']);
    });

    it('accepts a record that satisfies an inherited member', () => {
        const source = 'interface Named {\n    name: string\n}\n\ninterface Tagged extends Named {\n    tag: string\n}\n';

        expect(codes(`${source}local value: Tagged = { name = 'a', tag = 'b' }\n`)).toEqual([]);
        expect(codes(`${source}local value: Tagged = { tag = 'b' }\n`)).toEqual(['check-type-mismatch']);
    });
});

describe('a class stays nominal', () => {
    it('accepts a subclass where the parent is expected', () => {
        expect(codes(`${CLASSES}local value: Base = new Child()\n`)).toEqual([]);
    });

    it('reports an unrelated class with the same members', () => {
        expect(codes(`${CLASSES}local value: Base = new Unrelated()\n`)).toEqual(['check-type-mismatch']);
    });

    it('reports a record where a class is expected', () => {
        expect(codes(`${CLASSES}local value: Base = { id = 1 }\n`)).toEqual(['check-type-mismatch']);
    });

    it('accepts a class that declares the interface it implements', () => {
        expect(codes(`${IMPLEMENTOR}local value: Describable = new Slot()\n`)).toEqual([]);
    });

    it('reports a class that satisfies an interface without declaring it', () => {
        expect(codes(`${IMPLEMENTOR}local value: Describable = new Plain()\n`)).toEqual(['check-type-mismatch']);
    });

    it('reports a class value where a scalar is expected', () => {
        expect(codes(`${CLASSES}local value: string = new Base()\n`)).toEqual(['check-type-mismatch']);
        expect(codes(`${CLASSES}local value: number = new Base()\n`)).toEqual(['check-type-mismatch']);
    });

    it('accepts a class value where a table-like type is expected', () => {
        expect(codes(`${CLASSES}local value: table = new Base()\n`)).toEqual([]);
    });

    it('keeps reporting an unimplemented interface on the declaration', () => {
        const source = 'interface Describable {\n    describe: fun(): string\n}\n\nclass Broken implements Describable {\n}\n';

        expect(codes(source)).toEqual(['check-unimplemented-interface']);
    });
});

describe('a name the checker never resolved stays permissive', () => {
    for (const [position, body] of POSITIONS) {
        it(`reports nothing in ${position}`, () => {
            expect(codes(body.replace(/Contract/g, 'Databse'))).toEqual(['check-unknown-type']);
        });
    }

    it('keeps an MTA element type assignable', () => {
        expect(codes("local player: Player = getPlayerFromName('bob')\n")).toEqual([]);
    });
});

describe('a recursive interface terminates', () => {
    it('compiles a self-referencing interface', () => {
        expect(codes('interface Node {\n    next?: Node\n}\n\nlocal value: Node = { next = nil }\n')).toEqual([]);
    });

    it('compiles a mutually recursive pair', () => {
        const source = 'interface Left {\n    right?: Right\n}\n\ninterface Right {\n    left?: Left\n}\n';

        expect(codes(`${source}local value: Left = { right = nil }\n`)).toEqual([]);
    });
});
