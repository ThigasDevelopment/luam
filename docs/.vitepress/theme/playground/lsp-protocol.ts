import { type PlaygroundDiagnostic, type PlaygroundEnvironment } from './protocol';

export type LspKind = 'compile' | 'completion' | 'hover' | 'signature' | 'definition' | 'references' | 'rename' | 'symbols';

export interface LspRequest {
    id: number;
    kind: LspKind;
    newName: string;
    source: string;
    environment: PlaygroundEnvironment;
    oop: boolean;
    offset: number;
}

export interface LspCompletionItem {
    label: string;
    kind: string;
    detail: string;
    documentation: string;
    insert: string;
}

export interface LspSignature {
    label: string;
    documentation: string;
    parameters: string[];
    activeParameter: number;
}

export interface LspRange {
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

export interface LspSymbol {
    name: string;
    kind: string;
    line: number;
    children: LspSymbol[];
}

export interface LspEdit {
    range: LspRange;
    text: string;
}

export interface LspResponse {
    id: number;
    kind: LspKind;
    code: string | null;
    diagnostics: PlaygroundDiagnostic[];
    items: LspCompletionItem[];
    hover: string | null;
    signature: LspSignature | null;
    ranges: LspRange[];
    symbols: LspSymbol[];
    edits: LspEdit[];
    failure: string | null;
}

export const COMPLETION_KINDS: Readonly<Record<number, string>> = {
    1: 'text',
    2: 'method',
    3: 'function',
    4: 'constructor',
    5: 'field',
    6: 'variable',
    7: 'class',
    8: 'interface',
    9: 'module',
    10: 'property',
    12: 'value',
    13: 'enum',
    14: 'keyword',
    15: 'snippet',
    17: 'file',
    20: 'enum member',
    21: 'constant',
    22: 'struct',
    23: 'event',
    25: 'type',
};

export function emptyResponse(id: number, kind: LspKind, failure: string | null = null): LspResponse {
    return { id, kind, code: null, diagnostics: [], items: [], hover: null, signature: null, ranges: [], symbols: [], edits: [], failure };
}

export function isLspResponse(value: unknown): value is LspResponse {
    return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'number';
}
