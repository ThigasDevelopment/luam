import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { resolveTemplateUrl } from '@template/template';

function bundledTemplatePath(source: string): string {
    return fileURLToPath(new URL(`./template/${source}`, import.meta.url));
}

export function resolveTemplatePath(source: string): string {
    const packaged = fileURLToPath(resolveTemplateUrl(source));

    return existsSync(packaged) ? packaged : bundledTemplatePath(source);
}

export function readTemplateSource(source: string): string {
    return readFileSync(resolveTemplatePath(source), 'utf8');
}
