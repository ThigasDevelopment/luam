import { hasDocumentation, type ApiDocumentation, type ParameterDocumentation } from '#mta-types/api-documentation';

import { quote } from './documentation-text.ts';
import type { CatalogEntry, GeneratedFile } from './generator-model.ts';

const MAX_BODY_LINES = 240;

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function key(name: string): string {
    return IDENTIFIER.test(name) ? name : `'${name}'`;
}

function parameterLine(parameter: ParameterDocumentation): string {
    const flags = `isOptional: ${String(parameter.isOptional)}, isVariadic: ${String(parameter.isVariadic)}`;

    return `            { name: ${quote(parameter.name)}, ${flags}, summary: ${quote(parameter.summary)} },`;
}

function entryLines(name: string, documentation: ApiDocumentation): string[] {
    const parameters =
        documentation.parameters.length === 0
            ? ['        parameters: [],']
            : ['        parameters: [', ...documentation.parameters.map(parameterLine), '        ],'];

    return [
        `    ${key(name)}: {`,
        `        summary: ${quote(documentation.summary)},`,
        ...parameters,
        `        returns: ${quote(documentation.returns)},`,
        `        wiki: ${quote(documentation.wiki)},`,
        '    },',
    ];
}

function chunkEntries(entries: readonly CatalogEntry[]): CatalogEntry[][] {
    const chunks: CatalogEntry[][] = [];

    let current: CatalogEntry[] = [];
    let lines = 0;

    for (const entry of entries) {
        const length = entryLines(entry.name, entry.documentation).length;

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

function symbolName(module: string): string {
    return module.replaceAll('-', '_').toUpperCase();
}

function renderModule(module: string, entries: readonly CatalogEntry[]): string {
    const body = entries.flatMap((entry) => entryLines(entry.name, entry.documentation));

    return [
        "import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';",
        '',
        `export const ${symbolName(module)}: ApiDocumentationCatalog = {`,
        ...body,
        '};',
        '',
    ].join('\n');
}

function renderAggregate(modules: readonly string[]): string {
    const imports = modules.map((module) => `import { ${symbolName(module)} } from './${module}';`);
    const spreads = modules.map((module) => `    ...${symbolName(module)},`);

    return [
        "import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';",
        '',
        ...imports,
        '',
        'export const MTA_API_DOCS: ApiDocumentationCatalog = {',
        ...spreads,
        '};',
        '',
    ].join('\n');
}

export function emitDocumentation(catalog: readonly CatalogEntry[]): GeneratedFile[] {
    const documented = catalog.filter((entry) => hasDocumentation(entry.documentation)).sort((left, right) => left.name.localeCompare(right.name, 'en'));
    const files: GeneratedFile[] = [];
    const modules: string[] = [];

    chunkEntries(documented).forEach((chunk, index) => {
        const module = `mta-docs-${index + 1}`;

        modules.push(module);
        files.push({ path: `src/generated/docs/${module}.ts`, contents: renderModule(module, chunk) });
    });

    files.push({ path: 'src/generated/docs/mta-docs.ts', contents: renderAggregate(modules) });

    return files;
}
