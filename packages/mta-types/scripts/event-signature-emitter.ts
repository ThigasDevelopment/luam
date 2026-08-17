import type { ApiEnvironment } from '#mta-types/api-declaration';

import { collectHelpers, printDescriptor } from './descriptor-printer.ts';
import type { GeneratedFile, ParsedEventHandler } from './generator-model.ts';

const MAX_BODY_LINES = 230;

function symbolName(environment: ApiEnvironment, chunk: number): string {
    return `MTA_EVENT_SIGNATURES_${environment.toUpperCase()}_${chunk}`;
}

function moduleName(environment: ApiEnvironment, chunk: number): string {
    return `mta-event-signatures-${environment}-${chunk}`;
}

function entryLines(entry: ParsedEventHandler): string[] {
    const type = entry.type;
    const names = type.parameterNames ?? [];
    const lines = [
        `    ${entry.name}: fn(`,
        '        [',
        ...type.parameters.map((parameter) => `            ${printDescriptor(parameter)},`),
        '        ],',
        `        ${printDescriptor(type.returnType)},`,
        `        ${type.minimumArguments},`,
        `        ${type.isVariadic},`,
        '        [',
        ...names.map((name) => `            '${name}',`),
        '        ],',
    ];

    if (type.variadicType !== undefined) {
        lines.push(`        ${printDescriptor(type.variadicType)},`);
    }

    return [...lines, '    ),'];
}

function chunkEntries(entries: readonly ParsedEventHandler[]): ParsedEventHandler[][] {
    const chunks: ParsedEventHandler[][] = [];
    let current: ParsedEventHandler[] = [];
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

function renderModule(environment: ApiEnvironment, chunk: number, entries: readonly ParsedEventHandler[]): string {
    const helpers = new Set<string>();

    entries.forEach((entry) => collectHelpers(entry.type, helpers));

    return [
        `import { ${[...helpers].sort((left, right) => left.localeCompare(right, 'en')).join(', ')} } from '@mta-types/type-descriptor';`,
        '',
        "import type { FunctionDescriptor } from '@mta-types/type-descriptor';",
        '',
        `export const ${symbolName(environment, chunk)}: Readonly<Record<string, FunctionDescriptor>> = {`,
        ...entries.flatMap(entryLines),
        '};',
        '',
    ].join('\n');
}

function renderAggregate(modules: Readonly<Record<'server' | 'client', readonly string[]>>): string {
    const imports = [...modules.server, ...modules.client].map((module, index) => {
        const environment = modules.server.includes(module) ? 'server' : 'client';
        const chunk = environment === 'server' ? index + 1 : index - modules.server.length + 1;

        return `import { ${symbolName(environment, chunk)} } from './${module}';`;
    });
    const spreads = (environment: 'server' | 'client'): string[] => modules[environment].map((_, index) => `        ...${symbolName(environment, index + 1)},`);

    return [
        ...imports,
        '',
        "import type { ApiEnvironment } from '@mta-types/api-declaration';",
        "import type { FunctionDescriptor } from '@mta-types/type-descriptor';",
        '',
        'export const MTA_EVENT_SIGNATURES: Readonly<Record<ApiEnvironment, Readonly<Record<string, FunctionDescriptor>>>> = {',
        '    server: {',
        ...spreads('server'),
        '    },',
        '    client: {',
        ...spreads('client'),
        '    },',
        '    shared: {},',
        '};',
        '',
    ].join('\n');
}

export function emitEventSignatures(server: readonly ParsedEventHandler[], client: readonly ParsedEventHandler[]): GeneratedFile[] {
    const entries = { server: chunkEntries(server), client: chunkEntries(client) };
    const modules = {
        server: entries.server.map((_, index) => moduleName('server', index + 1)),
        client: entries.client.map((_, index) => moduleName('client', index + 1)),
    };
    const files: GeneratedFile[] = [];

    for (const environment of ['server', 'client'] as const) {
        entries[environment].forEach((chunk, index) => {
            files.push({
                path: `src/generated/events/${modules[environment][index]}.ts`,
                contents: renderModule(environment, index + 1, chunk),
            });
        });
    }

    files.push({ path: 'src/generated/events/mta-event-signatures.ts', contents: renderAggregate(modules) });

    return files;
}
