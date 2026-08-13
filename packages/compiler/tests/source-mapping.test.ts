import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { createProjectCache } from '@compiler/project/project-cache';
import { compileProject } from '@compiler/project/project';
import { assembleResource, resolveResourcePosition } from '@compiler/project/resource';

describe('source line mappings', () => {
    it('encodes an identity map as one sparse pair', () => {
        const result = compile('local first = 1\nlocal second = 2\nprint(first + second)\n', { filePath: 'src/server/main.luam' });

        expect(result.lines).toEqual([{ generatedLine: 1, sourceLine: 1 }]);
    });

    it('maps every generated control-flow statement to its authored line', () => {
        const source = readFileSync(new URL('./fixtures/control-flow.luam', import.meta.url), 'utf8');
        const result = compile(source, { filePath: 'src/server/control-flow.luam' });

        expect(result.lines).toEqual([
            { generatedLine: 1, sourceLine: 2 },
            { generatedLine: 2, sourceLine: 4 },
            { generatedLine: 5, sourceLine: 8 },
            { generatedLine: 8, sourceLine: 12 },
            { generatedLine: 11, sourceLine: 16 },
            { generatedLine: 14, sourceLine: 20 },
            { generatedLine: 17, sourceLine: 24 },
            { generatedLine: 19, sourceLine: 27 },
            { generatedLine: 21, sourceLine: 30 },
            { generatedLine: 28, sourceLine: 38 },
        ]);
    });

    it('keeps emitted Lua unchanged while recording sparse source segments', () => {
        const source = `local value = 1

function greet(): void

    print(value)
end

print('done')
`;
        const result = compile(source, { filePath: 'src/server/main.luam' });

        expect(result.code).toBe("local value = 1\nfunction greet()\n    print(value)\nend\nprint('done')\n");
        expect(result.lines).toEqual([
            { generatedLine: 1, sourceLine: 1 },
            { generatedLine: 2, sourceLine: 3 },
            { generatedLine: 3, sourceLine: 5, symbol: 'greet' },
            { generatedLine: 5, sourceLine: 8 },
        ]);
    });

    it('records class methods and generated accessors with their enclosing symbols', () => {
        const source = `class Shop {
    @Getter
    name: string = ''

    buy = function (): void
        print(self.name)
    end
}
`;
        const result = compile(source, { filePath: 'src/shared/shop.luam' });

        expect(result.lines).toContainEqual({ generatedLine: 3, sourceLine: 5, symbol: 'Shop:buy' });
        expect(result.lines.some((line) => line.sourceLine === 3 && line.symbol === 'Shop:getName')).toBe(true);
    });

    it('returns cached mappings with the cached module and invalidates them with code', () => {
        const cache = createProjectCache();
        const initial = [{ path: 'src/server/main.luam', source: '\nprint(1)\n' }];
        const edited = [{ path: 'src/server/main.luam', source: '\n\nprint(1)\n' }];

        const first = cache.compile(initial);
        const reused = cache.compile(initial);
        const changed = cache.compile(edited);

        expect(reused.modules[0]?.lines).toEqual(first.modules[0]?.lines);
        expect(reused.stats.modulesReused).toBe(1);
        expect(changed.modules[0]?.lines).not.toEqual(first.modules[0]?.lines);
        expect(changed.stats.modulesReused).toBe(0);
    });

    it('resolves tree positions and distinguishes unknown maps from uncovered positions', () => {
        const project = compileProject([{ path: 'src/server/main.luam', source: '\n\nprint(1)\n' }]);
        const map = assembleResource(project, { resourceName: 'demo' }).build?.map;

        expect(map).not.toBeNull();

        if (map === null || map === undefined) {
            return;
        }

        expect(resolveResourcePosition(map, 'src/server/main.lua', 1)).toEqual({
            status: 'resolved',
            position: { file: 'src/server/main.luam', line: 3 },
        });
        expect(resolveResourcePosition(map, 'src/server/missing.lua', 1)).toEqual({ status: 'uncovered' });
        expect(resolveResourcePosition({ ...map, version: 2 }, 'src/server/main.lua', 1)).toEqual({ status: 'unknown-version', version: 2 });
    });
});
