import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { buildResourceAbi, parseResourceAbi, serializeAbi, type ResourceAbi } from '@compiler/project/export-abi';
import { createProjectCache } from '@compiler/project/project-cache';

const PROVIDER = `export function getBalance(id: string): number
    return 0
end

export function describeAccount(id: string, verbose?: boolean): string
    return id
end
`;

function providerAbi(source = PROVIDER): ResourceAbi {
    const result = compileProject([{ path: 'src/server/exports.luam', source }]);

    expect(result.diagnostics).toEqual([]);

    return buildResourceAbi('core', result.modules.flatMap((module) => module.contributions));
}

function codes(files: readonly ProjectFile[], contracts: readonly ResourceAbi[]): string[] {
    return compileProject(files, { contracts }).diagnostics.map((entry) => entry.diagnostic.code);
}

function consumer(body: string): ProjectFile[] {
    return [{ path: 'src/server/main.luam', source: body }];
}

describe('export abi', () => {
    it('records the signature of every export', () => {
        const abi = providerAbi();

        expect(abi.abi).toBe(1);
        expect(abi.resource).toBe('core');
        expect(abi.exports.find((entry) => entry.name === 'getBalance')).toMatchObject({
            side: 'server',
            http: false,
            parameters: [{ name: 'id', type: 'string' }],
            minimumArguments: 1,
            variadic: false,
            returns: 'number',
        });
    });

    it('records an optional parameter as a lower minimum', () => {
        const entry = providerAbi().exports.find((candidate) => candidate.name === 'describeAccount');

        expect(entry?.minimumArguments).toBe(1);
        expect(entry?.parameters).toEqual([
            { name: 'id', type: 'string' },
            { name: 'verbose', type: 'boolean?' },
        ]);
    });

    it('serializes deterministically and round trips', () => {
        const abi = providerAbi();
        const text = serializeAbi(abi);

        expect(text).toBe(serializeAbi(abi));
        expect(parseResourceAbi(text)).toEqual({ ...abi, exports: [...abi.exports].sort((left, right) => (left.name < right.name ? -1 : 1)) });
    });

    it('marks an http export', () => {
        const abi = providerAbi('export http function ping(): string\n    return \'pong\'\nend\n');

        expect(abi.exports[0]?.http).toBe(true);
    });
});

describe('abi input limits', () => {
    it('rejects another abi version', () => {
        expect(parseResourceAbi('{"abi":2,"resource":"core","exports":[]}')).toBeNull();
    });

    it('rejects a resource name that could reach a path', () => {
        expect(parseResourceAbi('{"abi":1,"resource":"../escape","exports":[]}')).toBeNull();
    });

    it('rejects an export with a missing field', () => {
        expect(parseResourceAbi('{"abi":1,"resource":"core","exports":[{"name":"go"}]}')).toBeNull();
    });

    it('rejects an export name that is not an identifier', () => {
        expect(parseResourceAbi('{"abi":1,"resource":"core","exports":[{"name":"go go","side":"server","returns":"any","parameters":[]}]}')).toBeNull();
    });

    it('rejects text that is not json', () => {
        expect(parseResourceAbi('not json')).toBeNull();
    });

    it('rejects a document past the size limit', () => {
        expect(parseResourceAbi(`{"abi":1,"resource":"core","exports":[],"pad":"${'x'.repeat(300000)}"}`)).toBeNull();
    });

    it('accepts a document at the current version', () => {
        expect(parseResourceAbi('{"abi":1,"resource":"core","exports":[]}')).toEqual({ abi: 1, resource: 'core', exports: [] });
    });
});

describe('contract calls', () => {
    const CONTRACTS = [providerAbi()];

    it('checks a literal call through getResourceFromName', () => {
        expect(codes(consumer("local total: number = call(getResourceFromName('core'), 'getBalance', 'id')\n"), CONTRACTS)).toEqual([]);
    });

    it('reports the wrong argument type', () => {
        expect(codes(consumer("call(getResourceFromName('core'), 'getBalance', 1)\n"), CONTRACTS)).toEqual(['check-type-mismatch']);
    });

    it('reports the wrong argument count', () => {
        expect(codes(consumer("call(getResourceFromName('core'), 'getBalance')\n"), CONTRACTS)).toEqual(['check-argument-count']);
    });

    it('reports the wrong return type', () => {
        expect(codes(consumer("local total: string = call(getResourceFromName('core'), 'getBalance', 'id')\n"), CONTRACTS)).toEqual(['check-type-mismatch']);
    });

    it('reports an export the resource does not declare', () => {
        expect(codes(consumer("call(getResourceFromName('core'), 'missing')\n"), CONTRACTS)).toEqual(['check-unknown-resource-export']);
    });

    it('checks the exports table form', () => {
        expect(codes(consumer("local total: number = exports.core:getBalance('id')\n"), CONTRACTS)).toEqual([]);
    });

    it('checks the indexed exports form', () => {
        expect(codes(consumer("local total: number = exports['core']:getBalance(1)\n"), CONTRACTS)).toEqual(['check-type-mismatch']);
    });

    it('leaves a dynamic export name unverified', () => {
        expect(codes(consumer("local name = 'getBalance'\nlocal total = call(getResourceFromName('core'), name, 1)\n"), CONTRACTS)).toEqual([]);
    });

    it('leaves a resource with no contract unverified', () => {
        expect(codes(consumer("call(getResourceFromName('other'), 'anything', 1, 2)\n"), CONTRACTS)).toEqual([]);
    });

    it('reports a client export called from a server file', () => {
        const clientAbi = buildResourceAbi('hud', [
            { kind: 'export', name: 'draw', http: false, side: 'client', signature: null, position: { line: 1, column: 1, offset: 0 } },
        ]);

        expect(codes(consumer("exports.hud:draw()\n"), [clientAbi])).toEqual(['check-resource-export-side']);
    });
});

describe('contract invalidation', () => {
    it('rechecks only the consumers of a changed contract', () => {
        const cache = createProjectCache();
        const files: ProjectFile[] = [
            { path: 'src/server/caller.luam', source: "local total = call(getResourceFromName('core'), 'getBalance', 'id')\n" },
            { path: 'src/server/other.luam', source: 'print(1)\n' },
        ];

        cache.compile(files, { contracts: [providerAbi()] });

        const changed = providerAbi("export function getBalance(id: number): number\n    return id\nend\n");
        const second = cache.compile(files, { contracts: [changed] });

        expect(second.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-type-mismatch']);
    });
});
