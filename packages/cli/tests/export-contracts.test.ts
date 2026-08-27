import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, manifestSource, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const CONTRACT_PATH = '.luam/contracts/luam-demo.abi.json';

const PROVIDER = `export function getBalance(id: string): number
    return 0
end
`;

const CORE_CONTRACT = `{
    "abi": 1,
    "resource": "core",
    "exports": [
        {
            "name": "getBalance",
            "side": "server",
            "http": false,
            "parameters": [{ "name": "id", "type": "string" }],
            "minimumArguments": 1,
            "variadic": false,
            "returns": "number"
        }
    ]
}
`;

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

function consumerFiles(body: string): Record<string, string> {
    return {
        ...defaultProjectFiles({ dependencies: ['core'] }),
        '.luam/contracts/core.abi.json': CORE_CONTRACT,
        'src/server/main.luam': body,
    };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('export contracts', () => {
    it('writes the contract of a resource that exports', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': PROVIDER });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists(CONTRACT_PATH)).toBe(true);

        const contract = JSON.parse(fixture.read(CONTRACT_PATH)) as Record<string, unknown>;

        expect(contract.abi).toBe(1);
        expect(contract.resource).toBe('luam-demo');
        expect(contract.exports).toEqual([
            {
                name: 'getBalance',
                side: 'server',
                http: false,
                parameters: [{ name: 'id', type: 'string' }],
                minimumArguments: 1,
                variadic: false,
                returns: 'number',
            },
        ]);
    });

    it('writes no contract for a resource that exports nothing', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists(CONTRACT_PATH)).toBe(false);
    });

    it('checks a call against the contract of a declared dependency', async () => {
        const { context } = harness(consumerFiles("local total: number = call(getResourceFromName('core'), 'getBalance', 'id')\n"));

        expect(await runCheckCommand(context)).toBe(EXIT_OK);
    });

    it('reports a call that does not match the contract', async () => {
        const { context, logger } = harness(consumerFiles("call(getResourceFromName('core'), 'getBalance', 1)\n"));

        expect(await runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('check-type-mismatch');
    });

    it('reports an export the contract does not declare', async () => {
        const { context, logger } = harness(consumerFiles("call(getResourceFromName('core'), 'missing')\n"));

        expect(await runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('check-unknown-resource-export');
    });

    it('ignores a contract file that is not valid', async () => {
        const files = consumerFiles("call(getResourceFromName('core'), 'getBalance', 1)\n");
        const { context, logger } = harness({ ...files, '.luam/contracts/core.abi.json': '{ "abi": 9 }' });

        expect(await runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.text()).toContain('build-invalid-contract');
    });

    it('ignores a contract that names another resource', async () => {
        const files = consumerFiles("call(getResourceFromName('core'), 'getBalance', 1)\n");
        const { context, logger } = harness({ ...files, '.luam/contracts/core.abi.json': CORE_CONTRACT.replace('"core"', '"other"') });

        expect(await runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.text()).toContain('build-invalid-contract');
    });

    it('reads contracts from a directory the manifest names', async () => {
        const files = {
            ...defaultProjectFiles({ dependencies: ['core'], contracts: 'contracts' }),
            'contracts/core.abi.json': CORE_CONTRACT,
            'src/server/main.luam': "call(getResourceFromName('core'), 'getBalance', 1)\n",
        };
        const { context, logger } = harness(files);

        expect(await runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('check-type-mismatch');
    });

    it('refuses a contracts directory that escapes the project', () => {
        const fixture = createProjectFixture({ '.luam.manifest': manifestSource({ name: 'luam-demo', contracts: '../outside' }) });

        fixtures.push(fixture);

        const loaded = loadManifest(fixture.root);

        expect(loaded.diagnostics.some((entry) => entry.message.includes('must stay inside the project directory'))).toBe(true);
    });
});
