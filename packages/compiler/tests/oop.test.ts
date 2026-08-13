import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { createProjectCache } from '@compiler/project/project-cache';
import { assembleResource } from '@compiler/project/resource';

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url));

const SERVER_FILE = 'src/server/main.luam';

const CLIENT_FILE = 'src/client/hud.luam';

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

function codes(source: string, filePath = SERVER_FILE, oop = true): string[] {
    return compile(source, { filePath, oop }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string, filePath = SERVER_FILE, oop = true): string[] {
    return compile(source, { filePath, oop }).diagnostics.map((diagnostic) => diagnostic.message);
}

function typeOfLocal(source: string): string {
    const result = compile(source, { filePath: SERVER_FILE, oop: true });

    return result.diagnostics.map((diagnostic) => diagnostic.code).join(',');
}

const PLAYER = 'local player = getPlayerFromName("bob")\n';

describe('mta oop member resolution', () => {
    it('resolves a method and returns its declared type', () => {
        expect(codes(`${PLAYER}local name: string = player:getName()\n`)).toEqual([]);
        expect(typeOfLocal(`${PLAYER}local wrong: number = player:getName()\n`)).toBe('check-type-mismatch');
    });

    it('reports an unknown member and names the class', () => {
        expect(codes(`${PLAYER}player:getNam()\n`)).toEqual(['check-unknown-member']);
        expect(messages(`${PLAYER}player:getNam()\n`)).toEqual(['Class "Player" has no member "getNam".']);
    });

    it('resolves a method inherited from Element', () => {
        expect(codes(`${PLAYER}player:setDimension(0)\n`)).toEqual([]);
        expect(codes(`${PLAYER}local kind: string = player:getType()\n`)).toEqual([]);
    });

    it('types a procedural function that returns an element with the element class', () => {
        expect(codes(`${PLAYER}local other: Player = player\n`)).toEqual([]);
        expect(codes('local vehicle = createVehicle(411, 0, 0, 0)\nvehicle:setColor(1, 2, 3)\n')).toEqual([]);
    });

    it('resolves a property through its getter', () => {
        expect(codes(`${PLAYER}local name: string = player.name\n`)).toEqual([]);
        expect(codes(`${PLAYER}local wrong: number = player.name\n`)).toEqual(['check-type-mismatch']);
    });

    it('reports a wrong argument against the wrapped signature', () => {
        expect(codes(`${PLAYER}player:setNametagText(5)\n`)).toEqual(['check-type-mismatch']);
    });

    it('reports a server-only method called from a client file', () => {
        expect(codes(`${PLAYER}player:kick()\n`, CLIENT_FILE)).toContain('check-environment-api');
        expect(messages(`${PLAYER}player:kick()\n`, CLIENT_FILE)).toContain(
            '"Player.kick" wraps "kickPlayer", which is server-only and is not available in a "client" file.',
        );
    });

    it('accepts a shared method in every environment', () => {
        for (const path of [SERVER_FILE, CLIENT_FILE, 'src/shared/tools.luam']) {
            expect(codes(`${PLAYER}local name = player:getName()\n`, path)).toEqual([]);
        }
    });

    it('reserves native MTA class names while OOP is enabled', () => {
        const source = 'class Player {\n}\n';

        expect(codes(source)).toEqual(['check-duplicate-class']);
        expect(messages(source)).toContain('Class "Player" is reserved by MTA when OOP is enabled.');
    });

    it('allows an MTA class name while OOP is disabled', () => {
        expect(codes('class Player {\n}\n', SERVER_FILE, false)).toEqual([]);
    });

    it('rejects extending a native MTA class', () => {
        const source = 'class Example extends Player {\n}\n';

        expect(codes(source)).toEqual(['check-native-class-inheritance']);
        expect(messages(source)).toEqual(['Class "Example" cannot extend native MTA class "Player".']);
    });

    it('leaves a method call on a non element receiver unchecked', () => {
        expect(codes('local thing = someUnknownFactory()\nthing:whatever(1, 2, 3)\n')).toEqual([]);
    });
});

describe('mta oop gate', () => {
    it('reports check-oop-disabled and names the procedural function', () => {
        expect(codes(`${PLAYER}player:getName()\n`, SERVER_FILE, false)).toEqual(['check-oop-disabled']);
        expect(messages(`${PLAYER}player:getName()\n`, SERVER_FILE, false)[0]).toContain('Call "getPlayerName" instead.');
        expect(messages(`${PLAYER}player:getName()\n`, SERVER_FILE, false)[0]).toContain('Set "oop = true" in .luam.manifest');
    });

    it('reports check-oop-disabled for a property too', () => {
        expect(codes(`${PLAYER}local name = player.name\n`, SERVER_FILE, false)).toEqual(['check-oop-disabled']);
    });

    it('stays silent for a member the OOP surface does not declare', () => {
        expect(codes(`${PLAYER}player:nothingLikeThis()\n`, SERVER_FILE, false)).toEqual([]);
    });

    it('leaves the procedural form untouched with the flag off', () => {
        expect(codes(`${PLAYER}local name = getPlayerName(player)\n`, SERVER_FILE, false)).toEqual([]);
    });
});

describe('mta oop emitter', () => {
    it('emits an OOP call verbatim', () => {
        const source = `${PLAYER}local name = player:getName()\nplayer:setNametagText(name)\n`;
        const emitted = compile(source, { filePath: SERVER_FILE, oop: true }).code;

        expect(emitted).toBe("local player = getPlayerFromName('bob')\nlocal name = player:getName()\nplayer:setNametagText(name)\n");
    });

    it('emits the same Lua whether or not the flag is on', () => {
        const source = `${PLAYER}local name = getPlayerName(player)\n`;
        const enabled = compile(source, { filePath: SERVER_FILE, oop: true }).code;
        const disabled = compile(source, { filePath: SERVER_FILE, oop: false }).code;

        expect(enabled).toBe(disabled);
    });
});

describe('mta oop class values', () => {
    it('types static method calls and their return values', () => {
        expect(codes('local player = Player.getRandom()\nplayer:getName()\n')).toEqual([]);
    });

    it('checks static method arguments and environments', () => {
        expect(codes('local player = Player.getRandom(1)\n')).toEqual(['check-argument-count']);
        expect(codes('local player = Player.getRandom()\n', CLIENT_FILE)).toEqual(['check-environment-api']);
    });

    it('requires the OOP flag for static methods', () => {
        expect(codes('local player = Player.getRandom()\n', SERVER_FILE, false)).toEqual(['check-oop-disabled']);
    });

    it('lets a local value shadow an MTA class value', () => {
        expect(codes('local Player = customFactory()\nPlayer.getRandom()\n')).toEqual([]);
    });

    it('types callable MTA constructors and preserves their Lua syntax', () => {
        const source = 'local file: File = File("data.txt")\nfile:close()\n';
        const result = compile(source, { filePath: SERVER_FILE, oop: true });

        expect(result.diagnostics).toEqual([]);
        expect(result.code).toBe("local file = File('data.txt')\nfile:close()\n");
    });

    it('checks callable constructor arguments and environments', () => {
        expect(codes('local file = File()\n')).toEqual(['check-argument-count']);
        expect(codes('local font = DxFont("font.ttf")\n', SERVER_FILE)).toEqual(['check-environment-api']);
    });

    it('keeps destructive creation as an explicit static method', () => {
        expect(codes('local file: File = File.new("data.txt")\n')).toEqual([]);
    });
});

describe('mta oop manifest', () => {
    const files: ProjectFile[] = [{ path: SERVER_FILE, source: 'local value = 1\n' }];

    it('puts <oop>true</oop> immediately above <info> when enabled', () => {
        const project = compileProject(files);
        const manifest = assembleResource(project, { oop: true }).build?.manifest ?? '';

        expect(manifest.split('\n').slice(0, 3)).toEqual(['<meta>', '    <oop>true</oop>', '    <!-- Resource information -->']);
    });

    it('emits no element when the flag is off or absent', () => {
        const project = compileProject(files);
        const off = assembleResource(project, { oop: false }).build?.manifest ?? '';
        const absent = assembleResource(project, {}).build?.manifest ?? '';

        expect(off).not.toContain('<oop>');
        expect(off).toBe(absent);
    });
});

describe('mta oop project cache', () => {
    const files: ProjectFile[] = [
        { path: SERVER_FILE, source: `${PLAYER}local name = player:getName()\n` },
        { path: 'src/shared/tools.luam', source: 'function helper(): number\n    return 1\nend\n' },
    ];

    it('rechecks every module when the flag flips', () => {
        const cache = createProjectCache();

        expect(cache.compile(files, { oop: true }).stats.modulesReused).toBe(0);
        expect(cache.compile(files, { oop: true }).stats.modulesReused).toBe(files.length);
        expect(cache.compile(files, { oop: false }).stats.modulesReused).toBe(0);
    });

    it('turns the same source into a diagnostic when the flag is off', () => {
        expect(compileProject(files, { oop: true }).hasErrors).toBe(false);
        expect(compileProject(files, { oop: false }).diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-oop-disabled']);
    });
});

describe('mta oop fixture resource', () => {
    const project = compileProject(readProject('mta-oop'), { oop: true });

    it('compiles a resource written against the OOP API without diagnostics', () => {
        expect(project.diagnostics).toEqual([]);
        expect(project.hasErrors).toBe(false);
    });

    it('locks the generated Lua and the manifest', () => {
        const assembly = assembleResource(project, { oop: true });

        expect(project.modules.map((module) => `${module.path}\n${module.code ?? ''}`)).toMatchSnapshot();
        expect(assembly.build?.manifest).toMatchSnapshot();
    });
});
