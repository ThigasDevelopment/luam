import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/run';
import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { FALLBACK_RESOURCE_NAME, resolveResourceName } from '@cli/commands/init-command';
import { loadManifest } from '@cli/config/manifest-loader';
import { buildScaffoldPlan } from '@cli/scaffold/scaffold-plan';
import { MANIFEST_FILE_NAME, TEMPLATE_FILES } from '@template/template';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, manifestSource, VALID_SERVER, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function fixture(files: Readonly<Record<string, string>> = {}): ProjectFixture {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created;
}

const answers = { version: '2.0.0', description: 'A prompt description', author: 'Luam Team' };

async function init(root: string, ...args: readonly string[]): Promise<{ code: number; logger: ReturnType<typeof createMemoryLogger> }> {
    const logger = createMemoryLogger();
    const code = await runCli(['init', '--cwd', root, ...args], {
        logger,
        env: OFFLINE,
        initPrompt: async (defaults) => ({ ...defaults, ...answers }),
    });

    return { code, logger };
}

afterEach(() => {
    while (fixtures.length > 0) {
        fixtures.pop()?.dispose();
    }
});

describe('scaffold plan', () => {
    it('renders one file per template entry', async () => {
        expect(buildScaffoldPlan({ ...answers, name: 'demo' }).files.map((file) => file.path)).toEqual(TEMPLATE_FILES.map((file) => file.path));
    });

    it('names the resource in the generated manifest', async () => {
        const manifest = buildScaffoldPlan({ ...answers, name: 'demo' }).files.find((file) => file.path === MANIFEST_FILE_NAME);
        const content = manifest?.content ?? '';

        expect(content).not.toContain('export default');
        expect(content).toContain("name = 'demo'");
        expect(content).toContain("version = '2.0.0'");
        expect(content).toContain("description = 'A prompt description'");
        expect(content).toContain("author = 'Luam Team'");
        expect(content).toContain("outDir = 'build'");
        expect(content).toContain("sourceDirs = { 'src' }");
        expect(content).toContain("assetDirs = { 'assets' }");
    });

    it('scaffolds the project manifest and nothing else', async () => {
        expect(buildScaffoldPlan({ ...answers, name: 'demo' }).files.map((file) => file.path)).toEqual([MANIFEST_FILE_NAME]);
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

    it('uses the destination path and prompted project details', async () => {
        const project = fixture();
        const { code } = await init(project.root, 'resources/race');

        expect(code).toBe(EXIT_OK);
        expect(project.exists(`resources/race/${MANIFEST_FILE_NAME}`)).toBe(true);
        expect(loadManifest(resolve(project.root, 'resources/race')).config).toMatchObject({ ...answers, name: 'race' });
    });

    it('keeps existing files unless force is passed', async () => {
        const kept = manifestSource({ name: 'kept' });
        const project = fixture({ [MANIFEST_FILE_NAME]: kept });
        const first = await init(project.root);

        expect(first.code).toBe(EXIT_OK);
        expect(project.read(MANIFEST_FILE_NAME)).toBe(kept);
        expect(first.logger.warnings.join('\n')).toContain(`Kept the existing "${MANIFEST_FILE_NAME}"`);

        const second = await init(project.root, '--name', 'demo', '--force');

        expect(second.code).toBe(EXIT_OK);
        expect(project.read(MANIFEST_FILE_NAME)).toContain("name = 'demo'");
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
        expect(project.exists(MANIFEST_FILE_NAME)).toBe(false);
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
        expect(project.exists('build/demo/src/server.lua')).toBe(true);
    });

    it('ships nothing the project did not author', async () => {
        const project = fixture({ 'src/server/main.luam': VALID_SERVER });

        await init(project.root, '--name', 'demo');
        await runCli(['build', '--cwd', project.root], { logger: createMemoryLogger(), env: OFFLINE });

        expect(project.exists('build/demo/src/shared/framework/core.lua')).toBe(false);
        expect(project.exists('build/demo/src/server/framework/bootstrap.lua')).toBe(false);
    });
});
