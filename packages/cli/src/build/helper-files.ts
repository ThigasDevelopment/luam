import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
    resolveDevelopmentHelperUrl,
    resolveHelperUrl,
    type DevelopmentRuntimeHelperName,
    type RuntimeHelperName,
} from '@runtime/helpers';

function bundledHelperPath(file: string): string {
    return fileURLToPath(new URL(`./lua/${file}`, import.meta.url));
}

export function resolveHelperPath(helper: RuntimeHelperName | DevelopmentRuntimeHelperName, file: string): string {
    const packaged = fileURLToPath(
        helper.startsWith('development-')
            ? resolveDevelopmentHelperUrl(helper as DevelopmentRuntimeHelperName)
            : resolveHelperUrl(helper as RuntimeHelperName),
    );

    return existsSync(packaged) ? packaged : bundledHelperPath(file);
}

export function readHelperSource(helper: RuntimeHelperName | DevelopmentRuntimeHelperName, file: string): string {
    return readFileSync(resolveHelperPath(helper, file), 'utf8');
}
