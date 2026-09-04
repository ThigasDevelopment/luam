import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createRuntime, createWorkspaceContext, resolveCommandTarget, resourceContext } from '@cli/cli/cli-runtime';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { loadWorkspace } from '@cli/config/workspace-loader';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import {
    createProjectFixture,
    createWorkspaceFixture,
    defaultProjectFiles,
    manifestSource,
    serverFileSource,
    SERVER_FILE,
    type ProjectFixture,
} from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function workspace(shape: Parameters<typeof createWorkspaceFixture>[0] = {}): ProjectFixture {
    const fixture = createWorkspaceFixture(shape);

    fixtures.push(fixture);

    return fixture;
}

function runtimeAt(cwd: string, logger: MemoryLogger = createMemoryLogger()) {
    return { runtime: createRuntime([], { logger, cwd, env: OFFLINE }), logger };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the workspace file on disk', () => {
    it('resolves serverPath against the directory holding the file, not the working directory', () => {
        const fixture = workspace();
        const loaded = loadWorkspace(resolve(fixture.root, 'resource-a/src/server'));

        expect(loaded?.path).toBe(resolve(fixture.root, SERVER_FILE));
        expect(loaded?.deployment?.serverRoot).toBe(resolve(fixture.root, 'server'));
        expect(loaded?.resources).toEqual(['resource-a', 'resource-b']);
    });
});

describe('workspace mode resolution', () => {
    it('takes project mode when the root holds a manifest', () => {
        const fixture = createProjectFixture(defaultProjectFiles());

        fixtures.push(fixture);

        const { runtime } = runtimeAt(fixture.root);
        const target = resolveCommandTarget(runtime, 'ensure', {});

        expect(target.kind).toBe('project');
    });

    it('takes workspace mode when the root holds only a server file', () => {
        const fixture = workspace();
        const { runtime } = runtimeAt(fixture.root);
        const target = resolveCommandTarget(runtime, 'ensure', {});

        expect(target.kind).toBe('workspace');
        expect(target.workspace?.root).toBe(fixture.root);
        expect(target.workspace?.resources).toEqual(['resource-a', 'resource-b']);
    });

    it('lets --manifest force project mode from any directory', () => {
        const fixture = workspace();
        const { runtime } = runtimeAt(fixture.root);
        const target = resolveCommandTarget(runtime, 'ensure', { manifest: 'resource-a/.luam.manifest' });

        expect(target.kind).toBe('project');
        expect(target.project?.config.name).toBe('resource-a');
    });

    it('names both files and both fixes when the directory resolves to neither', () => {
        const fixture = createProjectFixture({});
        const { runtime, logger } = runtimeAt(fixture.root);

        fixtures.push(fixture);

        const target = resolveCommandTarget(runtime, 'ensure', {});

        expect(target.kind).toBeNull();
        expect(target.error).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain('.luam.manifest');
        expect(logger.errors.join('\n')).toContain('.luam.server');
        expect(logger.errors.join('\n')).toContain('luam init');
    });

    it('stops with a usage error and the file own diagnostics when the server file is invalid', () => {
        const fixture = workspace();

        fixture.write(SERVER_FILE, "resourcesDir = 'resources'\n");

        const { runtime, logger } = runtimeAt(fixture.root);
        const resolved = createWorkspaceContext(runtime, {});

        expect(resolved.error).toBe(EXIT_USAGE);
        expect(logger.text()).toContain('requires a "serverPath" field');
    });
});

describe('a resource inside a workspace', () => {
    it('builds a command context rooted at the resource with the workspace deployment', () => {
        const fixture = workspace();
        const { runtime } = runtimeAt(fixture.root);
        const resolved = createWorkspaceContext(runtime, {});
        const context = resolved.context === null ? null : resourceContext(runtime, resolved.context, 'ensure', 'resource-a').context;

        expect(context?.root).toBe(resolve(fixture.root, 'resource-a'));
        expect(context?.deployment?.serverRoot).toBe(resolve(fixture.root, 'server'));
    });

    it('names the workspace root and lists what was discovered for an unknown name', () => {
        const fixture = workspace();
        const { runtime, logger } = runtimeAt(fixture.root);
        const resolved = createWorkspaceContext(runtime, {});
        const context = resolved.context === null ? null : resourceContext(runtime, resolved.context, 'ensure', 'nope');

        expect(context?.error).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain(fixture.root);
        expect(logger.errors.join('\n')).toContain('"resource-a", "resource-b"');
    });
});

