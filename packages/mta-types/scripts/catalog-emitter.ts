import type { ApiEnvironment } from '#mta-types/api-declaration';
import type { TypeDescriptor } from '#mta-types/type-descriptor';

import { collectHelpers, printDescriptor } from './descriptor-printer.ts';
import type { CatalogEntry, GeneratedFile } from './generator-model.ts';

const MAX_BODY_LINES = 240;
const MAX_LINE_LENGTH = 150;

const AGGREGATES: Readonly<Record<ApiEnvironment, string>> = {
    shared: 'MTA_SHARED_GLOBALS',
    server: 'MTA_SERVER_GLOBALS',
    client: 'MTA_CLIENT_GLOBALS',
};

function moduleName(category: string, environment: ApiEnvironment, chunk: number): string {
    const suffix = chunk === 1 ? '' : `-${chunk}`;

    return `mta-${category.replaceAll('_', '-')}-${environment}${suffix}`;
}

function symbolName(module: string): string {
    return module.replaceAll('-', '_').toUpperCase();
}

function wrapDescriptor(descriptor: TypeDescriptor, indent: string): string[] {
    const single = `${indent}${printDescriptor(descriptor)},`;

    if (single.length <= MAX_LINE_LENGTH) {
        return [single];
    }

    if (descriptor.kind === 'tuple') {
        const elements = descriptor.elements.map((element) => `${indent}    ${printDescriptor(element)},`);

        return [`${indent}tupleOf([`, ...elements, `${indent}]),`];
    }

    if (descriptor.kind === 'union') {
        const options = descriptor.options.map((option) => `${indent}    ${printDescriptor(option)},`);

        return [`${indent}unionOf([`, ...options, `${indent}]),`];
    }

    return [single];
}

function wrapFunction(name: string, entry: CatalogEntry): string[] {
    if (entry.type.kind !== 'function') {
        return [`    ${name}: ${printDescriptor(entry.type)},`];
    }

    const parameters = entry.type.parameters.map(printDescriptor);
    const tail = [String(entry.type.minimumArguments)];

    if (entry.type.isVariadic) {
        tail.push('true');
    }

    const returned = wrapDescriptor(entry.type.returnType, '        ');
    const inline = `        [${parameters.join(', ')}],`;

    if (inline.length <= MAX_LINE_LENGTH) {
        return [`    ${name}: fn(`, inline, ...returned, ...tail.map((part) => `        ${part},`), '    ),'];
    }

    const listed = ['        [', ...entry.type.parameters.flatMap((parameter) => wrapDescriptor(parameter, '            ')), '        ],'];

    return [`    ${name}: fn(`, ...listed, ...returned, ...tail.map((part) => `        ${part},`), '    ),'];
}

function entryLines(entry: CatalogEntry): string[] {
    const name = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(entry.name) ? entry.name : `'${entry.name}'`;
    const single = `    ${name}: ${printDescriptor(entry.type)},`;

    if (single.length <= MAX_LINE_LENGTH) {
        return [single];
    }

    return wrapFunction(name, entry);
}

function chunkEntries(entries: readonly CatalogEntry[]): CatalogEntry[][] {
    const chunks: CatalogEntry[][] = [];
    let current: CatalogEntry[] = [];
    let lines = 0;

    for (const entry of entries) {
        const length = entryLines(entry).length;

        if (current.length > 0 && lines + length > MAX_BODY_LINES) {
            chunks.push(current);
            current = [];
            lines = 0;
        }

        current.push(entry);
        lines += length;
    }

    if (current.length > 0) {
        chunks.push(current);
    }

    return chunks;
}

function renderModule(module: string, entries: readonly CatalogEntry[]): string {
    const helpers = new Set<string>();

    entries.forEach((entry) => collectHelpers(entry.type, helpers));

    const imported = [...helpers].sort((left, right) => left.localeCompare(right, 'en'));
    const body = entries.flatMap(entryLines);

    return [
        "import type { ApiCatalog } from '@mta-types/api-declaration';",
        `import { ${imported.join(', ')} } from '@mta-types/type-descriptor';`,
        '',
        `export const ${symbolName(module)}: ApiCatalog = {`,
        ...body,
        '};',
        '',
    ].join('\n');
}

function renderAggregate(environment: ApiEnvironment, modules: readonly string[]): string {
    const imports = modules.map((module) => `import { ${symbolName(module)} } from './${module}';`);
    const spreads = modules.map((module) => `    ...${symbolName(module)},`);

    return [
        "import type { ApiCatalog } from '@mta-types/api-declaration';",
        '',
        ...imports,
        '',
        `export const ${AGGREGATES[environment]}: ApiCatalog = {`,
        ...spreads,
        '};',
        '',
    ].join('\n');
}

export function emitCatalog(environment: ApiEnvironment, entries: readonly CatalogEntry[]): GeneratedFile[] {
    const categories = [...new Set(entries.map((entry) => entry.category))].sort((left, right) => left.localeCompare(right, 'en'));
    const files: GeneratedFile[] = [];
    const modules: string[] = [];

    for (const category of categories) {
        const chunks = chunkEntries(entries.filter((entry) => entry.category === category));

        chunks.forEach((chunk, index) => {
            const module = moduleName(category, environment, index + 1);

            modules.push(module);
            files.push({ path: `src/generated/api/${module}.ts`, contents: renderModule(module, chunk) });
        });
    }

    files.push({ path: `src/generated/api/mta-${environment}.ts`, contents: renderAggregate(environment, modules) });

    return files;
}
