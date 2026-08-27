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

function helpers(source: string): string[] {
    return compile(source).requiredHelpers;
}

const PAYLOAD = `@Validated
class Payload {
    id: string
    score: number
}
`;

describe('validated classes', () => {
    it('generates a static validator and matcher', () => {
        expect(codes(PAYLOAD)).toEqual([]);

        const output = emit(PAYLOAD);

        expect(output).toContain('validate = function(value)');
        expect(output).toContain('matches = function(value)');
        expect(output).toContain("__luam_validate(value, { kind = 'record', name = 'Payload'");
    });

    it('describes every declared field', () => {
        expect(emit(PAYLOAD)).toContain("{ key = 'id', value = { kind = 'string' } }, { key = 'score', value = { kind = 'number' } }");
    });

    it('pulls the validate helper in only when a class asks for it', () => {
        expect(helpers(PAYLOAD)).toContain('validate');
        expect(helpers('class Plain {\n    id: string\n}\n')).not.toContain('validate');
    });

    it('emits nothing extra for a class without the decorator', () => {
        const output = emit('class Plain {\n    id: string\n}\n');

        expect(output).not.toContain('__luam_validate');
        expect(output).not.toContain('__luam_matches');
    });

    it('types the validator by the class', () => {
        expect(codes(`${PAYLOAD}local checked: Payload = Payload.validate({ })\nlocal id: string = checked.id\n`)).toEqual([]);
        expect(codes(`${PAYLOAD}local checked: Payload = Payload.validate({ })\nlocal id: number = checked.id\n`)).toEqual(['check-type-mismatch']);
    });

    it('types the matcher as a boolean', () => {
        expect(codes(`${PAYLOAD}local ok: boolean = Payload.matches({ })\n`)).toEqual([]);
    });

    it('keeps both members static', () => {
        expect(codes(`${PAYLOAD}local instance = new Payload()\nlocal ok = instance.matches({ })\n`)).toEqual(['check-static-receiver']);
    });

    it('describes an optional field as optional', () => {
        const source = '@Validated\nclass Payload {\n    tag?: string\n}\n';

        expect(emit(source)).toContain("kind = 'optional', element = { kind = 'string' }");
    });

    it('describes an array field', () => {
        expect(emit('@Validated\nclass Payload {\n    scores: number[]\n}\n')).toContain("kind = 'array', element = { kind = 'number' }");
    });

    it('describes a map field', () => {
        expect(emit('@Validated\nclass Payload {\n    scores: table<string, number>\n}\n')).toContain("kind = 'map', key = { kind = 'string' }, value = { kind = 'number' }");
    });

    it('describes a union field', () => {
        expect(emit('@Validated\nclass Payload {\n    value: string | number\n}\n')).toContain("kind = 'union'");
    });

    it('describes a literal union field', () => {
        expect(emit("@Validated\nclass Payload {\n    mode: 'auto' | 'manual'\n}\n")).toContain("kind = 'literal', value = 'auto'");
    });

    it('describes a class field as an instance check', () => {
        const source = `class Session {
    id: string
}

@Validated
class Payload {
    session: Session
}
`;

        expect(emit(source)).toContain("kind = 'instance', name = 'Session'");
    });

    it('expands an interface field into its members', () => {
        const source = `interface Shape {
    area: number
}

@Validated
class Payload {
    shape: Shape
}
`;

        expect(emit(source)).toContain("kind = 'record', name = 'Shape'");
    });

    it('escapes a quote inside a literal', () => {
        expect(emit("@Validated\nclass Payload {\n    mode: 'it\\'s'\n}\n")).toContain("\\'");
    });
});

describe('unreifiable field types', () => {
    it('reports a field the checker cannot check at runtime', () => {
        const source = '@Validated\nclass Payload {\n    value: any\n}\n';

        expect(codes(source)).toEqual(['check-unreifiable-type']);
        expect(messages(source)[0]).toContain('has no runtime shape');
    });

    it('reports an unknown field type', () => {
        expect(codes('@Validated\nclass Payload {\n    value: unknown\n}\n')).toEqual(['check-unreifiable-type']);
    });

    it('emits nothing when a field cannot be checked', () => {
        const output = emit('@Validated\nclass Payload {\n    value: any\n}\n');

        expect(output).not.toContain('__luam_validate');
    });

    it('accepts a function field as a function check', () => {
        expect(codes('@Validated\nclass Payload {\n    handler: fun(): void\n}\n')).toEqual([]);
    });

    it('reports a conflict with a hand-written member', () => {
        const source = '@Validated\nclass Payload {\n    id: string\n\n    validate = function (): void\n    end\n}\n';

        expect(codes(source)).toEqual(['check-decorator-conflict']);
    });
});
