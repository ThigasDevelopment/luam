import { describe, expect, it } from 'vitest';

import { minifyLua, minifyLuaFiles } from '@cli/build/lua-minifier';
import { LuaScanError, scanLua } from '@cli/build/lua-tokens';

import { LUA_51, parsesAsLua51, runLua51, tokenTexts } from './support/lua-check';

const BOUNDARIES: readonly [string, string][] = [
    ['local x = 1\n', 'local x=1'],
    ['local x = a - -b\n', 'local x=a- -b'],
    ['return 1 .. 2\n', 'return 1 ..2'],
    ['return a .. b\n', 'return a..b'],
    ['local t = { [ [[key]] ] = 1 }\n', 'local t={[ [[key]]]=1}'],
    ['if a then return end\n', 'if a then return end'],
    ['for i = 1, 10 do end\n', 'for i=1,10 do end'],
    ['while not done do end\n', 'while not done do end'],
    ['local n = #t\n', 'local n=#t'],
    ['local v = t[u[w]]\n', 'local v=t[u[w]]'],
    ['local a, b = 1, 2\n', 'local a,b=1,2'],
    ['if a ~= b and c <= d then end\n', 'if a~=b and c<=d then end'],
    ['print "text"\n', 'print"text"'],
    ['local f = function(...) return ... end\n', 'local f=function(...)return...end'],
    ['local h = 0xFF\nlocal e = 1e10\nlocal s = 1E-5\nlocal p = .5\nlocal q = 3.\n', 'local h=0xFF local e=1e10 local s=1E-5 local p=.5 local q=3.'],
];

const LITERALS: readonly string[] = [
    'local dashes = "--not a comment"\n',
    "local quoted = 'it\\'s here'\n",
    'local escaped = "line\\nbreak\\tand \\\\ backslash"\n',
    'local nested = [==[ closes ]] later ]==]\n',
    'local pattern = "%-%-%s*"\n',
    'local brackets = "]]"\n',
];

const MULTILINE_LITERAL = 'local long = [[keeps\n   its   spacing\n]]\n';

const COMMENTS: readonly [string, string][] = [
    ['-- leading\nprint(1)\n', 'print(1)'],
    ['print(1) -- trailing', 'print(1)'],
    ['--[[ block ]]print(1)\n', 'print(1)'],
    ['--[==[ level\nblock ]==]\nprint(1)\n', 'print(1)'],
    ['print(1)--[[a]]--[[b]]print(2)\n', 'print(1)print(2)'],
    ['-- only a comment\n', ''],
];

describe('lua token scanner', () => {
    it('keeps comments out of the token stream and literals inside it', () => {
        expect(tokenTexts('-- gone\nlocal s = "kept" --[[ gone ]]\n')).toEqual(['local', 's', '=', '"kept"']);
    });

    it('rejects source that is not Lua 5.1', () => {
        expect(() => scanLua('local s = "open\n', 'a.lua')).toThrow(LuaScanError);
        expect(() => scanLua('local s = [[open\n', 'a.lua')).toThrow(LuaScanError);
        expect(() => scanLua('local a = b & c\n', 'a.lua')).toThrow(LuaScanError);
        expect(() => scanLua('local s = "open\n', 'a.lua')).toThrow('"a.lua" is not valid Lua 5.1 at line 1');
    });
});

describe('lua minifier', () => {
    it('inserts a separator only where two tokens would otherwise merge', () => {
        for (const [source, expected] of BOUNDARIES) {
            expect(minifyLua(source, 'fixture.lua'), source).toBe(expected);
        }
    });

    it('removes every comment form', () => {
        for (const [source, expected] of COMMENTS) {
            expect(minifyLua(source, 'fixture.lua'), source).toBe(expected);
        }
    });

    it('preserves literal bytes in every string form', () => {
        for (const source of [...LITERALS, MULTILINE_LITERAL]) {
            const literal = source.slice(source.indexOf('=') + 2, -1);

            expect(minifyLua(source, 'fixture.lua'), source).toContain(literal);
        }
    });

    it('produces the same token stream as the source it minified', () => {
        const sources = [...BOUNDARIES.map(([input]) => input), ...LITERALS, MULTILINE_LITERAL, ...COMMENTS.map(([input]) => input)];

        for (const source of sources) {
            expect(tokenTexts(minifyLua(source, 'fixture.lua')), source).toEqual(tokenTexts(source));
        }
    });

    it('writes no newline outside a literal and stays stable when minified again', () => {
        const sources = [...BOUNDARIES.map(([input]) => input), ...LITERALS, ...COMMENTS.map(([input]) => input)];

        for (const source of sources) {
            const minified = minifyLua(source, 'fixture.lua');

            expect(minified.includes('\n'), source).toBe(false);
            expect(minifyLua(minified, 'fixture.lua'), source).toBe(minified);
        }

        expect(minifyLua(MULTILINE_LITERAL, 'fixture.lua')).toBe('local long=[[keeps\n   its   spacing\n]]');
    });

    it('minifies only the Lua files in a resource file set', () => {
        const files = new Map([
            ['meta.xml', '<meta>\n    <info />\n</meta>\n'],
            ['config.lua', 'Config = { a = 1 } -- note\n'],
        ]);

        expect(minifyLuaFiles(files).get('meta.xml')).toBe('<meta>\n    <info />\n</meta>\n');
        expect(minifyLuaFiles(files).get('config.lua')).toBe('Config={a=1}');
    });

    it('names the file and line when the scanner fails', () => {
        expect(() => minifyLuaFiles(new Map([['src/server.lua', 'local a = 1\nlocal s = "open\n']]))).toThrow('"src/server.lua" is not valid Lua 5.1 at line 2');
    });
});

describe('lua 5.1 validation', () => {
    it.skipIf(LUA_51 === null)('loads every minified fixture as Lua 5.1', () => {
        for (const [source] of BOUNDARIES) {
            expect(parsesAsLua51(minifyLua(source, 'fixture.lua')), source).toBe(true);
        }
    });

    it.skipIf(LUA_51 === null)('preserves the observable behaviour of an MTA-safe chunk', () => {
        const source = [
            'local greeting = "hello" -- friendly',
            '--[[ block comment ]]',
            'local pattern = "--%s"',
            'local block = [[a]]..[[b]]',
            'local total = 0',
            'for index = 1, 3 do',
            '    total = total + index - -1',
            'end',
            'local parts = { greeting, pattern, block, tostring(total) }',
            'print(table.concat(parts, "|"))',
            '',
        ].join('\n');

        expect(runLua51(minifyLua(source, 'fixture.lua'))).toBe(runLua51(source));
    });
});
