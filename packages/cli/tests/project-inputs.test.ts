import { afterEach, describe, expect, it } from 'vitest';

import { renderEnvironmentTemplate } from '@cli/build/env-template';
import { readProjectInputs } from '@cli/build/project-inputs';
import { generatedRoots } from '@cli/build/write-options';
import type { LuamConfig } from '@cli/config/config-schema';
import { validateConfig } from '@cli/config/config-validation';
import { parseEnvFile } from '@compiler/project/env-file';

import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function defaultConfig(): LuamConfig {
    const config = validateConfig({ name: 'luam-demo' }, {}).config;

    if (config === null) {
        throw new Error('The default configuration is invalid.');
    }

    return config;
}

function fixture(files: Readonly<Record<string, string>>): ProjectFixture {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created;
}

afterEach(() => {
    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('project inputs', () => {
    it('declares asset directory files and leaves source directory files undeclared', () => {
        const files = { ...defaultProjectFiles(), 'assets/logo.png': 'binary', 'src/server/data/spawns.json': '[]' };
        const inputs = readProjectInputs(fixture(files).root, ['src'], ['assets']);

        expect(inputs.assets).toEqual([
            { path: 'assets/logo.png', source: 'assets/logo.png', isDownloaded: true },
            { path: 'src/server/data/spawns.json', source: 'src/server/data/spawns.json', isDownloaded: false },
        ]);
    });

    it('never treats a Luam source as an asset', () => {
        const inputs = readProjectInputs(fixture(defaultProjectFiles()).root, ['src'], ['assets']);

        expect(inputs.assets).toEqual([]);
    });

    it('reads the configuration only when the project has one', () => {
        const withConfig = readProjectInputs(fixture({ ...defaultProjectFiles(), 'config.lua': 'Config = {}\n' }).root, ['src'], ['assets']);
        const without = readProjectInputs(fixture(defaultProjectFiles()).root, ['src'], ['assets']);

        expect(withConfig.configuration).toEqual({ path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' });
        expect(without.configuration).toBeNull();
    });

    it('reports a malformed env entry with the file that holds it', () => {
        const inputs = readProjectInputs(fixture({ ...defaultProjectFiles(), '.env': 'PORT 3306\n' }).root, ['src'], ['assets']);

        expect(inputs.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['build-env-malformed']);
        expect(inputs.diagnostics[0]?.message).toBe('".env" is malformed: Malformed entry on line 1. Expected "KEY=value".');
    });
});

describe('deployment env template', () => {
    it('blanks a sensitive value and keeps a safe default', () => {
        const rendered = renderEnvironmentTemplate(parseEnvFile('MAX_PLAYERS=32\nDB_PASSWORD=changeme\nSERVER_NAME="Luam Server"\n'));

        expect(rendered).toContain('MAX_PLAYERS=32');
        expect(rendered).toContain('DB_PASSWORD=\n');
        expect(rendered).toContain('SERVER_NAME="Luam Server"');
        expect(rendered).not.toContain('changeme');
    });

    it('states who owns the generated file', () => {
        expect(renderEnvironmentTemplate(parseEnvFile('PORT=1\n'))).toContain('owned by the server administrator');
    });
});

describe('generated roots', () => {
    it('covers asset directories and the runtime library without owning source directories', () => {
        const config = { ...defaultConfig(), sourceDirs: ['src'], assetDirs: ['assets', 'media'] };

        expect(generatedRoots(config)).toEqual(['assets', 'media', 'lib']);
    });
});
