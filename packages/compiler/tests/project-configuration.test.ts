import { describe, expect, it } from 'vitest';

import { projectDeclarations } from '@compiler/checker/project-declarations';
import { parseEnvFile } from '@compiler/project/env-file';
import { compileProject } from '@compiler/project/project';

const ENV = parseEnvFile('SERVER_NAME="Luam Server"\nMAX_PLAYERS=32\nDEBUG=false\n');

const declarations = projectDeclarations(ENV.entries, '.env');

function compile(path: string, source: string): ReturnType<typeof compileProject> {
    return compileProject([{ path, source }], { project: declarations });
}

function codes(result: ReturnType<typeof compileProject>): string[] {
    return result.diagnostics.map((entry) => entry.diagnostic.code);
}

describe('process', () => {
    it('is no longer declared, because the runtime no longer publishes it', () => {
        expect(declarations.globals.map((global) => global.name)).toEqual(['env']);
        expect(compile('src/server/main.luam', 'print(process.env.SERVER_NAME)\n').diagnostics).toEqual([]);
    });
});

describe('env typing', () => {
    it('declares env with the same keys as the env file', () => {
        const source = 'local name: string = env.SERVER_NAME\nlocal slots: number = env.MAX_PLAYERS\nlocal debug: boolean = env.DEBUG\n';

        expect(compile('src/server/main.luam', source).diagnostics).toEqual([]);
    });

    it('rejects a value used as the wrong type', () => {
        expect(codes(compile('src/server/main.luam', 'local slots: string = env.MAX_PLAYERS\n'))).toEqual(['check-type-mismatch']);
    });

    it('reports a key the env file does not declare', () => {
        const result = compile('src/server/main.luam', 'print(env.MAX_PLAYER)\n');

        expect(codes(result)).toEqual(['check-unknown-record-key']);
        expect(result.diagnostics[0]?.diagnostic.message).toBe(
            '"MAX_PLAYER" is not a key of "env", declared in ".env". Declared keys: "DEBUG", "MAX_PLAYERS", "SERVER_NAME".',
        );
    });

    it('keeps env off the client', () => {
        expect(codes(compile('src/client/hud.luam', 'print(env.SERVER_NAME)\n'))).toEqual(['check-environment-api']);
    });

    it('leaves env undeclared when the project has no env file', () => {
        const result = compileProject([{ path: 'src/server/main.luam', source: 'print(env.ANYTHING)\n' }]);

        expect(result.diagnostics).toEqual([]);
    });

    it('emits the member access unchanged', () => {
        const result = compile('src/server/main.luam', 'print(env.SERVER_NAME)\n');

        expect(result.modules[0]?.code).toBe('print(env.SERVER_NAME)\n');
    });
});

describe('declaration files', () => {
    it('type checks and produces no output', () => {
        const result = compile('src/shared/vendor.d.luam', 'class Vendor {\n    id: number = 0\n}\n');

        expect(result.diagnostics).toEqual([]);
        expect(result.modules[0]?.code).toBeNull();
        expect(result.modules[0]?.isDeclaration).toBe(true);
    });

    it('makes its declarations visible to the rest of the project', () => {
        const result = compileProject([
            { path: 'src/shared/vendor.d.luam', source: 'class Vendor {\n    id: number = 0\n}\n' },
            { path: 'src/server/main.luam', source: 'local vendor: Vendor = new Vendor()\n\nprint(vendor.id)\n' },
        ]);

        expect(result.diagnostics).toEqual([]);
        expect(result.modules.filter((module) => module.code !== null).map((module) => module.path)).toEqual(['src/server/main.luam']);
    });

    it('takes its environment from its path', () => {
        const result = compileProject([
            { path: 'src/server/vendor.d.luam', source: 'class Vendor {\n    id: number = 0\n}\n' },
            { path: 'src/client/hud.luam', source: 'local vendor: Vendor = new Vendor()\n' },
        ]);

        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-unknown-type', 'check-unknown-class', 'project-environment-import']);
    });

    it('rejects a statement that would have an effect', () => {
        const result = compile('src/shared/vendor.d.luam', 'print(1)\nlocal cached = 2\n');

        expect(codes(result)).toEqual(['check-declaration-file-statement', 'check-declaration-file-statement']);
        expect(result.diagnostics[0]?.diagnostic.message).toBe('A call has no effect in a ".d.luam" file, which holds declarations only.');
    });

    it('types a hand written Lua global through declare and an interface', () => {
        const declaration = 'interface ConfigShape {\n    greeting: string\n    limit: number\n}\n\ndeclare Config: ConfigShape\n';
        const result = compileProject([
            { path: 'src/shared/config.d.luam', source: declaration },
            { path: 'src/server/main.luam', source: 'local greeting: string = Config.greeting\n' },
        ]);

        expect(result.diagnostics).toEqual([]);
    });

    it('reports a misspelled member of a declared table', () => {
        const declaration = 'interface ConfigShape {\n    greeting: string\n}\n\ndeclare Config: ConfigShape\n';
        const result = compileProject([
            { path: 'src/shared/config.d.luam', source: declaration },
            { path: 'src/server/main.luam', source: 'print(Config.greetin)\n' },
        ]);

        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-unknown-member']);
        expect(result.diagnostics[0]?.diagnostic.message).toBe('Interface "ConfigShape" has no member "greetin". Declared members: "greeting".');
    });

    it('scopes a declared global to the environment of its declaration file', () => {
        const result = compileProject([
            { path: 'src/server/secrets.d.luam', source: 'declare Secrets: table\n' },
            { path: 'src/client/hud.luam', source: 'print(Secrets)\n' },
        ]);

        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-environment-import']);
    });

    it('rejects a declare statement outside a declaration file', () => {
        const result = compile('src/server/main.luam', 'declare Config: table\n');

        expect(codes(result)).toEqual(['check-declare-outside-declaration-file']);
    });

    it('lets the declaration win and checks real source against it', () => {
        const declared = { path: 'src/shared/names.d.luam', source: 'declare RESOURCE_NAME: string\n' };
        const matching = compileProject([declared, { path: 'src/shared/config.luam', source: 'RESOURCE_NAME = "demo"\n' }]);
        const conflicting = compileProject([declared, { path: 'src/shared/config.luam', source: 'RESOURCE_NAME = 1\n' }]);

        expect(matching.diagnostics).toEqual([]);
        expect(conflicting.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-type-mismatch']);
    });

    it('accepts the declaration forms it supports', () => {
        const source = 'interface Named {\n    name: string\n}\n\nenum Mode {\n    IDLE,\n    BUSY\n}\n\nfunction describe(mode: Mode): string\n    return "mode"\nend\n';
        const result = compile('src/shared/vendor.d.luam', source);

        expect(result.diagnostics).toEqual([]);
    });
});
