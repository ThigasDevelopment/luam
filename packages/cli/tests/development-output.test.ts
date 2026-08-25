import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { minifyLua } from '@cli/build/lua-minifier';
import { EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { compile } from '@compiler/index';

import { createMemoryLogger } from './support/memory-logger';
import { parsesAsLua51 } from './support/lua-check';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const SERVER_SOURCE = [
    'interface Order {',
    '    label: string;',
    '}',
    '',
    'enum Stage {',
    '    OPEN,',
    '    CLOSED',
    '}',
    '',
    'local total: number = 0',
    '',
    'for index = 1, 3 do',
    '    if index == 2 then continue end',
    '',
    '    total += index',
    'end',
    '',
    'outputDebugString(tostring(total) .. tostring(Stage.OPEN))',
    '',
].join('\n');

const LEXED: readonly string[] = [
    'interface I { name: string };\n\nprint(1)\n',
    'type Values = string[]\nprint(1)\n',
    'interface A {\n    # note\n    name: string;\n}\n\nprint(1)\n',
    'interface B {\n    #* note *#\n    name: string;\n}\n\nprint(1)\n',
    "class Example {\n    label = 'a';\n\n    greet = function (value: number): void\n        print(value)\n    end\n}\n\nprint(1)\n",
    'enum GameState {\n    LOBBY,\n    RUNNING\n}\n\nprint(GameState.LOBBY)\n',
    'for index = 1, 10 do\n    if index == 3 then continue end\n    if index == 8 then break end\nend\n',
    'local index: number = 0\nrepeat\n    index++\n    if index == 3 then continue end\nuntil index > 5\n',
    'class Holder {\n    label: string\n    count = 1\n}\n\nprint(1)\n',
];

const fixtures: ProjectFixture[] = [];

function project(minify: boolean): ProjectFixture {
    const fixture = createProjectFixture({
        ...defaultProjectFiles({ output: { bundle: false, map: false, minify } }),
        'src/server/main.luam': SERVER_SOURCE,
    });

    fixtures.push(fixture);

    return fixture;
}

async function build(fixture: ProjectFixture): Promise<number> {
    return runCli(['build', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE });
}

function generated(fixture: ProjectFixture): string {
    return readFileSync(resolve(fixture.root, 'build/luam-demo/src/server/main.lua'), 'utf8');
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('development output', () => {
    it('keeps the authored layout when the build does not minify', async () => {
        const fixture = project(false);

        expect(await build(fixture)).toBe(EXIT_OK);

        const code = generated(fixture);

        expect(code.replace(/\n$/, '').split('\n').length).toBe(SERVER_SOURCE.replace(/\n$/, '').split('\n').length);
        expect(code).toContain('--[[interface Order {\n    label: string;\n}]]');
        expect(code).toContain("Stage = enum {\n    'OPEN',\n    'CLOSED'\n}");
        expect(code).toContain('for index = 1, 3 do\n    repeat if index == 2 then break end\n\n    total = total + index until true\nend');
        expect(parsesAsLua51(code)).toBe(true);
    });

    it.each(LEXED)('scans as Lua 5.1: %j', (source) => {
        const code = compile(source, { filePath: 'src/server/main.luam', development: true }).code ?? '';

        expect(code).not.toBe('');
        expect(() => minifyLua(code, 'src/server/main.lua')).not.toThrow();
        expect(parsesAsLua51(code)).toBe(true);
    });

    it('ships the release form when the build minifies', async () => {
        const fixture = project(true);

        expect(await build(fixture)).toBe(EXIT_OK);

        const code = generated(fixture);

        expect(code).not.toContain('\n');
        expect(code).not.toContain('interface');
        expect(code).not.toContain('label');
        expect(parsesAsLua51(code)).toBe(true);
    });
});
