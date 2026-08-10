import ts from 'typescript';

import type { ApiDocumentation, ParameterDocumentation } from '#mta-types/api-documentation';

import { cleanMarkup, singleLine } from './documentation-text.ts';

interface TagBlock {
    tag: string;
    body: string;
}

interface ParsedComment {
    summary: string;
    params: [string, string][];
    returns: string;
    wiki: string;
}

const EMPTY_COMMENT: ParsedComment = { summary: '', params: [], returns: '', wiki: '' };

const TAG_LINE = /^@([A-Za-z]+)\s*(.*)$/;

const NAMED_BODY = /^(\S+)\s*([\s\S]*)$/;

const URL_TEXT = /https?:\/\/\S+/;

function commentText(source: ts.SourceFile, node: ts.Node): string | null {
    const ranges = ts.getLeadingCommentRanges(source.text, node.pos) ?? [];
    const last = ranges.at(-1);

    if (last === undefined) {
        return null;
    }

    const raw = source.text.slice(last.pos, last.end);

    return raw.startsWith('/**') ? raw : null;
}

function contentLines(raw: string): string[] {
    return raw
        .slice(3, -2)
        .split('\n')
        .map((line) => line.replace(/^\s*\*? ?/, ''));
}

function splitBlocks(lines: readonly string[]): { summary: string[]; blocks: TagBlock[] } {
    const summary: string[] = [];
    const blocks: TagBlock[] = [];

    for (const line of lines) {
        const match = TAG_LINE.exec(line);
        const current = blocks.at(-1);

        if (match !== null) {
            blocks.push({ tag: match[1] ?? '', body: match[2] ?? '' });

            continue;
        }

        if (current === undefined) {
            summary.push(line);

            continue;
        }

        current.body = `${current.body}\n${line}`;
    }

    return { summary, blocks };
}

function readParams(blocks: readonly TagBlock[]): [string, string][] {
    const params: [string, string][] = [];

    for (const block of blocks) {
        if (block.tag !== 'param') {
            continue;
        }

        const match = NAMED_BODY.exec(block.body.trim());

        if (match === null) {
            continue;
        }

        params.push([match[1] ?? '', match[2] ?? '']);
    }

    return params;
}

function readTag(blocks: readonly TagBlock[], tag: string): string {
    return blocks.find((block) => block.tag === tag)?.body ?? '';
}

export function parseComment(source: ts.SourceFile, node: ts.Node): ParsedComment {
    const raw = commentText(source, node);

    if (raw === null) {
        return EMPTY_COMMENT;
    }

    const { summary, blocks } = splitBlocks(contentLines(raw));
    const see = readTag(blocks, 'see');
    const returns = readTag(blocks, 'return') || readTag(blocks, 'returns');

    return {
        summary: cleanMarkup(summary.join('\n')),
        params: readParams(blocks),
        returns: singleLine(returns),
        wiki: URL_TEXT.exec(see)?.[0] ?? '',
    };
}

function parameterName(parameter: ts.ParameterDeclaration): string {
    return ts.isIdentifier(parameter.name) ? parameter.name.text : '';
}

function matchParameters(node: ts.FunctionDeclaration, documented: readonly [string, string][]): ParameterDocumentation[] {
    const declared = node.parameters.map(parameterName);
    const known = new Set(declared);
    const summaries = new Map<string, string>();

    let last = '';

    for (const [name, body] of documented) {
        if (known.has(name)) {
            summaries.set(name, body);
            last = name;

            continue;
        }

        const previous = summaries.get(last);

        if (previous !== undefined) {
            summaries.set(last, `${previous}\n${name} ${body}`);
        }
    }

    return node.parameters.map((parameter, index) => ({
        name: declared[index] ?? `argument${index + 1}`,
        isOptional: parameter.questionToken !== undefined,
        isVariadic: parameter.dotDotDotToken !== undefined,
        summary: singleLine(summaries.get(declared[index] ?? '') ?? ''),
    }));
}

export function functionDocumentation(source: ts.SourceFile, node: ts.FunctionDeclaration): ApiDocumentation {
    const comment = parseComment(source, node);

    return {
        summary: comment.summary,
        parameters: matchParameters(node, comment.params),
        returns: comment.returns,
        wiki: comment.wiki,
    };
}

export function variableDocumentation(source: ts.SourceFile, node: ts.Node): ApiDocumentation {
    const comment = parseComment(source, node);

    return { summary: comment.summary, parameters: [], returns: comment.returns, wiki: comment.wiki };
}
