import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import type { ManifestEnvironment, ManifestInfo } from '@compiler/project/manifest';
import { assembleResource, outputPath, type ResourceOptions } from '@compiler/project/resource';

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

const SHARED = { src: 'src/shared/**/*.lua', environment: 'shared' as const, group: false };

const SERVER = { src: 'src/server/**/*.lua', environment: 'server' as const, group: false };

const CLIENT = { src: 'src/client/**/*.lua', environment: 'client' as const, group: false };

const SCRIPTS = [SHARED, SERVER, CLIENT];

const RESOURCE = 'luam-demo';

function info(overrides: Partial<ManifestInfo> = {}): ManifestInfo {
    return { author: null, version: null, description: null, ...overrides };
}

function environment(overrides: Partial<ManifestEnvironment> = {}): ManifestEnvironment {
    return { oop: null, minServerVersion: null, minClientVersion: null, ...overrides };
}

function order(...paths: readonly string[]): Map<string, number> {
    return new Map(paths.map((path, index) => [path, index]));
}

const FIXTURE_ORDER = order('src/shared/config.luam', 'src/server/main.luam', 'src/client/hud.luam');

function options(overrides: Partial<ResourceOptions> = {}): ResourceOptions {
    return { resourceName: RESOURCE, scripts: SCRIPTS, order: FIXTURE_ORDER, ...overrides };
}

