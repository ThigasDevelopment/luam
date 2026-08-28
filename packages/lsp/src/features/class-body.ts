import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import type { CallFrame } from '@lsp/features/source-context';

const CLASS_HEADER = /\bclass\s+[A-Za-z_][A-Za-z0-9_]*(?:\s+extends\s+[A-Za-z_][A-Za-z0-9_]*)?(?:\s+implements\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*)*)?\s*$/;

const BLOCK_OPENERS: ReadonlySet<string> = new Set(['function', 'if', 'do', 'repeat']);

function isDirectBody(analysis: DocumentAnalysis, frame: CallFrame, offset: number): boolean {
    const blocks: string[] = [];

    for (const token of analysis.tokens) {
        if (token.position.offset <= frame.open || token.position.offset >= offset || token.kind !== 'keyword') {
            continue;
        }

        if (BLOCK_OPENERS.has(token.value)) {
            blocks.push(token.value);
        } else if (token.value === 'end') {
            blocks.pop();
        } else if (token.value === 'until' && blocks.at(-1) === 'repeat') {
            blocks.pop();
        }
    }

    return blocks.length === 0;
}

function classEnd(analysis: DocumentAnalysis, open: number): number {
    let depth = 0;

    for (const token of analysis.tokens) {
        if (token.position.offset < open || token.kind !== 'punctuation') {
            continue;
        }

        if (token.value === '{') {
            depth += 1;
        } else if (token.value === '}') {
            depth -= 1;

            if (depth === 0) {
                return token.position.offset;
            }
        }
    }

    return analysis.text.length;
}

export function isClassBody(analysis: DocumentAnalysis, frame: CallFrame | null, offset: number): boolean {
    if (frame === null || analysis.text[frame.open] !== '{' || !CLASS_HEADER.test(analysis.text.slice(0, frame.open))) {
        return false;
    }

    return isDirectBody(analysis, frame, offset);
}

export function classBodyNeedsConstructor(analysis: DocumentAnalysis, frame: CallFrame | null, offset: number): boolean {
    if (frame === null || !isClassBody(analysis, frame, offset)) {
        return false;
    }

    const body = analysis.text.slice(frame.open + 1, classEnd(analysis, frame.open));

    return !/\bconstructor\s*=\s*function\b/.test(body);
}
