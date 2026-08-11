import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/run';
import { EXIT_OK } from '@cli/cli/exit-codes';
import { resolveResourcePosition, type OutputLayout, type ResourceMap } from '@compiler/project/resource';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('built resource maps', () => {
    it.each<OutputLayout>(['tree', 'bundle'])('resolves an authored line and enclosing symbol in the %s layout', async (layout) => {
        const fixture = createProjectFixture({
            'luam.json': `${JSON.stringify({ name: 'demo', output: { bundle: layout === 'bundle', map: true } }, null, 4)}\n`,
            'src/server/main.luam': ['function announce(): void', "    print('ready')", 'end', ''].join('\n'),
        });

        fixtures.push(fixture);

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger: createMemoryLogger() })).toBe(EXIT_OK);

        const map = JSON.parse(fixture.read('build/demo.luam-map.json')) as ResourceMap;
        const file = map.files.find((entry) => entry.segments.some((segment) => segment.source === 'src/server/main.luam'));
        const segment = file?.segments.find((entry) => entry.source === 'src/server/main.luam');
        const mapping = segment?.lines.find((entry) => entry.symbol === 'announce');

        expect(file).toBeDefined();
        expect(segment).toBeDefined();
        expect(mapping).toBeDefined();

        if (file === undefined || segment === undefined || mapping === undefined) {
            return;
        }

        const generatedLine = segment.contentStartLine + mapping.generatedLine - 1;

        expect(resolveResourcePosition(map, file.path, generatedLine)).toEqual({
            status: 'resolved',
            position: { file: 'src/server/main.luam', line: 2, symbol: 'announce' },
        });
    });
});
