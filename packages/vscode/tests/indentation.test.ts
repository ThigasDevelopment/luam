import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface LanguageConfiguration {
    indentationRules: { increaseIndentPattern: string; decreaseIndentPattern: string };
}

const configuration: LanguageConfiguration = JSON.parse(
    readFileSync(fileURLToPath(new URL('../language-configuration.json', import.meta.url)), 'utf8'),
);

const increase = new RegExp(configuration.indentationRules.increaseIndentPattern);

const decrease = new RegExp(configuration.indentationRules.decreaseIndentPattern);

describe('indentation rules', () => {
    it('indents after a lua block opener', () => {
        expect(increase.test('if health > 0 then')).toBe(true);
        expect(increase.test('for index = 1, 10 do')).toBe(true);
        expect(increase.test('while running do')).toBe(true);
        expect(increase.test('repeat')).toBe(true);
        expect(increase.test('else')).toBe(true);
    });

    it('indents after a function header', () => {
        expect(increase.test('function greet(name: string): string')).toBe(true);
        expect(increase.test('local function greet()')).toBe(true);
        expect(increase.test('    addEventHandler("onPlayerJoin", root, function()')).toBe(true);
    });

    it('indents after a brace opener', () => {
        expect(increase.test('class Account {')).toBe(true);
        expect(increase.test('interface Command {')).toBe(true);
        expect(increase.test('enum State {')).toBe(true);
        expect(increase.test('    bump(amount: number): number {')).toBe(true);
        expect(increase.test('local config = {')).toBe(true);
    });

    it('indents after an open call paren left hanging', () => {
        expect(increase.test('outputChatBox(')).toBe(true);
    });

    it('leaves a complete line alone', () => {
        expect(increase.test('local health = 100')).toBe(false);
        expect(increase.test('outputChatBox("hi", root)')).toBe(false);
        expect(increase.test('local config = { name = "a" }')).toBe(false);
        expect(increase.test('if ready then return end')).toBe(false);
        expect(increase.test('# function greet()')).toBe(false);
    });

    it('outdents a closing line', () => {
        expect(decrease.test('end')).toBe(true);
        expect(decrease.test('    end)')).toBe(true);
        expect(decrease.test('}')).toBe(true);
        expect(decrease.test('    )')).toBe(true);
        expect(decrease.test('until ready')).toBe(true);
        expect(decrease.test('elseif health > 0 then')).toBe(true);
    });

    it('leaves an ordinary line unoutdented', () => {
        expect(decrease.test('local health = 100')).toBe(false);
        expect(decrease.test('outputChatBox("hi")')).toBe(false);
    });
});
