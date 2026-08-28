import { ASSERTIONS_SOURCE } from '@cli/testing/harness-assertions';
import { RUNNER_SOURCE } from '@cli/testing/harness-runner';
import type { Environment } from '@compiler/environment/environment';
import { globalsFor } from '@mta-types/catalog';

export const HARNESS_FILE = 'harness.lua';

export const ENTRY_PREFIX = 'main-';

export const SENTINEL = '##luam:test';

export const HARNESS_SOURCE = `${ASSERTIONS_SOURCE}\n${RUNNER_SOURCE}`;

export function entryFile(environment: Environment): string {
    return `${ENTRY_PREFIX}${environment}.lua`;
}

export function stubbedGlobals(environment: Environment): string[] {
    return globalsFor(environment)
        .filter((declaration) => declaration.source === 'mta' && declaration.type.kind === 'function')
        .map((declaration) => declaration.name)
        .sort();
}

export function entrySource(environment: Environment, preload: readonly string[], target: readonly string[]): string {
    const names = stubbedGlobals(environment).map((name) => `    ['${name}'] = true,`);
    const discard = preload.length === 0 ? [] : ['__luamTest.discard()'];
    const lines = [
        '__luamTestNames = {',
        ...names,
        '}',
        `dofile('${HARNESS_FILE}')`,
        ...preload.map((path) => `dofile('${path}')`),
        ...discard,
        ...target.map((path) => `dofile('${path}')`),
        'local failed = __luamTest.run()',
        'os.exit(failed == 0 and 0 or 1)',
    ];

    return `${lines.join('\n')}\n`;
}
