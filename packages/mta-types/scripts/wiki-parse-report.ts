import type { TypeDescriptor } from '#mta-types/type-descriptor';

import { CLASSIFIED } from './wiki-parse-classification.ts';
import type { UnparsedPage, WikiCatalog } from './wiki-declaration-parser.ts';

export interface ArityComparison {
    name: string;
    wiki: readonly [number, number];
    catalog: readonly [number, number];
}

export interface ParseReport {
    pages: number;
    parsed: number;
    parseRate: number;
    unparsed: readonly UnparsedPage[];
    compared: number;
    totalArityAgreement: number;
    requiredArityAgreement: number;
    disagreements: readonly ArityComparison[];
    unclassified: readonly string[];
    staleClassifications: readonly string[];
    narrowing: readonly string[];
}

function arityOf(descriptor: TypeDescriptor | undefined): readonly [number, number] | null {
    return descriptor === undefined || descriptor.kind !== 'function' ? null : [descriptor.parameters.length, descriptor.minimumArguments];
}

export function reportParseAccuracy(
    catalog: WikiCatalog,
    pages: number,
    parsedTypes: ReadonlyMap<string, TypeDescriptor>,
    baseline: ReadonlyMap<string, TypeDescriptor>,
): ParseReport {
    const disagreements: ArityComparison[] = [];
    let compared = 0;
    let sameTotal = 0;
    let sameRequired = 0;

    for (const [name, descriptor] of baseline) {
        const wiki = arityOf(parsedTypes.get(name));
        const declared = arityOf(descriptor);

        if (wiki === null || declared === null) {
            continue;
        }

        compared += 1;
        sameTotal += wiki[0] === declared[0] ? 1 : 0;
        sameRequired += wiki[1] === declared[1] ? 1 : 0;

        if (wiki[0] !== declared[0] || wiki[1] !== declared[1]) {
            disagreements.push({ name, wiki, catalog: declared });
        }
    }

    const seen = new Set(disagreements.map((entry) => entry.name));
    const parsed = pages - catalog.unparsed.length;

    return {
        pages,
        parsed,
        parseRate: pages === 0 ? 1 : parsed / pages,
        unparsed: catalog.unparsed,
        compared,
        totalArityAgreement: compared === 0 ? 1 : sameTotal / compared,
        requiredArityAgreement: compared === 0 ? 1 : sameRequired / compared,
        disagreements: [...disagreements].sort((left, right) => left.name.localeCompare(right.name, 'en')),
        unclassified: disagreements.filter((entry) => !CLASSIFIED.has(entry.name)).map((entry) => entry.name).sort(),
        staleClassifications: [...CLASSIFIED.keys()].filter((name) => !seen.has(name)).sort(),
        narrowing: disagreements.filter((entry) => CLASSIFIED.get(entry.name)?.narrows === true).map((entry) => entry.name).sort(),
    };
}

export function formatParseReport(report: ParseReport): string {
    const percent = (value: number): string => `${(value * 100).toFixed(2)}%`;
    const row = (entry: ArityComparison): string => {
        const verdict = CLASSIFIED.get(entry.name)?.note ?? 'unclassified';

        return `  ${entry.name}: wiki ${entry.wiki.join('/')} catalog ${entry.catalog.join('/')} - ${verdict}`;
    };

    return [
        `parsed ${report.parsed} of ${report.pages} pages (${(report.parseRate * 100).toFixed(1)}%)`,
        ...report.unparsed.map((entry) => `  ${entry.name}: ${entry.reason}`),
        `arity agreement over ${report.compared} shared declarations: ${percent(report.totalArityAgreement)} total, ${percent(report.requiredArityAgreement)} required`,
        `disagreements: ${report.disagreements.length}, of which ${report.narrowing.length} can reject code that compiles today`,
        ...report.disagreements.map(row),
    ].join('\n');
}
