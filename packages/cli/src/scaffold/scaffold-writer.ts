import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { ScaffoldPlan } from '@cli/scaffold/scaffold-plan';

export interface ScaffoldResult {
    written: string[];
    skipped: string[];
}

export function writeScaffold(targetDir: string, plan: ScaffoldPlan, force: boolean): ScaffoldResult {
    const written: string[] = [];
    const skipped: string[] = [];

    for (const file of plan.files) {
        const absolute = resolve(targetDir, file.path);

        if (!force && existsSync(absolute)) {
            skipped.push(file.path);

            continue;
        }

        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, file.content, 'utf8');
        written.push(file.path);
    }

    return { written: written.sort((left, right) => left.localeCompare(right)), skipped: skipped.sort((left, right) => left.localeCompare(right)) };
}
