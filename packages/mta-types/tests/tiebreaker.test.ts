import { describe, expect, it } from 'vitest';

import { findDeclaration } from '@mta-types/catalog';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, arrayOf } from '@mta-types/type-descriptor';
import { applyTiebreaker } from '@generator/upstream-tiebreaker';

import type { ParsedDeclaration } from '@generator/generator-model';

const EMPTY = { summary: '', parameters: [], returns: '', wiki: '' };

function declaration(name: string, type: ReturnType<typeof fn>): ParsedDeclaration {
    return { name, category: 'test', type, documentation: EMPTY };
}

describe('upstream tiebreaker', () => {
    it('narrows a type the wiki could not resolve', () => {
        const wiki = [declaration('f', fn([ANY, TABLE], ANY, 2))];
        const upstream = [declaration('f', fn([named('Player'), arrayOf(STRING)], BOOLEAN, 2))];
        const result = applyTiebreaker(wiki, upstream);

        expect(result.resolved).toEqual(['f:return', 'f[0]', 'f[1]']);
        expect(result.declarations[0]?.type).toEqual(fn([named('Player'), arrayOf(STRING)], BOOLEAN, 2));
    });

    it('leaves the parameters alone when the two signatures disagree on arity', () => {
        const wiki = [declaration('f', fn([STRING, ANY], BOOLEAN, 1))];
        const upstream = [declaration('f', fn([STRING, NUMBER, NUMBER], BOOLEAN, 1))];
        const result = applyTiebreaker(wiki, upstream);

        expect(result.declarations[0]?.type).toEqual(fn([STRING, ANY], BOOLEAN, 1));
        expect(result.resolved).toEqual([]);
    });

    it('never introduces a declaration the wiki does not list', () => {
        const result = applyTiebreaker([], [declaration('ghost', fn([], BOOLEAN, 0))]);

        expect(result.declarations).toEqual([]);
    });

    it('never lets a misaligned upstream parameter reach dxDrawText', () => {
        const type = findDeclaration('dxDrawText')?.type;
        const font = type?.kind === 'function' ? type.parameters[7] : undefined;

        expect(type?.kind === 'function' ? type.parameters.length : 0).toBe(19);
        expect(font?.kind).not.toBe('number');
        expect(font?.kind === 'union' ? font.options.some((option) => option.kind === 'named' && option.name === 'DxFont') : false).toBe(true);
    });
});
