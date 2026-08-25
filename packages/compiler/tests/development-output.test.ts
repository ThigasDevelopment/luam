import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compileProject } from '@compiler/project/project';
import { assembleResource, resolveResourcePosition } from '@compiler/project/resource';

import { developmentCode, expectLineFidelity, releaseCode, toLines } from './line-fidelity';

interface Fixture {
    name: string;
    source: string;
    lowered: readonly number[];
}

const FIXTURES: readonly Fixture[] = [
    { name: 'interface', source: 'interface Player {\n    name: string;\n}\n\nprint(1)\n', lowered: [1, 3] },
    { name: 'type alias', source: 'type CustomType = string;\n\nlocal function example (name: CustomType): void\n\nend\n', lowered: [1, 3] },
    { name: 'declare', source: "declare event 'onReady' (value: number);\n\nprint(1)\n", lowered: [1] },
    {
        name: 'class',
        source: "class Example {\n    label = 'a';\n\n    greet = function (value: number): void\n        print(value)\n    end\n}\n",
        lowered: [1, 4],
    },
    { name: 'enum', source: 'enum GameState {\n    LOBBY,\n    RUNNING\n}\n\nprint(GameState.LOBBY)\n', lowered: [1, 2, 3] },
    { name: 'local enum', source: 'local enum Weather {\n    CLEAR,\n    RAIN\n}\n\nprint(Weather.RAIN)\n', lowered: [1, 2, 3] },
    { name: 'compound assignment', source: 'local total: number = 0\n\ntotal += 1\n\nprint(total)\n', lowered: [1, 3] },
    { name: 'native extension', source: "local label: string = ' a '\n\nprint(label.trim)\n", lowered: [1, 3] },
    { name: 'new', source: 'class Point {\n    x = 0\n}\n\nlocal value = new Point ()\n\nprint(value)\n', lowered: [1, 5] },
    { name: 'template literal', source: "local name: string = 'a'\n\nprint(`hi {name}`)\n", lowered: [1, 3] },
    { name: 'continue', source: 'for index = 1, 10 do\n    if index == 3 then continue end\n\n    print(index)\nend\n', lowered: [2, 4] },
    {
        name: 'continue with break',
        source: 'for index = 1, 10 do\n    if index == 3 then continue end\n    if index == 8 then break end\nend\n',
        lowered: [2, 3],
    },
    {
        name: 'nested in a call',
        source: "addEventHandler('onThing', root, function ()\n    local total: number = 0\n\n    total += 1\n\n    print(total)\nend)\n",
        lowered: [2, 4],
    },
    {
        name: 'nested in a loop',
        source: 'local total: number = 0\n\nfor index = 1, 3 do\n    total += index\n\n    print(total)\nend\n',
        lowered: [1, 4],
    },
    { name: 'single line class', source: "class Tiny { label = 'a' }\n\nprint(1)\n", lowered: [1] },
    { name: 'single line enum', source: 'enum Colors { RED, GREEN }\n\nprint(Colors.RED)\n', lowered: [1] },
    { name: 'single line loop', source: 'for index = 1, 3 do if index == 2 then continue end print(index) end\n', lowered: [1] },
];

