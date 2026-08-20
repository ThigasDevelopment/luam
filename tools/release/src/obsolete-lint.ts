import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

import { RELEASE_HEADING } from '#release/changelog';
import {
    type ObsoleteExemption,
    OBSOLETE_EXEMPTIONS,
    OBSOLETE_FILES,
    OBSOLETE_RULES,
    type ObsoleteRule,
    SCAN_EXTENSIONS,
    SCAN_ROOTS,
} from '#release/obsolete-rules';
import { compareVersionStrings } from '#release/semver';

export interface ObsoleteFinding {
    file: string;
    line: number;
    rule: string;
    match: string;
    replacement: string;
    note: string;
}

export interface LintResult {
    findings: ObsoleteFinding[];
    scanned: number;
    unusedExemptions: ObsoleteExemption[];
}

function toPosix(value: string): string {
    return value.split('\\').join('/');
}

function collect(root: string, entry: string, found: string[]): void {
    const full = join(root, entry);

    if (!existsSync(full)) {
        return;
    }

    if (!statSync(full).isDirectory()) {
        found.push(toPosix(entry));

        return;
    }

    for (const child of readdirSync(full, { withFileTypes: true })) {
        if (child.name === 'node_modules' || child.name.startsWith('.git')) {
            continue;
        }

        collect(root, join(entry, child.name), found);
    }
}

export function scannedFiles(root: string): string[] {
    const found: string[] = [];

    for (const entry of SCAN_ROOTS) {
        collect(root, entry, found);
    }

    return found.filter((file) => SCAN_EXTENSIONS.includes(extname(file)) || file.endsWith('.luam.manifest')).sort();
}

function historicalVersions(lines: string[]): (string | null)[] {
    const context: (string | null)[] = [];

    let current: string | null = null;

    for (const line of lines) {
        if (line.startsWith('## ')) {
            const found = RELEASE_HEADING.exec(line);

            current = found === null ? null : (found[1] ?? null);
        }

        context.push(current);
    }

    return context;
}

function allowedHistorically(rule: ObsoleteRule, version: string | null): boolean {
    if (rule.removedIn === null || version === null) {
        return false;
    }

    return compareVersionStrings(version, rule.removedIn) <= 0;
}

function exemptionFor(file: string, rule: string, line: string): ObsoleteExemption | undefined {
    return OBSOLETE_EXEMPTIONS.find((entry) => entry.file === file && entry.rule === rule && entry.line === line.trim());
}

function lintFile(root: string, file: string, findings: ObsoleteFinding[], used: Set<ObsoleteExemption>): void {
    const lines = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n').split('\n');
    const context = historicalVersions(lines);

    for (const [index, line] of lines.entries()) {
        for (const rule of OBSOLETE_RULES) {
            const matches = line.match(rule.pattern);

            if (matches === null || allowedHistorically(rule, context[index] ?? null)) {
                continue;
            }

            const exemption = exemptionFor(file, rule.id, line);

            if (exemption !== undefined) {
                used.add(exemption);

                continue;
            }

            findings.push({
                file,
                line: index + 1,
                rule: rule.id,
                match: matches[0] ?? '',
                replacement: rule.replacement,
                note: rule.note,
            });
        }
    }
}

function lintFileNames(root: string, files: string[], findings: ObsoleteFinding[]): void {
    for (const file of files) {
        for (const rule of OBSOLETE_FILES) {
            if (!file.endsWith(`/${rule.name}`) && file !== rule.name) {
                continue;
            }

            findings.push({ file, line: 1, rule: rule.id, match: rule.name, replacement: rule.replacement, note: rule.note });
        }
    }
}

export function lintObsolete(root: string): LintResult {
    const files = scannedFiles(root);
    const findings: ObsoleteFinding[] = [];
    const used = new Set<ObsoleteExemption>();

    for (const file of files) {
        lintFile(root, file, findings, used);
    }

    lintFileNames(root, files, findings);

    const unusedExemptions = OBSOLETE_EXEMPTIONS.filter((entry) => !used.has(entry) && existsSync(join(root, entry.file)));

    return { findings: findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line), scanned: files.length, unusedExemptions };
}