function sources(manifest: string | undefined): string[] {
    return (manifest?.match(/src="[^"]+"/g) ?? []).map((entry) => entry.slice(5, -1));
}

describe('resource assembly', () => {
    const project = compileProject(readProject('resource'));
    const assembly = assembleResource(project, options({ info: info({ author: { name: 'Thigas', extra: [] }, version: '1.0.0' }) }));

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

    it('names the resource in the root element', () => {
        expect(assembly.build?.manifest.startsWith(`<${RESOURCE}>`)).toBe(true);
        expect(assembly.build?.manifest.trimEnd().endsWith(`</${RESOURCE}>`)).toBe(true);
    });

    it('generates a manifest that matches the authored standard', () => {
        expect(assembly.build?.manifest).toMatchSnapshot();
    });

    it('loads runtime helpers before the scripts that depend on them', () => {
        const entries = sources(assembly.build?.manifest);
        const helpers = entries.filter((entry) => entry.startsWith('lib/'));

        expect(entries.slice(0, helpers.length)).toEqual(helpers);
        expect(helpers).toEqual(['lib/class.lua', 'lib/string.lua', 'lib/table.lua']);
    });

    it('writes every runtime helper flat in the library directory', () => {
        expect(assembly.build?.helpers).toEqual([
            { helper: 'class', file: 'class.lua', path: 'lib/class.lua', environment: 'shared' },
            { helper: 'string', file: 'string.lua', path: 'lib/string.lua', environment: 'client' },
            { helper: 'table', file: 'table.lua', path: 'lib/table.lua', environment: 'shared' },
        ]);
    });

    it('keeps every helper out of the source tree the wildcards cover', () => {
        expect(assembly.build?.helpers.every((helper) => helper.path.startsWith('lib/'))).toBe(true);
        expect(assembly.build?.manifest).not.toContain('src/client/lib');
        expect(assembly.build?.manifest).not.toContain('src/shared/lib');
    });

    it('pins the environment helper to the server regardless of where it is used', () => {
        const build = assembleResource(project, options({ helpers: ['env'] })).build;

        expect(build?.helpers.find((helper) => helper.helper === 'env')).toMatchObject({
            helper: 'env',
            file: 'env.lua',
            path: 'lib/env.lua',
            environment: 'server',
        });
    });

    it('tells the environment helper which file the manifest selected', () => {
        const build = assembleResource(project, options({ helpers: ['env'], environmentFile: '.env.development' })).build;

        expect(build?.helpers.find((helper) => helper.helper === 'env')?.replacements).toEqual({ __LUAM_ENV_FILE__: '.env.development' });
    });

    it('falls back to ".env" when the manifest selects no environment file', () => {
        const build = assembleResource(project, options({ helpers: ['env'] })).build;

        expect(build?.helpers.find((helper) => helper.helper === 'env')?.replacements).toEqual({ __LUAM_ENV_FILE__: '.env' });
    });

    it('emits shared executable code for both sides', () => {
        const shared = assembly.build?.scripts.find((script) => script.path === 'src/shared/config.lua');

        expect(shared?.environment).toBe('shared');
        expect(shared?.content).toContain('RESOURCE_NAME');
        expect(assembly.build?.manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
    });

    it('locks the generated resource output', () => {
        expect(assembly.build?.scripts.map((script) => `${script.path}\n${script.content}`)).toMatchSnapshot();
    });

    it('escapes manifest attribute values', () => {
        const escaped = assembleResource(project, options({ info: info({ description: 'demo "&" <resource>' }) }));

        expect(escaped.build?.manifest).toContain('<info type="script" description="demo &quot;&amp;&quot; &lt;resource&gt;" />');
    });

    it('leaves the resource name out of the info element', () => {
        expect(assembly.build?.manifest).not.toContain('name=');
        expect(assembly.build?.manifest).toContain('<info author="Thigas" type="script" version="1.0.0" />');
    });

    it('writes every extra author key as an info attribute', () => {
        const built = assembleResource(project, options({ info: info({ author: { name: 'dracoN*', extra: [['discord', 'draconzx']] } }) })).build;

        expect(built?.manifest).toContain('<info author="dracoN*" type="script" discord="draconzx" />');
    });

    it('rejects a file discovered twice through overlapping source directories', () => {
        const duplicated = compileProject([
            { path: 'src/server/main.luam', source: 'print(1)\n' },
            { path: 'src/server/main.luam', source: 'print(2)\n' },
        ]);
        const result = assembleResource(duplicated, options());

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
        const built = assembleResource(decorated, options()).build;

        expect(decorated.diagnostics).toEqual([]);
        expect(built?.scripts[0]?.content).toContain('getName = function(self)');
        expect(built?.scripts[0]?.content).toContain('setName = function(self, value)');
        expect(built?.helpers.map((helper) => helper.path)).toContain('lib/class.lua');
    });
});

describe('manifest attribute policy', () => {
    const project = compileProject(readProject('resource'));
    const manifest = assembleResource(project, options()).build?.manifest ?? '';

    it('omits the attributes that equal the MTA default on a server script', () => {
        expect(manifest).toContain('<script src="src/server/**/*.lua" />');
    });

    it('caches nothing on a client or shared script', () => {
        expect(manifest).toContain('<script src="src/client/**/*.lua" type="client" cache="false" />');
        expect(manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
    });

    it('emits one element per authored entry, whatever the number of matching files', () => {
        expect(manifest.match(/\*\*\/\*\.lua/g)).toHaveLength(3);
    });

    it('emits no element for an entry the manifest does not carry', () => {
        const serverOnly = compileProject([{ path: 'src/server/main.luam', source: 'print(1)\n' }]);
        const built = assembleResource(serverOnly, options({ scripts: [SERVER] })).build?.manifest ?? '';

        expect(built).toContain('<script src="src/server/**/*.lua" />');
        expect(built).not.toContain('src/client');
        expect(built).not.toContain('src/shared');
    });

    it('leaves the manifest byte identical when a module is added to an existing entry', () => {
        const before = compileProject([{ path: 'src/server/main.luam', source: 'print(1)\n' }]);
        const after = compileProject([
            { path: 'src/server/main.luam', source: 'print(1)\n' },
            { path: 'src/server/extra.luam', source: 'print(2)\n' },
        ]);
        const only = options({ scripts: [SERVER], order: order('src/server/main.luam', 'src/server/extra.luam') });

        expect(assembleResource(after, only).build?.manifest).toBe(assembleResource(before, only).build?.manifest);
    });

    it('emits no file section when the manifest lists no file', () => {
        expect(manifest).not.toContain('<file');
        expect(manifest).not.toContain('FILES');
    });

    it('emits the oop element whenever the manifest writes the field', () => {
        const enabled = assembleResource(project, options({ environment: environment({ oop: true }) })).build?.manifest ?? '';
        const disabled = assembleResource(project, options({ environment: environment({ oop: false }) })).build?.manifest ?? '';

        expect(enabled).toContain('<oop>true</oop>');
        expect(disabled).toContain('<oop>false</oop>');
        expect(manifest).not.toContain('<oop>');
    });

    it('emits min_mta_version under the environment comment when the build resolved one', () => {
        const built = assembleResource(project, options({ environment: environment({ minServerVersion: '1.6.0', minClientVersion: '1.6.0' }) })).build?.manifest ?? '';

        expect(built).toContain('<min_mta_version server="1.6.0" client="1.6.0" />');
        expect(built.indexOf('<min_mta_version')).toBeLessThan(built.indexOf('<script'));
    });

    it('emits one attribute per side the build resolved', () => {
        const built = assembleResource(project, options({ environment: environment({ minServerVersion: '1.6.0' }) })).build?.manifest ?? '';

        expect(built).toContain('<min_mta_version server="1.6.0" />');
    });

    it('emits no min_mta_version when the build resolved none', () => {
        expect(manifest).not.toContain('min_mta_version');
    });
});

describe('resource order and grouping', () => {
    const files = [
        { path: 'src/shared/config.luam', source: 'RESOURCE_NAME = "demo"\n' },
        { path: 'src/server/index.luam', source: 'print(RESOURCE_NAME)\n' },
        { path: 'src/server/zzz.luam', source: 'print(1)\n' },
    ];
    const covered = order('src/shared/config.luam', 'src/server/index.luam', 'src/server/zzz.luam');

    it('emits the scripts in the order the manifest lists them', () => {
        const scripts = [
            { src: 'src/server/index.lua', environment: 'server' as const, group: false },
            SHARED,
            SERVER,
        ];
        const built = assembleResource(compileProject(files), options({ scripts, order: covered })).build?.manifest ?? '';

        expect(sources(built)).toEqual(['src/server/index.lua', 'src/shared/**/*.lua', 'src/server/**/*.lua']);
    });

    it('moves one element and nothing else when two entries swap', () => {
        const before = assembleResource(compileProject(files), options({ scripts: [SHARED, SERVER], order: covered })).build?.manifest ?? '';
        const after = assembleResource(compileProject(files), options({ scripts: [SERVER, SHARED], order: covered })).build?.manifest ?? '';

        expect(sources(before)).toEqual(['src/shared/**/*.lua', 'src/server/**/*.lua']);
        expect(sources(after)).toEqual(['src/server/**/*.lua', 'src/shared/**/*.lua']);
        expect(before.split('\n').length).toBe(after.split('\n').length);
    });

    it('carries a group boundary from the manifest into the generated file', () => {
        const grouped = [SHARED, { ...SERVER, group: true }];
        const built = assembleResource(compileProject(files), options({ scripts: grouped, order: covered })).build?.manifest ?? '';
        const lines = built.split('\n');
        const index = lines.findIndex((line) => line.includes('src/server/**/*.lua'));

        expect(lines[index - 1]).toBe('');
    });

    it('never opens a group before the first element of a section', () => {
        const built = assembleResource(compileProject(files), options({ scripts: [{ ...SHARED, group: true }, SERVER], order: covered })).build?.manifest ?? '';

        expect(built).not.toContain('SCRIPTS -->\n\n');
    });

    it('groups the files list the same way', () => {
        const list = [
            { src: 'list.xml', group: false },
            { src: 'assets/images/**/*.png', group: true },
            { src: 'assets/shader/**/*.fx', group: false },
        ];
        const built = assembleResource(compileProject(files), options({ files: list, scripts: [SHARED, SERVER], order: covered })).build?.manifest ?? '';
        const lines = built.split('\n');
        const index = lines.findIndex((line) => line.includes('assets/images/**/*.png'));

        expect(lines[index - 1]).toBe('');
        expect(lines[index + 1]).toContain('assets/shader/**/*.fx');
    });

    it('groups the include list the same way', () => {
        const includes = [
            { resource: 'bcg_core', group: false },
            { resource: 'bcg_example', group: true },
        ];
        const built = assembleResource(compileProject(files), options({ includes, scripts: [SHARED, SERVER], order: covered })).build?.manifest ?? '';
        const lines = built.split('\n');
        const index = lines.findIndex((line) => line.includes('bcg_example'));

        expect(lines[index - 1]).toBe('');
    });

    it('emits the includes in the order they were written', () => {
        const includes = [
            { resource: 'zebra', group: false },
            { resource: 'apple', group: false },
        ];
        const built = assembleResource(compileProject(files), options({ includes, scripts: [SHARED, SERVER], order: covered })).build?.manifest ?? '';

        expect(built.indexOf('zebra')).toBeLessThan(built.indexOf('apple'));
    });

    it('orders helpers, then the configuration, then the authored scripts', () => {
        const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' };
        const built = assembleResource(compileProject(files), options({ configuration, helpers: ['class'], scripts: [SHARED, SERVER], order: covered })).build?.manifest ?? '';

        expect(sources(built)).toEqual(['lib/class.lua', 'config.lua', 'src/shared/**/*.lua', 'src/server/**/*.lua']);
    });

    it('never lists the configuration twice when the manifest names it', () => {
        const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' };
        const scripts = [{ src: 'config.lua', environment: 'shared' as const, group: false }, SHARED, SERVER];
        const built = assembleResource(compileProject(files), options({ configuration, scripts, order: covered })).build?.manifest ?? '';

        expect(sources(built)).toEqual(['config.lua', 'src/shared/**/*.lua', 'src/server/**/*.lua']);
    });

    it('orders bundle members by the order discovery gave them', () => {
        const bundled = order('src/server/zzz.luam', 'src/server/index.luam', 'src/shared/config.luam');
        const built = assembleResource(compileProject(files), options({ layout: 'bundle', order: bundled })).build;
        const server = built?.bundles.find((bundle) => bundle.environment === 'server');

        expect(server?.members.map((member) => (member.kind === 'module' ? member.module.source : member.helper.file))).toEqual([
            'src/server/zzz.luam',
            'src/server/index.luam',
        ]);
    });

    it('lists one element per non-empty side under a bundle and names no helper', () => {
        const built = assembleResource(compileProject(files), options({ layout: 'bundle', helpers: ['class'], order: covered })).build?.manifest ?? '';

        expect(sources(built)).toEqual(['src/shared.lua', 'src/server.lua']);
    });
});

describe('resource configuration and files', () => {
    const project = compileProject(readProject('resource'));
    const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = { greeting = "hi" }\n' };
    const assets = [
        { path: 'assets/logo.png', source: 'assets/logo.png', isDownloaded: true },
        { path: 'src/server/data/spawns.json', source: 'src/server/data/spawns.json', isDownloaded: false },
    ];
    const list = [{ src: 'assets/**/*.png', group: false }];
    const build = assembleResource(project, options({ configuration, assets, files: list })).build;

    it('lists the configuration as a shared script between the libraries and the sources', () => {
        const entries = sources(build?.manifest);
        const configurationIndex = entries.indexOf('config.lua');
        const lastLibrary = entries.length - 1 - [...entries].reverse().findIndex((entry) => entry.startsWith('lib/'));
        const firstSource = entries.findIndex((entry) => entry.startsWith('src/'));

        expect(build?.configuration?.environment).toBe('shared');
        expect(configurationIndex).toBe(lastLibrary + 1);
        expect(configurationIndex).toBe(firstSource - 1);
    });

    it('emits one file element per entry rather than one per resolved file', () => {
        expect(build?.manifest).toContain('<file src="assets/**/*.png" />');
        expect(build?.manifest?.match(/<file /g)).toHaveLength(1);
        expect(build?.assets.map((asset) => asset.path)).toEqual(['assets/logo.png', 'src/server/data/spawns.json']);
    });

    it('rejects an asset that lands on a compiled script path', () => {
        const collision = [{ path: 'src/server/main.lua', source: 'assets/src/server/main.lua', isDownloaded: true }];
        const result = assembleResource(project, options({ assets: collision }));

        expect(result.build).toBeNull();
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-duplicate-output']);
    });
});

describe('project environment validation', () => {
    const project = compileProject(readProject('environment'));

    it('reports every cross-environment violation', () => {
        expect(project.hasErrors).toBe(true);
        expect(project.diagnostics.map((entry) => `${entry.path} ${entry.diagnostic.code}`)).toEqual(['src/server/admin.luam project-environment-import']);
    });

    it('explains where the referenced module lives', () => {
        const [violation] = project.diagnostics;

        expect(violation?.diagnostic.message).toBe(
            '"openMenu" is declared in the "client" module "src/client/gui.luam" and cannot be used from a "server" file.',
        );
    });

    it('produces no resource while the project has errors', () => {
        expect(assembleResource(project, options()).build).toBeNull();
    });

    it('allows server and client files to use shared declarations', () => {
        const allowed = compileProject([
            { path: 'src/shared/util.luam', source: 'function formatName(name: string): string\n    return name\nend\n' },
            { path: 'src/server/main.luam', source: 'print(formatName("a"))\n' },
            { path: 'src/client/hud.luam', source: 'print(formatName("b"))\n' },
        ]);

        expect(allowed.diagnostics).toEqual([]);
    });

    it('stops a shared file from using a client declaration', () => {
        const project = compileProject([
            { path: 'src/client/gui.luam', source: 'function openMenu(): void\nend\n' },
            { path: 'src/shared/util.luam', source: 'openMenu()\n' },
        ]);

        expect(project.hasErrors).toBe(true);
        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-environment-import']);
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