describe('development output', () => {
    it.each(FIXTURES)('keeps $name on its authored lines', ({ source, lowered }) => {
        expectLineFidelity(source, { lowered });
    });

    it.each(FIXTURES)('locks the release output of $name', ({ source }) => {
        expect(releaseCode(source)).toMatchSnapshot();
    });

    it.each(FIXTURES)('never leaves a bare semicolon for $name', ({ source }) => {
        for (const code of [developmentCode(source), releaseCode(source)]) {
            expect(toLines(code).filter((line) => line.trim() === ';')).toEqual([]);
        }
    });

    it('keeps an erased declaration visible as a comment only in a development build', () => {
        const source = 'type CustomType = string;\n\nlocal function example (name: CustomType): void\n\nend\n';

        expect(developmentCode(source)).toContain('--[[type CustomType = string;]]');
        expect(releaseCode(source)).not.toContain('CustomType');
    });

    it('erases an inline annotation in both modes', () => {
        const source = 'local function example (name: string): void\n    print(name)\nend\n';

        expect(developmentCode(source)).toBe('local function example (name)\n    print(name)\nend\n');
        expect(releaseCode(source)).toBe('local function example (name)\n    print(name)\nend\n');
    });

    it('emits one comment for a nested erasure', () => {
        const source = 'interface Player {\n    name: string;\n    score: number;\n}\n\nprint(1)\n';
        const code = developmentCode(source);

        expect(code.match(/--\[\[/g)?.length).toBe(1);
        expect(code).toContain('--[[interface Player {\n    name: string;\n    score: number;\n}]]');
    });

    it('widens the comment brackets around a closing long bracket', () => {
        expect(developmentCode('type Values = string[]\n\nprint(1)\n')).toContain('--[=[type Values = string[]]=]');
    });

    it('keeps a build directive visible as a comment on its own line', () => {
        const source = '#!strict\n# note\nlocal value: number = 1;\n';

        expect(developmentCode(source)).toBe('--!strict\n-- note\nlocal value = 1;\n');
        expect(releaseCode(source)).toBe('--!strict\n-- note\nlocal value = 1;\n');
    });

    it('keeps a line comment and a block comment inside the erased declaration', () => {
        expect(developmentCode('interface A {\n    # note\n    name: string;\n}\n\nprint(1)\n')).toContain('# note');
        expect(developmentCode('interface B {\n    #* note *#\n    name: string;\n}\n\nprint(1)\n')).toContain('#* note *#');
    });

    it('never carries erased source text into a release build', () => {
        for (const { source } of FIXTURES) {
            const code = releaseCode(source);

            expect(code).not.toContain('--[[interface');
            expect(code).not.toContain('--[[type');
            expect(code).not.toContain('--[[declare');
        }
    });

    it('keeps an unreferenced enum erased without changing the line count', () => {
        const source = 'enum Unused {\n    A,\n    B\n}\n\nprint(1)\n';

        expect(toLines(developmentCode(source)).length).toBe(toLines(source).length);
        expect(developmentCode(source)).not.toContain('Unused');
    });

    it('falls back to canonical emission when a declaration cannot fit its authored span', () => {
        const source = "@Builder\nclass Built {\n    label = 'a'\n}\n\nprint(1)\n";
        const code = developmentCode(source);

        expect(code).toContain("class 'BuiltBuilder' {");
        expect(code).toContain("class 'Built' {");
    });

    it('keeps the loop header and the closing line of a continue loop byte-identical', () => {
        const source = 'for index = 1, 3 do\n    if index == 2 then continue end\nend\n';

        expect(developmentCode(source)).toBe('for index = 1, 3 do\n    repeat if index == 2 then break end until true\nend\n');
    });

    it('resolves a generated position back to its authored position after folding', () => {
        const source =
            'local total: number = 0\n\nfor index = 1, 3 do\n    if index == 2 then continue end\n\n    total += index\nend\n\nprint(total)\n';
        const project = compileProject([{ path: 'src/server/main.luam', source }], { development: true });
        const map = assembleResource(project, { resourceName: 'demo' }).build?.map ?? null;

        expect(map).not.toBeNull();

        if (map === null) {
            return;
        }

        expect(resolveResourcePosition(map, 'src/server/main.lua', 6)).toEqual({
            status: 'resolved',
            position: { file: 'src/server/main.luam', line: 6 },
        });
        expect(resolveResourcePosition(map, 'src/server/main.lua', 9)).toEqual({
            status: 'resolved',
            position: { file: 'src/server/main.luam', line: 9 },
        });
    });

    it('separates the development output from the release output for the same source', () => {
        const source = 'type Alias = string;\n\nprint(1)\n';
        const release = compile(source, { filePath: 'src/server/main.luam' });
        const development = compile(source, { filePath: 'src/server/main.luam', development: true });

        expect(release.code).not.toBe(development.code);
    });
});
