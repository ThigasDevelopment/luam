import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

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

function codes(source: string, filePath: string): string[] {
    return compile(source, { filePath }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('full catalog coverage', () => {
    const project = compileProject(readProject('mta-api'));

    it('compiles a resource calling a broad set of APIs without diagnostics', () => {
        expect(project.diagnostics).toEqual([]);
        expect(project.hasErrors).toBe(false);
    });

    it('resolves every environment in the fixture', () => {
        expect(project.modules.map((module) => `${module.path} ${module.environment}`)).toEqual([
            'src/client/hud.luam client',
            'src/server/admin.luam server',
            'src/shared/world-tools.luam shared',
        ]);
    });
});

describe('imported API environments', () => {
    it('reports newly imported server-only APIs used on the client', () => {
        expect(codes('setPlayerMuted(source, true)\n', 'src/client/hud.luam')).toEqual(['check-environment-api']);
        expect(codes('getPlayerSerial(source)\n', 'src/client/hud.luam')).toEqual(['check-environment-api']);
        expect(codes('setAccountPassword(source, "x")\n', 'src/client/hud.luam')).toEqual(['check-environment-api']);
    });

    it('reports newly imported client-only APIs used on the server', () => {
        expect(codes('dxDrawLine(0, 0, 1, 1)\n', 'src/server/main.luam')).toEqual(['check-environment-api']);
        expect(codes('guiCreateWindow(0, 0, 1, 1, "x", false)\n', 'src/server/main.luam')).toEqual(['check-environment-api']);
        expect(codes('engineLoadTXD("model.txd")\n', 'src/server/main.luam')).toEqual(['check-environment-api']);
    });

    it('rejects a one-sided API in a shared file', () => {
        expect(codes('dxDrawLine(0, 0, 1, 1)\n', 'src/shared/tools.luam')).toEqual(['check-environment-api']);
        expect(codes('getPlayerSerial(source)\n', 'src/shared/tools.luam')).toEqual(['check-environment-api']);
    });

    it('accepts a newly imported shared API everywhere', () => {
        for (const path of ['src/server/main.luam', 'src/client/hud.luam', 'src/shared/tools.luam']) {
            expect(codes('setElementFrozen(source, true)\n', path)).toEqual([]);
            expect(codes('print(getVehicleName(source))\n', path)).toEqual([]);
        }
    });

    it('keeps an undeclared name available in every environment', () => {
        expect(codes('myProjectHelper(1)\n', 'src/client/hud.luam')).toEqual([]);
    });
});
