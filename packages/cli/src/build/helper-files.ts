import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { resolveHelperUrl, type RuntimeHelperName } from '@runtime/helpers';

function bundledHelperPath(file: string): string {
    return fileURLToPath(new URL(`./lua/${file}`, import.meta.url));
}

export function resolveHelperPath(helper: RuntimeHelperName, file: string): string {
    const packaged = fileURLToPath(resolveHelperUrl(helper));

    return existsSync(packaged) ? packaged : bundledHelperPath(file);
}

export function readHelperSource(helper: RuntimeHelperName, file: string): string {
    return readFileSync(resolveHelperPath(helper, file), 'utf8');
}
