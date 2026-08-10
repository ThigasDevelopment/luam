import { caretRow, readExcerpt, type SourceExcerpt } from '@cli/reporting/diagnostic-excerpt';
import { pluralize } from '@cli/reporting/plural';
import type { Reporter } from '@cli/reporting/reporter';
import type { FileDiagnostic } from '@compiler/project/module';

export interface DiagnosticLayoutOptions {
    sources: ReadonlyMap<string, string>;
    maxPerFile?: number;
    maxFiles?: number;
}

export const MAX_ENTRIES_PER_FILE = 10;

export const MAX_FILES = 10;

const GUTTER_WIDTH = 6;

export function groupByFile(entries: readonly FileDiagnostic[]): Map<string, FileDiagnostic[]> {
    const groups = new Map<string, FileDiagnostic[]>();

    for (const entry of entries) {
        const group = groups.get(entry.path);

        if (group === undefined) {
            groups.set(entry.path, [entry]);

            continue;
        }

        group.push(entry);
    }

    return groups;
}

export function splitHint(message: string): { text: string; hint: string | null } {
    const index = message.indexOf('. ');

    if (index < 0) {
        return { text: message, hint: null };
    }

    return { text: message.slice(0, index + 1), hint: message.slice(index + 2) };
}

function gutter(label: string): string {
    return `${label.padStart(GUTTER_WIDTH, ' ')} `;
}

function excerptRows(reporter: Reporter, excerpt: SourceExcerpt): string[] {
    const { style } = reporter;
    const pipe = style.capability.unicode ? '│' : '|';
    const source = `${style.paint('muted', `${gutter(String(excerpt.line))}${pipe}`)} ${excerpt.text}`;
    const caret = `${style.paint('muted', `${gutter('')}${pipe}`)} ${style.paint('warning', caretRow(excerpt))}`;

    return [source, caret];
}

function entryBlock(reporter: Reporter, entry: FileDiagnostic, source: string | undefined): string {
    const { style } = reporter;
    const { diagnostic } = entry;
    const tone = diagnostic.severity === 'error' ? 'error' : 'warning';
    const marker = diagnostic.severity === 'error' ? 'failure' : 'warning';
    const location = `${entry.path}:${diagnostic.position.line}:${diagnostic.position.column}`;
    const { text, hint } = splitHint(diagnostic.message);
    const head = `  ${style.paint(tone, style.marker(marker))} ${location} ${style.paint(tone, diagnostic.severity)} ${style.paint('strong', diagnostic.code)}: ${text}`;
    const excerpt = readExcerpt(source, diagnostic.position);
    const rows = excerpt === null ? [] : excerptRows(reporter, excerpt);
    const hintRow = hint === null ? [] : [`${gutter('')}  ${style.paint('muted', hint)}`];

    return [head, ...rows, ...hintRow].join('\n');
}

function emit(reporter: Reporter, entry: FileDiagnostic, block: string): void {
    if (entry.diagnostic.severity === 'error') {
        reporter.rawError(block);

        return;
    }

    reporter.rawWarn(block);
}

function reportGroup(reporter: Reporter, path: string, entries: readonly FileDiagnostic[], options: DiagnosticLayoutOptions): void {
    const limit = options.maxPerFile ?? MAX_ENTRIES_PER_FILE;
    const source = options.sources.get(path);

    reporter.raw(reporter.style.paint('strong', path));

    for (const entry of entries.slice(0, limit)) {
        emit(reporter, entry, entryBlock(reporter, entry, source));
    }

    if (entries.length > limit) {
        reporter.detail(`  ... and ${pluralize(entries.length - limit, 'more diagnostic')} in this file.`);
    }
}

export function reportGroupedDiagnostics(reporter: Reporter, entries: readonly FileDiagnostic[], options: DiagnosticLayoutOptions): void {
    const groups = [...groupByFile(entries)];
    const limit = options.maxFiles ?? MAX_FILES;

    for (const [path, group] of groups.slice(0, limit)) {
        reportGroup(reporter, path, group, options);
    }

    if (groups.length > limit) {
        reporter.detail(`... and ${pluralize(groups.length - limit, 'more file')} with diagnostics.`);
    }
}
