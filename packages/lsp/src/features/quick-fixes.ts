import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';
import type { Token } from '@compiler/lexer/token';

export interface SourceEdit {
    start: number;
    end: number;
    newText: string;
}

export interface QuickFix {
    title: string;
    edits: SourceEdit[];
}

const OPENERS: ReadonlySet<string> = new Set(['(', '[', '<']);

const CLOSERS: ReadonlySet<string> = new Set([')', ']', '>']);

function indexAt(tokens: readonly Token[], offset: number): number {
    return tokens.findIndex((token) => token.position.offset === offset);
}

function indexFrom(tokens: readonly Token[], offset: number, value: string): number {
    return tokens.findIndex((token) => token.position.offset >= offset && token.value === value);
}

function moveOptionalMarker(tokens: readonly Token[], offset: number): QuickFix | null {
    const marker = indexAt(tokens, offset);
    const colon = marker - 2;
    const name = tokens[marker - 3];

    if (marker < 3 || tokens[colon]?.value !== ':' || name === undefined || name.kind !== 'identifier') {
        return null;
    }

    return {
        title: 'Write the optional marker on the name',
        edits: [
            { start: name.end.offset, end: name.end.offset, newText: '?' },
            { start: offset, end: offset + 1, newText: '' },
        ],
    };
}

function removeRedundantMarker(tokens: readonly Token[], offset: number): QuickFix | null {
    const marker = tokens[indexAt(tokens, offset)];

    if (marker === undefined || marker.value !== '?') {
        return null;
    }

    return { title: 'Remove the redundant optional marker', edits: [{ start: offset, end: offset + 1, newText: '' }] };
}

function callSuperDirectly(tokens: readonly Token[], offset: number): QuickFix | null {
    const colon = indexAt(tokens, offset);
    const receiver = tokens[colon - 1];
    const method = tokens[colon + 1];

    if (colon < 1 || receiver?.value !== 'self' || method?.value !== 'super') {
        return null;
    }

    return { title: 'Call "super(...)" directly', edits: [{ start: receiver.position.offset, end: method.position.offset, newText: '' }] };
}

function readStaticWithDot(tokens: readonly Token[], offset: number): QuickFix | null {
    const colon = indexFrom(tokens, offset, ':');
    const token = tokens[colon];

    if (token === undefined) {
        return null;
    }

    return { title: 'Read the static member with a dot', edits: [{ start: token.position.offset, end: token.end.offset, newText: '.' }] };
}

function useNewExpression(tokens: readonly Token[], offset: number): QuickFix | null {
    const dot = indexAt(tokens, offset);
    const name = tokens[dot - 1];
    const open = tokens[dot + 2];

    if (dot < 1 || name === undefined || name.kind !== 'identifier' || open?.value !== '(') {
        return null;
    }

    return {
        title: `Construct it with "new ${name.value}(...)"`,
        edits: [{ start: name.position.offset, end: open.position.offset, newText: `new ${name.value}` }],
    };
}

function parameterEnd(tokens: readonly Token[], start: number): number {
    let depth = 0;

    for (let index = start; index < tokens.length; index += 1) {
        const token = tokens[index];

        if (token === undefined) {
            break;
        }

        if (OPENERS.has(token.value)) {
            depth += 1;
        } else if (depth > 0 && CLOSERS.has(token.value)) {
            depth -= 1;
        } else if (depth === 0 && (token.value === ',' || token.value === ')')) {
            return index;
        }
    }

    return -1;
}

function removeSelfParameter(tokens: readonly Token[], offset: number): QuickFix | null {
    const self = indexAt(tokens, offset);
    const stop = self === -1 ? -1 : parameterEnd(tokens, self + 1);
    const terminator = tokens[stop];

    if (terminator === undefined) {
        return null;
    }

    const following = tokens[stop + 1];
    const end = terminator.value === ',' && following !== undefined ? following.position.offset : terminator.position.offset;

    return { title: 'Remove the "self" parameter', edits: [{ start: offset, end, newText: '' }] };
}

const FIXES: Readonly<Record<string, (tokens: readonly Token[], offset: number) => QuickFix | null>> = {
    'parse-optional-position': moveOptionalMarker,
    'parse-redundant-optional': removeRedundantMarker,
    'check-invalid-super': callSuperDirectly,
    'check-static-receiver': readStaticWithDot,
    'check-native-constructor': useNewExpression,
    'check-explicit-self-parameter': removeSelfParameter,
};

export const FIXABLE_CODES: readonly string[] = Object.keys(FIXES);

export function quickFixFor(diagnostic: CompilerDiagnostic, tokens: readonly Token[]): QuickFix | null {
    return FIXES[diagnostic.code]?.(tokens, diagnostic.position.offset) ?? null;
}