describe('luam ensure at a workspace root', () => {
    it('builds and syncs one named resource and exits zero', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        expect(await runCli(['ensure', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-a/meta.xml')).toBe(true);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-b')).toBe(false);
    });

    it('syncs nothing and exits one when the build fails', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        fixture.write('resource-a/src/server/main.luam', 'function broken(value: string): number\n    return value\nend\n');

        expect(await runCli(['ensure', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-a')).toBe(false);
    });

    it('lists the resources when no name is given', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        expect(await runCli(['ensure'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain('"resource-a", "resource-b"');
    });

    it('reports an unknown resource against what is there', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        expect(await runCli(['ensure', 'nope'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain('is not a resource of the workspace');
    });

    it('keeps working inside a resource directory and reads the server file above it', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        expect(await runCli(['ensure', '--no-watch'], { logger, cwd: resolve(fixture.root, 'resource-a'), env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-a/meta.xml')).toBe(true);
    });
});

describe('luam server at a workspace root', () => {
    it('finds a server to run with no manifest anywhere', () => {
        const fixture = workspace();
        const { runtime } = runtimeAt(fixture.root);
        const target = resolveCommandTarget(runtime, 'server', {});

        expect(target.kind).toBe('workspace');
        expect(target.workspace?.workspace.deployment?.serverRoot).toBe(resolve(fixture.root, 'server'));
    });
});

describe('a manifest under a workspace', () => {
    it('loses its deployment fields to the workspace and warns once naming all three', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        fixture.write(
            'resource-a/.luam.manifest',
            manifestSource({
                name: 'resource-a',
                output: { bundle: false, map: true },
                serverPath: 'other-server',
                resourcesDir: 'mods/deathmatch/other',
                development: { server: { executable: 'other' } },
            }),
        );

        expect(await runCli(['ensure', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);

        const warnings = logger.text().split('\n').filter((line) => line.includes('config-deployment-moved'));

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('"serverPath", "resourcesDir" and "development.server"');
        expect(warnings[0]).toContain(SERVER_FILE);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-a/meta.xml')).toBe(true);
        expect(fixture.exists('other-server')).toBe(false);
    });

    it('warns nothing when it sets none of them', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        expect(await runCli(['ensure', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.text()).not.toContain('config-deployment-moved');
    });

    it('keeps its own development.logs and takes the workspace value when it states none', () => {
        const fixture = workspace({ server: { serverPath: 'server', logs: { enabled: true, rateLimit: 7 } } });

        fixture.write(
            'resource-b/.luam.manifest',
            manifestSource({ name: 'resource-b', output: { bundle: false, map: true }, development: { logs: { enabled: false, rateLimit: 3 } } }),
        );

        const { runtime } = runtimeAt(fixture.root);
        const resolved = createWorkspaceContext(runtime, {});
        const own = resolved.context === null ? null : resourceContext(runtime, resolved.context, 'ensure', 'resource-b').context;
        const inherited = resolved.context === null ? null : resourceContext(runtime, resolved.context, 'ensure', 'resource-a').context;

        expect(own?.deployment?.logs).toMatchObject({ enabled: false, rateLimit: 3 });
        expect(inherited?.deployment?.logs).toMatchObject({ enabled: true, rateLimit: 7 });
    });

    it('promotes the warning to an error under warningsAsErrors', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        fixture.write(
            'resource-a/.luam.manifest',
            manifestSource({ name: 'resource-a', compiler: { warningsAsErrors: true }, output: { bundle: false, map: true }, serverPath: 'other-server' }),
        );

        expect(await runCli(['ensure', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.text()).toContain('config-deployment-moved');
        expect(logger.text()).toContain('Delete the line from the manifest');
    });

    it('behaves exactly as before with no workspace file above it', async () => {
        const fixture = createProjectFixture(defaultProjectFiles({ serverPath: 'server' }));
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['ensure', '--no-watch'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.text()).not.toContain('config-deployment-moved');
        expect(fixture.exists('server/mods/deathmatch/resources/luam-demo/meta.xml')).toBe(true);
    });

    it('reports the warning from luam check as well', async () => {
        const fixture = workspace();
        const logger = createMemoryLogger();

        fixture.write('resource-a/.luam.manifest', manifestSource({ name: 'resource-a', output: { bundle: false, map: true }, serverPath: 'other-server' }));

        expect(await runCli(['check', '--cwd', 'resource-a'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.text()).toContain('config-deployment-moved');
    });
});

describe('the workspace file itself', () => {
    it('carries the fields a manifest no longer has to repeat', () => {
        const fixture = workspace();

        fixture.write(SERVER_FILE, serverFileSource({ serverPath: 'server', resourcesDir: 'mods/deathmatch/resources', executable: 'mta-server64' }));

        const loaded = loadWorkspace(fixture.root);

        expect(loaded?.deployment?.executable).toBe('mta-server64');
        expect(loaded?.deployment?.resourcesDir).toBe('mods/deathmatch/resources');
    });
});
