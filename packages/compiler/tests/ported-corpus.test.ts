import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { assembleResource } from '@compiler/project/resource';

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url));

function readProject(name: string): ProjectFile[] {
    const root = join(fixtures, name);
    const files: ProjectFile[] = [];

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.luam')) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files.push({ path: relative(root, absolute).split(sep).join('/'), source: readFileSync(absolute, 'utf8') });
    }

    return files.sort((left, right) => left.path.localeCompare(right.path));
}

function baseline(name: string): string {
    return readFileSync(join(fixtures, name, 'diagnostics.txt'), 'utf8');
}

describe('the ported resource corpus', () => {
    const project = compileProject(readProject('ported-resource'));

    it('compiles every shape milestone 45 delivered', () => {
        expect(project.diagnostics).toEqual([]);
        expect(project.hasErrors).toBe(false);
    });

    it('resolves all three environments', () => {
        expect(project.modules.map((module) => `${module.path} ${module.environment}`)).toEqual([
            'src/client/dealership.page.luam client',
            'src/server/database.luam server',
            'src/server/vehicles.service.luam server',
            'src/shared/entities.luam shared',
            'src/shared/registry.luam shared',
            'src/shared/types.d.luam shared',
        ]);
    });

    it('erases the compile-only declarations and keeps the runtime ones', () => {
        const shared = project.modules.find((module) => module.path === 'src/shared/entities.luam')?.code ?? '';

        expect(shared).toContain("class 'GarageEntity'");
        expect(shared).not.toContain('interface Promise');
        expect(shared).not.toContain('type VehicleGarageType');
    });

    it('emits the annotated global without its annotation', () => {
        const service = project.modules.find((module) => module.path === 'src/server/vehicles.service.luam')?.code ?? '';

        expect(service).toContain('garageService = nil');
        expect(service).not.toContain('garageService?:');
    });

    it('generates a manifest naming every module on its side', () => {
        const assembly = assembleResource(project, { author: 'Luam', version: '1.0.0' });

        expect(assembly.build?.manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
        expect(assembly.build?.manifest).toContain('type="client"');
        expect(assembly.build?.manifest).toContain('type="shared"');
    });
});

describe('the corpus keeps its negative half', () => {
    const project = compileProject(readProject('ported-defects'));

    it('matches the checked-in diagnostic baseline', () => {
        const found = project.diagnostics.map((entry) => `${entry.path}:${entry.diagnostic.position.line} ${entry.diagnostic.severity} ${entry.diagnostic.code}`);

        expect(`${found.join('\n')}\n`).toBe(baseline('ported-defects'));
    });

    it('still reports the genuine defects a real resource has', () => {
        const found = project.diagnostics.filter((entry) => entry.path === 'src/server/defects.luam').map((entry) => entry.diagnostic.code);

        expect(found).toEqual(['check-type-mismatch', 'check-unknown-member', 'check-missing-return']);
    });
});
