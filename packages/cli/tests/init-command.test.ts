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

const SCAFFOLD_SOURCE = ['function greet(name: string): string', "    return 'hi ' .. name", 'end', ''].join('\n');

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
        expect(content).not.toContain("name = 'demo'");
        expect(content).toContain("version = '2.0.0'");
        expect(content).toContain("description = 'A prompt description'");
        expect(content).toContain("author = { name = 'Luam Team' },");
        expect(content).toContain("output = 'build'");
        expect(content).toContain("{ path = 'src/server/**/*.luam', type = 'server' },");
        expect(content).toContain("#     'assets/**/*.png',");
        expect(content).not.toMatch(/^ {4}files = \{/m);
    });

    it('scaffolds a manifest whose first build reports no warning', async () => {
        const created = fixture();

        expect((await init(created.root)).code).toBe(EXIT_OK);

        created.write('src/shared/config.luam', SCAFFOLD_SOURCE);

        const logger = createMemoryLogger();

        expect(await runCli(['build', '--cwd', created.root], { logger, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.warnings).toEqual([]);
        expect(logger.text()).toContain('0 errors, 0 warnings');
    });

    it('scaffolds the project manifest and nothing else', async () => {
        expect(buildScaffoldPlan({ ...answers, name: 'demo' }).files.map((file) => file.path)).toEqual([MANIFEST_FILE_NAME]);
    });
});

describe('resource name resolution', () => {
    it('names the resource after the directory the scaffold is written into', async () => {
        expect(resolveResourceName('/tmp/anything', 'my-resource')).toBe('my-resource');
        expect(resolveResourceName('/tmp/anything', 'resources/my-resource')).toBe('my-resource');
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
            expect(project.exists(`demo/${file.path}`), file.path).toBe(true);
        }

        expect(project.exists('src')).toBe(false);
        expect(logger.text()).toContain(`Scaffolded "demo" into "${resolve(project.root, 'demo')}"`);
    });

    it('uses the destination path and prompted project details', async () => {
        const project = fixture();
        const { code } = await init(project.root, 'resources/race');

        expect(code).toBe(EXIT_OK);
        expect(project.exists(`resources/race/${MANIFEST_FILE_NAME}`)).toBe(true);
        const config = loadManifest(resolve(project.root, 'resources/race')).config;

        expect(config?.name).toBe('race');
        expect(config?.version).toBe(answers.version);
        expect(config?.description).toBe(answers.description);
        expect(config?.author?.name).toBe(answers.author);
    });

    it('keeps existing files unless force is passed', async () => {
        const kept = manifestSource({});
        const project = fixture({ [MANIFEST_FILE_NAME]: kept });
        const first = await init(project.root);

        expect(first.code).toBe(EXIT_OK);
        expect(project.read(MANIFEST_FILE_NAME)).toBe(kept);
        expect(first.logger.warnings.join('\n')).toContain(`Kept the existing "${MANIFEST_FILE_NAME}"`);

        const second = await init(project.root, '--force');

        expect(second.code).toBe(EXIT_OK);
        expect(project.read(MANIFEST_FILE_NAME)).toContain("description = 'A prompt description'");
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

        await init(project.root);

        const logger = createMemoryLogger();
        const code = await runCli(['build', '--cwd', project.root], { logger, env: OFFLINE });

        expect(logger.errors).toEqual([]);
        expect(code).toBe(EXIT_OK);
        expect(project.exists('build/luam-demo/meta.xml')).toBe(true);
        expect(project.exists('build/luam-demo/src/server.lua')).toBe(true);
    });

    it('ships nothing the project did not author', async () => {
        const project = fixture({ 'src/server/main.luam': VALID_SERVER });

        await init(project.root);
        await runCli(['build', '--cwd', project.root], { logger: createMemoryLogger(), env: OFFLINE });

        expect(project.exists('build/luam-demo/src/shared/framework/core.lua')).toBe(false);
        expect(project.exists('build/luam-demo/src/server/framework/bootstrap.lua')).toBe(false);
    });
});
