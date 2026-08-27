import { contextualFunction } from '@compiler/checker/contextual-function';
import { typeToString, type Type } from '@compiler/checker/types';
import { KEYWORDS } from '@compiler/lexer/token';
import { CompletionItemKind, InsertTextFormat, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { expectedArgument } from '@lsp/features/argument-expectation';
import type { CallFrame, SourceContext } from '@lsp/features/source-context';

function isFunctionFrame(text: string, open: number): boolean {
    const prefix = text.slice(0, open);

    return /\bfunction\s*$/.test(prefix);
}

function parameterPrefix(text: string, open: number, offset: number): string | null {
    const value = text.slice(open + 1, offset).trim();

    return value.length === 0 || /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : null;
}

function lowerName(name: string): string {
    return name.length === 0 ? name : `${name[0]?.toLowerCase()}${name.slice(1)}`;
}

function inferredName(type: Type, index: number): string {
    if (type.kind === 'named') {
        return lowerName(type.name);
    }

    if (type.kind === 'string' || type.kind === 'string-literal') {
        return 'text';
    }

    if (type.kind === 'boolean' || type.kind === 'boolean-literal') {
        return 'enabled';
    }

    if (type.kind === 'array') {
        return 'items';
    }

    if (type.kind === 'table' || type.kind === 'map' || type.kind === 'record') {
        return 'values';
    }

    if (type.kind === 'function') {
        return 'callback';
    }

    return `argument${index + 1}`;
}

function validName(name: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && !KEYWORDS.has(name);
}

function uniqueNames(types: readonly Type[], authored: readonly string[] | undefined): string[] {
    const used = new Set<string>();

    return types.map((type, index) => {
        const preferred = authored?.[index];
        const base = preferred !== undefined && validName(preferred) ? preferred : inferredName(type, index);
        let name = validName(base) ? base : `argument${index + 1}`;
        let suffix = 2;

        while (used.has(name)) {
            name = `${base}${suffix}`;
            suffix += 1;
        }

        used.add(name);

        return name;
    });
}

function placeholder(index: number, name: string): string {
    const escaped = name.replaceAll('\\', '\\\\').replaceAll('$', '\\$').replaceAll('}', '\\}');

    return `\${${index}:${escaped}}`;
}

function outerCallFrame(context: SourceContext): CallFrame | null {
    for (let index = context.frames.length - 2; index >= 0; index -= 1) {
        const frame = context.frames[index];

        if (frame?.isCall) {
            return frame;
        }
    }

    return null;
}

export function callbackParameterItems(analysis: DocumentAnalysis, offset: number, context: SourceContext): CompletionItem[] | null {
    const parameterFrame = context.frames.at(-1);

    if (parameterFrame === undefined || !isFunctionFrame(analysis.text, parameterFrame.open)) {
        return null;
    }

    const prefix = parameterPrefix(analysis.text, parameterFrame.open, offset);
    const callFrame = outerCallFrame(context);

    if (prefix === null || callFrame === null) {
        return null;
    }

    const expected = expectedArgument(analysis, offset, callFrame, true);
    const callback = contextualFunction(expected?.type ?? null);

    if (callback === null) {
        return null;
    }

    const names = uniqueNames(callback.parameters, callback.parameterNames);
    const parameters = callback.parameters.map((type, index) => `${names[index] ?? `argument${index + 1}`}: ${typeToString(type)}`);
    const variadic = callback.isVariadic ? (callback.variadicType === undefined ? '...' : `...: ${typeToString(callback.variadicType)}`) : null;
    const labels = [...parameters, ...(variadic === null ? [] : [variadic])];

    if (labels.length === 0) {
        return [];
    }

    const insert = callback.parameters.map((type, index) => `${placeholder(index + 1, names[index] ?? `argument${index + 1}`)}: ${typeToString(type)}`);

    if (variadic !== null) {
        insert.push(variadic);
    }

    const detail = `Callback parameters: ${labels.join(', ')}`;

    return [{ label: labels.join(', '), kind: CompletionItemKind.Snippet, detail, insertText: insert.join(', '), insertTextFormat: InsertTextFormat.Snippet, sortText: '0' }];
}
