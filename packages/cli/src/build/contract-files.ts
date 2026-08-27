import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { LuamConfig } from '@cli/config/config-schema';
import { cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { abiFileName, parseResourceAbi, serializeAbi, type ResourceAbi } from '@compiler/project/export-abi';

export interface ContractRead {
    contracts: ResourceAbi[];
    diagnostics: CliDiagnostic[];
}

function contractPath(root: string, config: LuamConfig, resource: string): string {
    return resolve(root, config.contracts, abiFileName(resource));
}

export function readDependencyContracts(root: string, config: LuamConfig): ContractRead {
    const contracts: ResourceAbi[] = [];
    const diagnostics: CliDiagnostic[] = [];

    for (const dependency of config.dependencies) {
        const path = contractPath(root, config, dependency);

        let text: string;

        try {
            text = readFileSync(path, 'utf8');
        } catch {
            continue;
        }

        const parsed = parseResourceAbi(text);

        if (parsed === null) {
            diagnostics.push(cliWarning('build-invalid-contract', `The export contract for "${dependency}" at "${path}" could not be read and was ignored.`));

            continue;
        }

        if (parsed.resource !== dependency) {
            diagnostics.push(cliWarning('build-invalid-contract', `The export contract at "${path}" names resource "${parsed.resource}" and was ignored.`));

            continue;
        }

        contracts.push(parsed);
    }

    return { contracts, diagnostics };
}

export function writeResourceContract(root: string, config: LuamConfig, contract: ResourceAbi): string {
    const path = contractPath(root, config, config.name);

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, serializeAbi(contract), 'utf8');

    return path;
}
