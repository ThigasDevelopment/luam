import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/dispatch';
import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { FALLBACK_RESOURCE_NAME, resolveResourceName } from '@cli/commands/init-command';
import { buildScaffoldPlan } from '@cli/scaffold/scaffold-plan';
import { TEMPLATE_FILES } from '@template/template';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, VALID_SERVER, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function fixture(files: Readonly<Record<string, string>> = {}): ProjectFixture {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created;
}

async function init(root: string, ...args: readonly string[]): Promise<{ code: number; logger: ReturnType<typeof createMemoryLogger> }> {
    const logger = createMemoryLogger();
    const code = await runCli(['init', '--cwd', root, ...args], { logger, env: OFFLINE });

    return { code, logger };
}

afterEach(() => {
    while (fixtures.length > 0) {
        fixtures.pop()?.dispose();
    }
});

describe('scaffold plan', () => {
    it('renders one file per template entry', async () => {
        expect(buildScaffoldPlan('demo').files.map((file) => file.path)).toEqual(TEMPLATE_FILES.map((file) => file.path));
    });

    it('names the resource in the generated configuration', async () => {
        const config = buildScaffoldPlan('demo').files.find((file) => file.path === 'luam.json');
        const parsed: unknown = JSON.parse(config?.content ?? '{}');

        expect(parsed).toMatchObject({ name: 'demo', outDir: 'build', assetDirs: ['assets'], sourceDirs: ['src'] });
    });

    it('scaffolds the project manifest and nothing else', async () => {
        expect(buildScaffoldPlan('demo').files.map((file) => file.path)).toEqual(['luam.json']);
    });
});

describe('resource name resolution', () => {
    it('prefers an explicit name', async () => {
        expect(resolveResourceName('/tmp/anything', 'my-resource')).toBe('my-resource');
    });

    it('falls back to the project directory name', async () => {
        expect(resolveResourceName('/tmp/gamemode-race', null)).toBe('gamemode-race');
    });

    it('falls back to a default when the directory name is not a resource name', async () => {
        expect(resolveResourceName('/tmp/@scope', null)).toBe(FALLBACK_RESOURCE_NAME);
    });
});

describe('luam init', () => {
    it('writes the project manifest and no sources', async () => {
        const project = fixture();
        const { code, logger } = await init(project.root, '--name', 'demo');

        expect(code).toBe(EXIT_OK);

        for (const file of TEMPLATE_FILES) {
            expect(project.exists(file.path), file.path).toBe(true);
        }

        expect(project.exists('src')).toBe(false);
        expect(logger.text()).toContain(`Scaffolded "demo" into "${project.root}"`);
    });

    it('keeps existing files unless force is passed', async () => {
        const project = fixture({ 'luam.json': '{ "name": "kept" }\n' });
        const first = await init(project.root);

        expect(first.code).toBe(EXIT_OK);
        expect(project.read('luam.json')).toBe('{ "name": "kept" }\n');
        expect(first.logger.warnings.join('\n')).toContain('Kept the existing "luam.json"');

        const second = await init(project.root, '--name', 'demo', '--force');

        expect(second.code).toBe(EXIT_OK);
        expect(project.read('luam.json')).toContain('"name": "demo"');
    });

    it('reports when nothing was written', async () => {
        const project = fixture();

        await init(project.root, '--name', 'demo');

        const again = await init(project.root, '--name', 'demo');

        expect(again.code).toBe(EXIT_OK);
        expect(again.logger.text()).toContain('Nothing was written.');
    });

    it('rejects a name MTA cannot use', async () => {
        const project = fixture();
        const { code, logger } = await init(project.root, '--name', 'not a resource');

        expect(code).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain('"--name" must be a valid MTA resource name');
        expect(project.exists('luam.json')).toBe(false);
    });

    it('needs no configuration to run', async () => {
        const project = fixture();

        expect((await init(project.root)).code).toBe(EXIT_OK);
    });
});

describe('an initialized project', () => {
    it('builds once the first source file exists', async () => {
        const project = fixture({ 'src/server/main.luam': VALID_SERVER });

        await init(project.root, '--name', 'demo');

        const logger = createMemoryLogger();
        const code = await runCli(['build', '--cwd', project.root], { logger, env: OFFLINE });

        expect(logger.errors).toEqual([]);
        expect(code).toBe(EXIT_OK);
        expect(project.exists('build/demo/meta.xml')).toBe(true);
        expect(project.exists('build/demo/src/server/main.lua')).toBe(true);
    });

    it('ships nothing the project did not author', async () => {
        const project = fixture({ 'src/server/main.luam': VALID_SERVER });

        await init(project.root, '--name', 'demo');
        await runCli(['build', '--cwd', project.root], { logger: createMemoryLogger(), env: OFFLINE });

        expect(project.exists('build/demo/src/shared/framework/core.lua')).toBe(false);
        expect(project.exists('build/demo/src/server/framework/bootstrap.lua')).toBe(false);
    });
});
