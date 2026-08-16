import { afterEach, describe, expect, it } from 'vitest';

import { readProjectInputs } from '@cli/build/project-inputs';
import { generatedRoots } from '@cli/build/write-options';
import type { LuamConfig } from '@cli/config/config-schema';
import { DEFAULT_ENVIRONMENT_FILES, type AssetMapping } from '@compiler/manifest/manifest-defaults';
import { parseEnvFile } from '@compiler/project/env-file';
import { renderEnvironmentScript } from '@compiler/project/resource';

import { createProjectFixture, defaultProjectFiles, manifestConfig, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function defaultConfig(): LuamConfig {
    return manifestConfig({ name: 'luam-demo' });
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

const ASSETS: AssetMapping[] = [{ from: 'assets/**/*', to: 'assets' }];

function inputsOf(root: string, assets: readonly AssetMapping[] = ASSETS) {
    return readProjectInputs(root, { assets, environment: DEFAULT_ENVIRONMENT_FILES });
}

describe('project inputs', () => {
    it('declares the files a mapping names and keeps their destination', () => {
        const files = { ...defaultProjectFiles(), 'assets/logo.png': 'binary', 'assets/ui/panel.png': 'binary' };
        const inputs = inputsOf(fixture(files).root);

        expect(inputs.assets).toEqual([
            { path: 'assets/logo.png', source: 'assets/logo.png', isDownloaded: true },
            { path: 'assets/ui/panel.png', source: 'assets/ui/panel.png', isDownloaded: true },
        ]);
    });

    it('rewrites the destination when the mapping renames it', () => {
        const inputs = inputsOf(fixture({ ...defaultProjectFiles(), 'media/logo.png': 'binary' }).root, [{ from: 'media/**/*', to: 'images' }]);

        expect(inputs.assets).toEqual([{ path: 'images/logo.png', source: 'media/logo.png', isDownloaded: true }]);
    });

    it('declares nothing when no mapping is listed', () => {
        const inputs = inputsOf(fixture({ ...defaultProjectFiles(), 'assets/logo.png': 'binary' }).root, []);

        expect(inputs.assets).toEqual([]);
    });

    it('reads the configuration only when the project has one', () => {
        const withConfig = inputsOf(fixture({ ...defaultProjectFiles(), 'config.lua': 'Config = {}\n' }).root);
        const without = inputsOf(fixture(defaultProjectFiles()).root);

        expect(withConfig.configuration).toEqual({ path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' });
        expect(without.configuration).toBeNull();
    });

    it('reports a malformed env entry with the file that holds it', () => {
        const inputs = inputsOf(fixture({ ...defaultProjectFiles(), '.env': 'PORT 3306\n' }).root);

        expect(inputs.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['build-env-malformed']);
        expect(inputs.diagnostics[0]?.message).toBe('".env" is malformed: Malformed entry on line 1. Expected "KEY=value".');
    });
});

describe('deployment env script', () => {
    it('blanks a sensitive value and keeps a safe default', () => {
        const rendered = renderEnvironmentScript(parseEnvFile('MAX_PLAYERS=32\nDB_PASSWORD=changeme\nSERVER_NAME="Luam Server"\nDEBUG=true\n'));

        expect(rendered).toContain('    MAX_PLAYERS = 32,');
        expect(rendered).toContain("    DB_PASSWORD = '',");
        expect(rendered).toContain("    SERVER_NAME = 'Luam Server',");
        expect(rendered).toContain('    DEBUG = true,');
        expect(rendered).not.toContain('changeme');
    });

    it('escapes a value that would break out of its Lua literal', () => {
        expect(renderEnvironmentScript(parseEnvFile('MOTD="it\'s here"\n'))).toContain("MOTD = 'it\\'s here',");
    });

    it('states who owns the generated file', () => {
        expect(renderEnvironmentScript(parseEnvFile('PORT=1\n'))).toContain('owned by the server administrator');
    });

    it('guards an undeclared key and keeps the table read-only', () => {
        const rendered = renderEnvironmentScript(parseEnvFile('PORT=1\n'));

        expect(rendered).toContain('is not declared in "env.lua"');
        expect(rendered).toContain('The environment is read-only');
        expect(rendered).toContain('process.env = env');
    });
});

describe('generated roots', () => {
    it('covers asset destinations and the runtime library without owning source directories', () => {
        const config: LuamConfig = {
            ...defaultConfig(),
            assets: [
                { from: 'assets/**/*', to: 'assets' },
                { from: 'media/**/*', to: 'media' },
            ],
        };

        expect(generatedRoots(config)).toEqual(['assets', 'media', 'lib']);
    });
});
