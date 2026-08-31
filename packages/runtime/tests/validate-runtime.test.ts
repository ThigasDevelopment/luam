import { describe, expect, it } from 'vitest';

import { runWithHelpers } from './support/lua-vm';

const PAYLOAD = "{ kind = 'record', name = 'Payload', members = { { key = 'id', value = { kind = 'string' } }, { key = 'score', value = { kind = 'number' } } } }";

function run(source: string): ReturnType<typeof runWithHelpers> {
    return runWithHelpers(['class', 'validate'], source);
}

function validated(value: string, descriptor = PAYLOAD): ReturnType<typeof runWithHelpers> {
    return run(`local ok, message = pcall(__luam_validate, ${value}, ${descriptor})\nresult = ok and 'ok' or message\n`);
}

describe('validate helper', () => {
    it('accepts a payload that matches', () => {
        expect(validated("{ id = 'a', score = 1 }").result).toBe('ok');
    });

    it('names the path and the expected type of a wrong field', () => {
        expect(validated("{ id = 'a', score = 'two' }").result).toBe('luam-validate: "score" expected "number"');
    });

    it('names a missing field', () => {
        expect(validated("{ id = 'a' }").result).toBe('luam-validate: "score" expected "number"');
    });

    it('never repeats the value it rejected', () => {
        expect(validated("{ id = 'a', score = 'super-secret-token' }").result).not.toContain('super-secret-token');
    });

    it('rejects a value that is not a table', () => {
        expect(validated("'text'").result).toBe('luam-validate: value expected "Payload"');
    });

    it('accepts an optional field left out', () => {
        const descriptor = "{ kind = 'record', name = 'P', members = { { key = 'tag', value = { kind = 'optional', element = { kind = 'string' } } } } }";

        expect(validated('{ }', descriptor).result).toBe('ok');
    });

    it('checks every element of an array', () => {
        const descriptor = "{ kind = 'array', element = { kind = 'number' } }";

        expect(validated('{ 1, 2, 3 }', descriptor).result).toBe('ok');
        expect(validated("{ 1, 'two' }", descriptor).result).toBe('luam-validate: "[2]" expected "number"');
    });

    it('checks the key and the value of a map', () => {
        const descriptor = "{ kind = 'map', key = { kind = 'string' }, value = { kind = 'number' } }";

        expect(validated('{ a = 1 }', descriptor).result).toBe('ok');
        expect(validated("{ a = 'one' }", descriptor).result).toBe('luam-validate: "a" expected "number"');
    });

    it('accepts any member of a union', () => {
        const descriptor = "{ kind = 'union', options = { { kind = 'string' }, { kind = 'number' } } }";

        expect(validated("'a'", descriptor).result).toBe('ok');
        expect(validated('1', descriptor).result).toBe('ok');
        expect(validated('true', descriptor).result).toBe('luam-validate: value expected "string | number"');
    });

    it('checks a literal exactly', () => {
        const descriptor = "{ kind = 'literal', value = 'ready' }";

        expect(validated("'ready'", descriptor).result).toBe('ok');
        expect(validated("'other'", descriptor).result).toBe(`luam-validate: value expected "'ready'"`);
    });

    it('rejects a table nested past the depth limit', () => {
        const source = "local value = { }\nlocal current = value\nfor index = 1, 40 do\n    current.next = { }\n    current = current.next\nend\nlocal descriptor = { kind = 'record', name = 'Node', members = { } }\nlocal node = descriptor\nfor index = 1, 40 do\n    local child = { kind = 'record', name = 'Node', members = { } }\n    node.members[1] = { key = 'next', value = child }\n    node = child\nend\nlocal ok, message = pcall(__luam_validate, value, descriptor)\nresult = ok and 'ok' or message\n";

        expect(run(source).result).toContain('nested deeper than');
    });

    it('rejects a collection past the entry limit', () => {
        const source = "local value = { }\nfor index = 1, 5000 do\n    value[index] = index\nend\nlocal ok, message = pcall(__luam_validate, value, { kind = 'array', element = { kind = 'number' } })\nresult = ok and 'ok' or message\n";

        expect(run(source).result).toContain('more than');
    });

    it('rejects a string past the length limit', () => {
        const source = "local value = string.rep('x', 70000)\nlocal ok, message = pcall(__luam_validate, value, { kind = 'string' })\nresult = ok and 'ok' or message\n";

        expect(run(source).result).toContain('longer than');
    });

    it('checks a class instance by its name', () => {
        const source = `class 'Session' {
    id = nil
}

local descriptor = { kind = 'instance', name = 'Session' }
local ok = __luam_matches(new 'Session' (), descriptor)
local other = __luam_matches({ }, descriptor)

result = tostring(ok) .. ':' .. tostring(other)
`;

        expect(run(source).result).toBe('true:false');
    });

    it('reports a boolean instead of raising when asked to match', () => {
        const source = `result = tostring(__luam_matches({ id = 'a', score = 1 }, ${PAYLOAD})) .. ':' .. tostring(__luam_matches({ }, ${PAYLOAD}))\n`;

        expect(run(source).result).toBe('true:false');
    });
});
