const KEYWORDS = new Set([
    'and',
    'break',
    'class',
    'continue',
    'declare',
    'do',
    'else',
    'elseif',
    'end',
    'enum',
    'extends',
    'export',
    'false',
    'for',
    'function',
    'fun',
    'if',
    'implements',
    'in',
    'interface',
    'local',
    'new',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'type',
    'until',
    'while',
]);

const BUILTINS = new Set(['self', 'super', 'source', 'root', 'constructor', 'string', 'table', 'math', 'os', 'tostring', 'tonumber', 'print', 'pairs', 'ipairs']);

const PATTERN = new RegExp(
    [
        '(?<block>#\\*[\\s\\S]*?\\*#|--\\[\\[[\\s\\S]*?\\]\\])',
        '(?<line>#[^\\n]*|--[^\\n]*)',
        '(?<template>`(?:\\\\.|[^`\\\\])*`)',
        "(?<string>'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\")",
        '(?<number>\\b\\d[\\w.]*\\b)',
        '(?<name>[A-Za-z_][A-Za-z0-9_]*)',
    ].join('|'),
    'g',
);

const ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

function span(kind: string, text: string): string {
    return `<span class="tk-${kind}">${escapeHtml(text)}</span>`;
}

function template(text: string): string {
    return text.replace(/\$\{[^}]*\}|[^$]+|\$/g, (part) => (part.startsWith('${') ? span('interp', part) : span('string', part)));
}

function classify(name: string, after: string): string {
    if (KEYWORDS.has(name)) {
        return span('keyword', name);
    }

    if (BUILTINS.has(name)) {
        return span('builtin', name);
    }

    if (after.startsWith('(')) {
        return span('call', name);
    }

    return escapeHtml(name);
}

export function highlight(source: string): string {
    let result = '';
    let index = 0;

    for (const match of source.matchAll(PATTERN)) {
        const groups = match.groups ?? {};
        const start = match.index;

        result += escapeHtml(source.slice(index, start));
        index = start + match[0].length;

        if (groups['block'] !== undefined || groups['line'] !== undefined) {
            result += span('comment', match[0]);
        } else if (groups['template'] !== undefined) {
            result += template(match[0]);
        } else if (groups['string'] !== undefined) {
            result += span('string', match[0]);
        } else if (groups['number'] !== undefined) {
            result += span('number', match[0]);
        } else {
            result += classify(match[0], source.slice(index).trimStart());
        }
    }

    return result + escapeHtml(source.slice(index));
}

export function lineCount(source: string): number {
    return source.split('\n').length;
}
