import { COMPLETION_KINDS, emptyResponse, type LspCompletionItem, type LspEdit, type LspRange, type LspRequest, type LspResponse, type LspSymbol } from './lsp-protocol';
import { MAX_SOURCE_LENGTH, type PlaygroundDiagnostic } from './protocol';

import { compile } from '@compiler/index';
import { DEFAULT_COMPILER_OPTIONS } from '@compiler/manifest/manifest-defaults';
import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { completionAt } from '@lsp/features/completion';
import { documentSymbols } from '@lsp/features/document-symbols';
import { hoverAt } from '@lsp/features/hover';
import { definitionAt, referencesAt, renameAt } from '@lsp/features/navigation';
import { signatureHelpAt } from '@lsp/features/signature-help';

import { type Diagnostic } from '@compiler/diagnostics/diagnostic';

const scope = self as unknown as DedicatedWorkerGlobalScope;

function options(oop: boolean): typeof DEFAULT_COMPILER_OPTIONS {
    return { ...DEFAULT_COMPILER_OPTIONS, oop };
}

function toDiagnostic(diagnostic: Diagnostic): PlaygroundDiagnostic {
    return {
        severity: diagnostic.severity,
        code: diagnostic.code,
        message: diagnostic.message,
        line: diagnostic.position.line,
        column: diagnostic.position.column,
        endLine: diagnostic.end?.line ?? diagnostic.position.line,
        endColumn: diagnostic.end?.column ?? diagnostic.position.column + 1,
    };
}

function analyze(request: LspRequest): DocumentAnalysis {
    const path = `/playground/src/${request.environment}/main.luam`;

    return analyzeDocument({
        uri: `file://${path}`,
        path,
        version: request.id,
        text: request.source,
        environment: request.environment,
        compilerOptions: options(request.oop),
    });
}

function plainText(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(plainText).filter((part) => part !== '').join('\n\n');
    }

    if (typeof value === 'object' && value !== null) {
        const record = value as { value?: unknown };

        return typeof record.value === 'string' ? record.value : '';
    }

    return '';
}

const SYMBOL_KINDS: Readonly<Record<number, string>> = {
    5: 'class',
    6: 'method',
    8: 'field',
    9: 'constructor',
    10: 'enum',
    11: 'interface',
    12: 'function',
    13: 'variable',
    14: 'constant',
    22: 'enum member',
    26: 'type',
};

interface RawRange {
    start?: { line?: number; character?: number };
    end?: { line?: number; character?: number };
}

function toRange(range: RawRange | undefined): LspRange {
    return {
        line: (range?.start?.line ?? 0) + 1,
        column: (range?.start?.character ?? 0) + 1,
        endLine: (range?.end?.line ?? 0) + 1,
        endColumn: (range?.end?.character ?? 0) + 1,
    };
}

function toSymbol(symbol: { name?: string; kind?: number; range?: RawRange; children?: unknown[] }): LspSymbol {
    return {
        name: symbol.name ?? '',
        kind: SYMBOL_KINDS[symbol.kind ?? 0] ?? 'symbol',
        line: toRange(symbol.range).line,
        children: (symbol.children ?? []).map((child) => toSymbol(child as { name?: string })),
    };
}

function stripFences(value: string): string {
    return value
        .replace(/^```[a-z]*\n?/gm, '')
        .replace(/```/g, '')
        .trim();
}

function toItem(item: Record<string, unknown>): LspCompletionItem {
    const label = typeof item['label'] === 'string' ? item['label'] : '';
    const insert = typeof item['insertText'] === 'string' ? item['insertText'] : label;

    return {
        label,
        kind: COMPLETION_KINDS[typeof item['kind'] === 'number' ? item['kind'] : 1] ?? 'text',
        detail: typeof item['detail'] === 'string' ? item['detail'] : '',
        documentation: plainText(item['documentation']),
        insert: insert.replace(/\$\{\d+:?([^}]*)\}/g, '$1').replace(/\$\d+/g, ''),
    };
}

function handle(request: LspRequest): LspResponse {
    if (request.source.length > MAX_SOURCE_LENGTH) {
        return emptyResponse(request.id, request.kind, `The playground handles up to ${MAX_SOURCE_LENGTH} characters.`);
    }

    const base = emptyResponse(request.id, request.kind);

    if (request.kind === 'compile') {
        const result = compile(request.source, { environment: request.environment, compilerOptions: options(request.oop) });

        return { ...base, code: result.code, diagnostics: result.diagnostics.map(toDiagnostic) };
    }

    const analysis = analyze(request);

    if (request.kind === 'definition' || request.kind === 'references') {
        const found = request.kind === 'definition' ? definitionAt(analysis, request.offset, []) : referencesAt(analysis, request.offset, []);

        return { ...base, ranges: (found as { range?: RawRange }[]).map((location) => toRange(location.range)) };
    }

    if (request.kind === 'rename') {
        const edit = renameAt(analysis, request.offset, [], request.newName) as { changes?: Record<string, { range?: RawRange; newText?: string }[]> } | null;
        const changes = Object.values(edit?.changes ?? {}).flat();

        return { ...base, edits: changes.map((change): LspEdit => ({ range: toRange(change.range), text: change.newText ?? '' })) };
    }

    if (request.kind === 'symbols') {
        return { ...base, symbols: (documentSymbols(analysis) as { name?: string }[]).map(toSymbol) };
    }

    if (request.kind === 'completion') {
        const items = completionAt(analysis, request.offset, []) as unknown as Record<string, unknown>[];

        return { ...base, items: items.slice(0, 120).map(toItem) };
    }

    if (request.kind === 'hover') {
        const hover = hoverAt(analysis, request.offset, []);
        const text = hover === null ? '' : stripFences(plainText((hover as { contents?: unknown }).contents));

        return { ...base, hover: text === '' ? null : text };
    }

    const help = signatureHelpAt(analysis, request.offset) as {
        signatures?: { label?: string; documentation?: unknown; parameters?: { label?: unknown }[] }[];
        activeSignature?: number;
        activeParameter?: number;
    } | null;

    const signature = help?.signatures?.[help.activeSignature ?? 0];

    if (signature === undefined) {
        return base;
    }

    return {
        ...base,
        signature: {
            label: signature.label ?? '',
            documentation: plainText(signature.documentation),
            parameters: (signature.parameters ?? []).map((parameter) => (typeof parameter.label === 'string' ? parameter.label : '')),
            activeParameter: help?.activeParameter ?? 0,
        },
    };
}

scope.onmessage = (event: MessageEvent<LspRequest>): void => {
    const request = event.data;

    try {
        scope.postMessage(handle(request));
    } catch (error) {
        scope.postMessage(emptyResponse(request.id, request.kind, error instanceof Error ? error.message : 'The language server stopped unexpectedly.'));
    }
};
