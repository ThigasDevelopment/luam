import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';

import { migrateManifestSource } from '@compiler/manifest/manifest-migration';

import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { MANIFEST_FILE_NAME } from '@cli/config/config-schema';
import type { Reporter } from '@cli/reporting/reporter';

export interface MigrateOptions {
    root: string;
    manifestPath: string;
    reporter: Reporter;
    check?: boolean;
}

function unified(before: string, after: string): string[] {
    const left = before.replace(/\r\n/g, '\n').split('\n');
    const right = after.replace(/\r\n/g, '\n').split('\n');

    return [...left.map((line) => `- ${line}`), ...right.map((line) => `+ ${line}`)];
}

function reportDiff(reporter: Reporter, before: string, after: string): void {
    for (const line of unified(before, after)) {
        reporter.raw(reporter.style.paint(line.startsWith('-') ? 'error' : 'success', line));
    }
}

export function runMigrateCommand(options: MigrateOptions): number {
    const reporter = options.reporter;
    const path = relative(options.root, options.manifestPath) || options.manifestPath;

    if (!existsSync(options.manifestPath)) {
        reporter.error(`No manifest found at "${options.manifestPath}". Run "luam migrate" where a "${MANIFEST_FILE_NAME}" file is.`);

        return EXIT_USAGE;
    }

    const source = readFileSync(options.manifestPath, 'utf8');
    const migration = migrateManifestSource(source, { mode: 'check', root: options.root, env: {} });

    for (const note of migration.notes) {
        reporter.warn(note);
    }

    if (migration.migrated) {
        reporter.info(`"${path}" is already one table of sections. Nothing was written.`);

        return EXIT_OK;
    }

    if (migration.text === null) {
        for (const refusal of migration.refusals) {
            reporter.error(refusal);
        }

        reporter.error(`"${path}" was left alone because the conversion would not have been exact.`);

        return EXIT_DIAGNOSTICS;
    }

    reportDiff(reporter, source, migration.text);

    if (options.check === true) {
        reporter.info(`"${path}" would be rewritten. Run "luam migrate" without "--check" to write it.`);

        return EXIT_DIAGNOSTICS;
    }

    writeFileSync(options.manifestPath, migration.text, 'utf8');
    reporter.success(`Rewrote "${path}" as one table of sections.`);

    return EXIT_OK;
}
