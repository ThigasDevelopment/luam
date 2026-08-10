import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { assembleResource, outputPath } from '@compiler/project/resource';

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url));

function readProject(name: string): ProjectFile[] {
    const root = join(fixtures, name);
    const files: ProjectFile[] = [];

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.luam')) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files.push({ path: relative(root, absolute).replace(/\\/g, '/'), source: readFileSync(absolute, 'utf8') });
    }

    return files.sort((left, right) => left.path.localeCompare(right.path));
}

describe('resource assembly', () => {
    const project = compileProject(readProject('resource'));
    const assembly = assembleResource(project, { author: 'Thigas', version: '1.0.0' });

    it('compiles every environment without diagnostics', () => {
        expect(project.diagnostics).toEqual([]);
        expect(project.hasErrors).toBe(false);
        expect(project.modules.map((module) => `${module.path} ${module.environment}`)).toEqual([
            'src/client/hud.luam client',
            'src/server/main.luam server',
            'src/shared/config.luam shared',
        ]);
    });

    it('mirrors the authored tree and changes only the extension', () => {
        expect(outputPath('src/server/main.luam')).toBe('src/server/main.lua');
        expect(outputPath('./resources/demo/src/shared/util.luam')).toBe('resources/demo/src/shared/util.lua');
        expect(outputPath('src\\client\\ui\\hud.luam')).toBe('src/client/ui/hud.lua');
        expect(outputPath('standalone.luam')).toBe('standalone.lua');
    });

    it('keeps a repeated source segment in the output path', () => {
        expect(outputPath('src/server/src/example.luam')).toBe('src/server/src/example.lua');
    });

    it('generates a manifest that matches the authored standard', () => {
        expect(assembly.build?.manifest).toMatchSnapshot();
    });

    it('loads runtime helpers before the scripts that depend on them', () => {
        const sources = assembly.build?.manifest.match(/src="[^"]+"/g) ?? [];
        const helpers = sources.filter((entry) => entry.includes('src="lib/'));

        expect(sources.slice(0, helpers.length)).toEqual(helpers);
        expect(helpers).toEqual(['src="lib/client/string.lua"', 'src="lib/shared/class.lua"', 'src="lib/shared/table.lua"']);
    });

    it('places each runtime helper under the environment that requires it', () => {
        expect(assembly.build?.helpers).toEqual([
            { helper: 'string', file: 'string.lua', path: 'lib/client/string.lua', environment: 'client' },
            { helper: 'class', file: 'class.lua', path: 'lib/shared/class.lua', environment: 'shared' },
            { helper: 'table', file: 'table.lua', path: 'lib/shared/table.lua', environment: 'shared' },
        ]);
    });

    it('keeps every helper out of the source tree the wildcards cover', () => {
        expect(assembly.build?.helpers.every((helper) => helper.path.startsWith('lib/'))).toBe(true);
        expect(assembly.build?.manifest).not.toContain('src/client/lib');
        expect(assembly.build?.manifest).not.toContain('src/shared/lib');
    });

    it('selects development log helpers only through the explicit development path', () => {
        const normal = assembleResource(project, {}).build;
        const development = assembleResource(project, { developmentLogs: { maxMessageLength: 100, rateLimit: 5, rateWindowMs: 500 } }).build;

        expect(normal?.helpers.some((helper) => helper.helper.startsWith('development-'))).toBe(false);
        expect(development?.helpers.filter((helper) => helper.helper.startsWith('development-')).map((helper) => helper.path)).toEqual([
            'lib/client/development-logs-client.lua',
            'lib/server/development-logs-server.lua',
        ]);
    });

    it('pins a helper that declares an environment regardless of where it is used', () => {
        const build = assembleResource(project, { helpers: ['env'] }).build;

        expect(build?.helpers.find((helper) => helper.helper === 'env')).toEqual({
            helper: 'env',
            file: 'env.lua',
            path: 'lib/server/env.lua',
            environment: 'server',
        });
    });

    it('emits shared executable code for both sides', () => {
        const shared = assembly.build?.scripts.find((script) => script.path === 'src/shared/config.lua');

        expect(shared?.environment).toBe('shared');
        expect(shared?.content).toContain('RESOURCE_NAME');
        expect(assembly.build?.manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
    });

    it('orders shared code before the server and client scripts', () => {
        expect(assembly.build?.scripts.map((script) => script.path)).toEqual([
            'src/shared/config.lua',
            'src/server/main.lua',
            'src/client/hud.lua',
        ]);
    });

    it('locks the generated resource output', () => {
        expect(assembly.build?.scripts.map((script) => `${script.path}\n${script.content}`)).toMatchSnapshot();
    });

    it('escapes manifest attribute values', () => {
        const escaped = assembleResource(project, { description: 'demo "&" <resource>' });

        expect(escaped.build?.manifest).toContain('<info type="script" description="demo &quot;&amp;&quot; &lt;resource&gt;" />');
    });

    it('leaves the resource name out of the manifest', () => {
        expect(assembly.build?.manifest).not.toContain('name=');
        expect(assembly.build?.manifest).toContain('<info author="Thigas" type="script" version="1.0.0" />');
    });

    it('rejects a file discovered twice through overlapping source directories', () => {
        const duplicated = compileProject([
            { path: 'src/server/main.luam', source: 'print(1)\n' },
            { path: 'src/server/main.luam', source: 'print(2)\n' },
        ]);
        const result = assembleResource(duplicated, {});

        expect(result.build).toBeNull();
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-duplicate-output']);
    });

    it('builds a resource with generated accessors and the class helper', () => {
        const decorated = compileProject([
            {
                path: 'src/shared/player.luam',
                source: 'class Player {\n    @Getter\n    @Setter\n    name: string\n}\n',
            },
        ]);
        const built = assembleResource(decorated, {}).build;

        expect(decorated.diagnostics).toEqual([]);
        expect(built?.scripts[0]?.content).toContain('getName = function(self)');
        expect(built?.scripts[0]?.content).toContain('setName = function(self, value)');
        expect(built?.helpers.map((helper) => helper.path)).toContain('lib/shared/class.lua');
    });
});

describe('manifest attribute policy', () => {
    const project = compileProject(readProject('resource'));
    const manifest = assembleResource(project, {}).build?.manifest ?? '';

    it('omits the attributes that equal the MTA default on a server script', () => {
        expect(manifest).toContain('<script src="src/server/**/*.lua" />');
    });

    it('caches nothing on a client or shared script', () => {
        expect(manifest).toContain('<script src="src/client/**/*.lua" type="client" cache="false" />');
        expect(manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
    });

    it('emits one wildcard entry per environment that has modules', () => {
        expect(manifest.match(/\*\*\/\*\.lua/g)).toHaveLength(3);
    });

    it('emits no entry for an environment with no modules', () => {
        const serverOnly = compileProject([{ path: 'src/server/main.luam', source: 'print(1)\n' }]);
        const built = assembleResource(serverOnly, {}).build?.manifest ?? '';

        expect(built).toContain('<script src="src/server/**/*.lua" />');
        expect(built).not.toContain('src/client');
        expect(built).not.toContain('src/shared');
    });

    it('leaves the manifest byte identical when a module is added to an existing environment', () => {
        const before = compileProject([{ path: 'src/server/main.luam', source: 'print(1)\n' }]);
        const after = compileProject([
            { path: 'src/server/main.luam', source: 'print(1)\n' },
            { path: 'src/server/extra.luam', source: 'print(2)\n' },
        ]);

        expect(assembleResource(after, {}).build?.manifest).toBe(assembleResource(before, {}).build?.manifest);
    });

    it('emits no asset section when the project has no downloaded asset', () => {
        expect(manifest).not.toContain('<file');
        expect(manifest).not.toContain('Assets');
    });

    it('emits the oop flag above the info element', () => {
        const built = assembleResource(project, { oop: true }).build?.manifest ?? '';

        expect(built.indexOf('<oop>true</oop>')).toBeLessThan(built.indexOf('<info'));
    });

    it('emits min_mta_version last when the build resolved one', () => {
        const built = assembleResource(project, { minMtaVersion: '1.6.0' }).build?.manifest ?? '';

        expect(built).toContain('<min_mta_version server="1.6.0" client="1.6.0" />');
        expect(built.indexOf('<min_mta_version')).toBeGreaterThan(built.indexOf('<script'));
    });

    it('emits no min_mta_version when the build resolved none', () => {
        expect(manifest).not.toContain('min_mta_version');
    });

    it('enumerates a directory whose files do not all match the environment their path implies', () => {
        const mixed = compileProject([
            { path: 'src/shared/util.luam', source: 'function shared1(): void\nend\n' },
            { path: 'src/shared/admin.luam', source: '#!server\n\nfunction adminOnly(): void\nend\n' },
        ]);
        const built = assembleResource(mixed, {}).build?.manifest ?? '';

        expect(built).not.toContain('**/*.lua');
        expect(built).toContain('<script src="src/shared/admin.lua" />');
        expect(built).toContain('<script src="src/shared/util.lua" type="shared" cache="false" />');
    });
});

describe('resource load order', () => {
    const files = [
        { path: 'src/shared/config.luam', source: 'RESOURCE_NAME = "demo"\n' },
        { path: 'src/server/index.luam', source: 'print(RESOURCE_NAME)\n' },
        { path: 'src/server/zzz.luam', source: 'print(1)\n' },
    ];
    const assets = [
        { path: 'assets/shaders/base.fx', source: 'assets/shaders/base.fx', isDownloaded: true },
        { path: 'assets/shaders/water.fx', source: 'assets/shaders/water.fx', isDownloaded: true },
    ];

    function entries(loadOrder: readonly string[]): string[] {
        const built = assembleResource(compileProject(files), { assets, loadOrder }).build?.manifest ?? '';

        return (built.match(/src="[^"]+"/g) ?? []).map((entry) => entry.slice(5, -1));
    }

    it('puts a pinned script ahead of its environment group', () => {
        expect(entries(['src/server/index.luam'])).toEqual([
            'src/server/index.lua',
            'src/shared/**/*.lua',
            'src/server/**/*.lua',
            'assets/shaders/base.fx',
            'assets/shaders/water.fx',
        ]);
    });

    it('emits the compiled path for a pinned source file', () => {
        expect(entries(['src/server/index.luam'])[0]).toBe('src/server/index.lua');
    });

    it('puts a pinned asset ahead of the rest', () => {
        expect(entries(['assets/shaders/water.fx']).slice(-2)).toEqual(['assets/shaders/water.fx', 'assets/shaders/base.fx']);
    });

    it('keeps the declared order across the pinned entries', () => {
        const ordered = entries(['src/server/zzz.luam', 'src/server/index.luam']);

        expect(ordered.slice(0, 2)).toEqual(['src/server/zzz.lua', 'src/server/index.lua']);
    });

    it('fails the build when an entry matches no file', () => {
        const result = assembleResource(compileProject(files), { assets, loadOrder: ['src/server/missing.luam'] });

        expect(result.build).toBeNull();
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-load-order-missing']);
        expect(result.diagnostics[0]?.diagnostic.message).toContain('src/server/missing.luam');
    });

    it('orders helpers, then the configuration, then the sources', () => {
        const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' };
        const built = assembleResource(compileProject(files), { configuration, helpers: ['class'] }).build?.manifest ?? '';
        const sources = (built.match(/src="[^"]+"/g) ?? []).map((entry) => entry.slice(5, -1));

        expect(sources).toEqual(['lib/shared/class.lua', 'config.lua', 'src/shared/**/*.lua', 'src/server/**/*.lua']);
    });
});

describe('resource configuration and assets', () => {
    const project = compileProject(readProject('resource'));
    const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = { greeting = "hi" }\n' };
    const assets = [
        { path: 'assets/logo.png', source: 'assets/logo.png', isDownloaded: true },
        { path: 'src/server/data/spawns.json', source: 'src/server/data/spawns.json', isDownloaded: false },
    ];
    const build = assembleResource(project, { configuration, assets }).build;

    it('lists the configuration as a shared script between the libraries and the sources', () => {
        const entries: string[] = build?.manifest.match(/src="[^"]+"/g) ?? [];
        const configurationIndex = entries.indexOf('src="config.lua"');
        const lastLibrary = entries.length - 1 - [...entries].reverse().findIndex((entry: string) => entry.startsWith('src="lib/'));
        const firstSource = entries.findIndex((entry: string) => entry.startsWith('src="src/'));

        expect(build?.configuration?.environment).toBe('shared');
        expect(configurationIndex).toBe(lastLibrary + 1);
        expect(configurationIndex).toBe(firstSource - 1);
    });

    it('keeps the group order when a source file is renamed', () => {
        const renamed = compileProject([
            { path: 'src/shared/config.luam', source: 'RESOURCE_NAME = "demo"\n' },
            { path: 'src/server/zzz-last.luam', source: 'print(RESOURCE_NAME)\n' },
        ]);
        const entries = assembleResource(renamed, { configuration }).build?.manifest.match(/src="[^"]+"/g) ?? [];

        expect(entries[0]).toBe('src="config.lua"');
        expect(entries.slice(1)).toEqual(['src="src/shared/**/*.lua"', 'src="src/server/**/*.lua"']);
    });

    it('declares only the downloaded assets as manifest files', () => {
        expect(build?.manifest).toContain('<file src="assets/logo.png" />');
        expect(build?.manifest).not.toContain('spawns.json');
        expect(build?.assets.map((asset) => asset.path)).toEqual(['assets/logo.png', 'src/server/data/spawns.json']);
    });

    it('never declares the environment file as a downloadable file', () => {
        const leaked = [{ path: '.env', source: '.env', isDownloaded: true }];
        const result = assembleResource(project, { assets: leaked });

        expect(result.build?.manifest).not.toContain('.env');
        expect(result.build?.assets.map((asset) => asset.path)).toEqual(['.env']);
    });

    it('rejects an asset that lands on a compiled script path', () => {
        const collision = [{ path: 'src/server/main.lua', source: 'assets/src/server/main.lua', isDownloaded: true }];
        const result = assembleResource(project, { assets: collision });

        expect(result.build).toBeNull();
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-duplicate-output']);
    });
});

describe('project environment validation', () => {
    const project = compileProject(readProject('environment'));

    it('reports every cross-environment violation', () => {
        expect(project.hasErrors).toBe(true);
        expect(project.diagnostics.map((entry) => `${entry.path} ${entry.diagnostic.code}`)).toEqual([
            'src/server/admin.luam project-environment-import',
            'src/shared/tools.luam check-environment-api',
        ]);
    });

    it('explains where the referenced module lives', () => {
        const [violation] = project.diagnostics;

        expect(violation?.diagnostic.message).toBe(
            '"openMenu" is declared in the "client" module "src/client/gui.luam" and cannot be used from a "server" file.',
        );
    });

    it('produces no resource while the project has errors', () => {
        expect(assembleResource(project, {}).build).toBeNull();
    });

    it('allows server and client files to use shared declarations', () => {
        const allowed = compileProject([
            { path: 'src/shared/util.luam', source: 'function formatName(name: string): string\n    return name\nend\n' },
            { path: 'src/server/main.luam', source: 'print(formatName("a"))\n' },
            { path: 'src/client/hud.luam', source: 'print(formatName("b"))\n' },
        ]);

        expect(allowed.diagnostics).toEqual([]);
    });

    it('stops a shared file from using a server declaration', () => {
        const project = compileProject([
            { path: 'src/server/db.luam', source: 'function loadRow(): number\n    return 1\nend\n' },
            { path: 'src/shared/util.luam', source: 'print(loadRow())\n' },
        ]);

        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-environment-import']);
    });

    it('lets a server class extend a shared class', () => {
        const project = compileProject([
            { path: 'src/shared/listener.luam', source: 'class Listener {\n    event: string = ""\n}\n' },
            {
                path: 'src/server/join.luam',
                source: 'class JoinListener extends Listener {\n    event: string = "onPlayerJoin"\n}\n\nlocal handler = new JoinListener()\n\nprint(handler.event)\n',
            },
        ]);

        expect(project.diagnostics).toEqual([]);
    });

    it('lets a server class implement a shared interface', () => {
        const project = compileProject([
            { path: 'src/shared/contract.luam', source: 'interface Named {\n    name: string\n}\n' },
            { path: 'src/server/kick.luam', source: 'class KickCommand implements Named {\n    name: string = "kick"\n}\n' },
        ]);

        expect(project.diagnostics).toEqual([]);
    });

    it('stops a shared class from extending a server class', () => {
        const project = compileProject([
            { path: 'src/server/base.luam', source: 'class Base {\n    id: number = 1\n}\n' },
            { path: 'src/shared/derived.luam', source: 'class Derived extends Base {\n    id: number = 2\n}\n' },
        ]);

        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-unknown-class', 'project-environment-import']);
    });

    it('reports a class declared twice across visible modules', () => {
        const project = compileProject([
            { path: 'src/shared/one.luam', source: 'class Core {\n    id: number = 1\n}\n' },
            { path: 'src/shared/two.luam', source: 'class Core {\n    id: number = 2\n}\n' },
        ]);

        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-duplicate-class', 'check-duplicate-class']);
    });

    it('keeps a global declared by the file itself out of the import check', () => {
        const project = compileProject([
            { path: 'src/client/gui.luam', source: 'MENU_OPEN = false\n' },
            { path: 'src/server/main.luam', source: 'STATE = 1\nprint(STATE)\n' },
        ]);

        expect(project.diagnostics).toEqual([]);
    });
});
