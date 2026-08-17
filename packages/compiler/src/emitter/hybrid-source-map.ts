import type { SourceLineMapping } from '@compiler/emitter/source-map';
import type { FunctionDeclaration, Program, Statement } from '@compiler/parser/ast';
import type { SourceSpan } from '@compiler/parser/source-metadata';

export interface HybridSourceEdit extends SourceSpan {
    replacement: string;
    lines?: readonly SourceLineMapping[];
}

interface SourceAnchor {
    offset: number;
    sourceLine: number;
    symbol?: string;
}

function functionName(statement: FunctionDeclaration): string {
    if (statement.name.kind === 'identifier') {
        return statement.name.name;
    }

    const object = statement.name.object.kind === 'identifier' ? statement.name.object.name : statement.name.property;

    return `${object}${statement.isMethod ? ':' : '.'}${statement.name.property}`;
}

function collectAnchors(statements: readonly Statement[], symbol: string | undefined, lowered: ReadonlySet<Statement>, anchors: SourceAnchor[]): void {
    for (const statement of statements) {
        if (
            lowered.has(statement) ||
            statement.kind === 'type-alias-statement' ||
            statement.kind === 'declare-statement' ||
            statement.kind === 'interface-declaration'
        ) {
            continue;
        }

        anchors.push({ offset: statement.position.offset, sourceLine: statement.position.line, ...(symbol === undefined ? {} : { symbol }) });

        switch (statement.kind) {
            case 'function-declaration':
                collectAnchors(statement.body, functionName(statement), lowered, anchors);
                break;
            case 'do-statement':
            case 'while-statement':
            case 'repeat-statement':
            case 'numeric-for-statement':
            case 'generic-for-statement':
                collectAnchors(statement.body, symbol, lowered, anchors);
                break;
            case 'if-statement':
                for (const clause of statement.clauses) {
                    collectAnchors(clause.body, symbol, lowered, anchors);
                }

                if (statement.alternate !== null) {
                    collectAnchors(statement.alternate, symbol, lowered, anchors);
                }

                break;
        }
    }
}

function newlineCount(value: string): number {
    return value.split('\n').length - 1;
}

function mappingForAnchor(anchor: SourceAnchor, generatedLine: number): SourceLineMapping {
    return { generatedLine, sourceLine: anchor.sourceLine, ...(anchor.symbol === undefined ? {} : { symbol: anchor.symbol }) };
}

function normalizeMappings(mappings: SourceLineMapping[]): SourceLineMapping[] {
    mappings.sort((left, right) => left.generatedLine - right.generatedLine);
    const unique: SourceLineMapping[] = [];

    for (const mapping of mappings) {
        if (unique[unique.length - 1]?.generatedLine === mapping.generatedLine) {
            unique[unique.length - 1] = mapping;
        } else {
            unique.push(mapping);
        }
    }

    return unique.filter((mapping, index) => {
        const previous = unique[index - 1];

        return (
            previous === undefined ||
            previous.symbol !== mapping.symbol ||
            previous.sourceLine - previous.generatedLine !== mapping.sourceLine - mapping.generatedLine
        );
    });
}

export function hybridSourceMappings(
    source: string,
    program: Program,
    edits: readonly HybridSourceEdit[],
    lowered: ReadonlySet<Statement>,
): SourceLineMapping[] {
    const anchors: SourceAnchor[] = [];
    const mappings: SourceLineMapping[] = [];
    let lineDelta = 0;
    let anchorIndex = 0;

    collectAnchors(program.body, undefined, lowered, anchors);
    anchors.sort((left, right) => left.offset - right.offset);

    for (const edit of edits) {
        while (anchorIndex < anchors.length && (anchors[anchorIndex]?.offset ?? Infinity) < edit.start) {
            const anchor = anchors[anchorIndex] as SourceAnchor;

            mappings.push(mappingForAnchor(anchor, anchor.sourceLine + lineDelta));
            anchorIndex += 1;
        }

        const sourceStartLine = newlineCount(source.slice(0, edit.start)) + 1;

        for (const line of edit.lines ?? []) {
            mappings.push({
                ...line,
                generatedLine: sourceStartLine + lineDelta + line.generatedLine - 1,
            });
        }

        lineDelta += newlineCount(edit.replacement) - newlineCount(source.slice(edit.start, edit.end));

        while (anchorIndex < anchors.length && (anchors[anchorIndex]?.offset ?? Infinity) < edit.end) {
            anchorIndex += 1;
        }
    }

    for (; anchorIndex < anchors.length; anchorIndex += 1) {
        const anchor = anchors[anchorIndex] as SourceAnchor;

        mappings.push(mappingForAnchor(anchor, anchor.sourceLine + lineDelta));
    }

    return normalizeMappings(mappings);
}
