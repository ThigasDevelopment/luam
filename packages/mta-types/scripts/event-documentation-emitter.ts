import { hasEventDocumentation, type EventDocumentation } from '#mta-types/event-documentation';
import type { ParameterDocumentation } from '#mta-types/api-documentation';

import { quote } from './documentation-text.ts';
import type { GeneratedFile } from './generator-model.ts';

const MAX_BODY_LINES = 240;

export interface EventDocumentationEntry {
    name: string;
    documentation: EventDocumentation;
}

function parameterLine(parameter: ParameterDocumentation): string {
    const flags = `isOptional: ${String(parameter.isOptional)}, isVariadic: ${String(parameter.isVariadic)}`;

    return `            { name: ${quote(parameter.name)}, ${flags}, summary: ${quote(parameter.summary)} },`;
}

function entryLines(name: string, documentation: EventDocumentation): string[] {
    const parameters =
        documentation.parameters.length === 0
            ? ['        parameters: [],']
            : ['        parameters: [', ...documentation.parameters.map(parameterLine), '        ],'];

    return [
        `    ${name}: {`,
        `        summary: ${quote(documentation.summary)},`,
        ...parameters,
        `        source: ${quote(documentation.source)},`,
        `        cancel: ${quote(documentation.cancel)},`,
        `        wiki: ${quote(documentation.wiki)},`,
        '    },',
    ];
}

function chunkEntries(entries: readonly EventDocumentationEntry[]): EventDocumentationEntry[][] {
    const chunks: EventDocumentationEntry[][] = [];

    let current: EventDocumentationEntry[] = [];
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

function renderModule(module: string, entries: readonly EventDocumentationEntry[]): string {
    const body = entries.flatMap((entry) => entryLines(entry.name, entry.documentation));

    return [
        "import type { EventDocumentationCatalog } from '@mta-types/event-documentation';",
        '',
        `export const ${symbolName(module)}: EventDocumentationCatalog = {`,
        ...body,
        '};',
        '',
    ].join('\n');
}

function renderAggregate(modules: readonly string[]): string {
    const imports = modules.map((module) => `import { ${symbolName(module)} } from './${module}';`);
    const spreads = modules.map((module) => `    ...${symbolName(module)},`);

    return [
        "import type { EventDocumentationCatalog } from '@mta-types/event-documentation';",
        '',
        ...imports,
        '',
        'export const MTA_EVENT_DOCS: EventDocumentationCatalog = {',
        ...spreads,
        '};',
        '',
    ].join('\n');
}

export function emitEventDocumentation(entries: readonly EventDocumentationEntry[]): GeneratedFile[] {
    const documented = entries.filter((entry) => hasEventDocumentation(entry.documentation)).sort((left, right) => left.name.localeCompare(right.name, 'en'));
    const files: GeneratedFile[] = [];
    const modules: string[] = [];

    chunkEntries(documented).forEach((chunk, index) => {
        const module = `mta-event-docs-${index + 1}`;

        modules.push(module);
        files.push({ path: `src/generated/docs/${module}.ts`, contents: renderModule(module, chunk) });
    });

    files.push({ path: 'src/generated/docs/mta-event-docs.ts', contents: renderAggregate(modules) });

    return files;
}
