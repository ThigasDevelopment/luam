import type { HybridSourceEdit } from './hybrid-source-map';
import { BREAK_FLAG, loopScaffolding } from './loops';
import { loopBody } from './preserve-blocks';
import type { PreserveInput } from './preserve-input';

import type { Statement } from '@compiler/parser/ast';

const BREAK_KEYWORD = 'break';

const CONTINUE_KEYWORD = 'continue';

const TRAILING_SEMICOLON = /^[ \t]*;/;

interface LoopAnchors {
    opening: number;
    closing: number;
}

function collectJumps(body: readonly Statement[], kind: Statement['kind'], found: Statement[]): void {
    for (const statement of body) {
        if (statement.kind === kind) {
            found.push(statement);
        } else if (statement.kind === 'do-statement') {
            collectJumps(statement.body, kind, found);
        } else if (statement.kind === 'if-statement') {
            for (const clause of statement.clauses) {
                collectJumps(clause.body, kind, found);
            }

            if (statement.alternate !== null) {
                collectJumps(statement.alternate, kind, found);
            }
        }
    }
}

function loopAnchors(input: PreserveInput, body: readonly Statement[]): LoopAnchors | null {
    const first = body[0];
    const last = body[body.length - 1];

    if (first === undefined || last === undefined) {
        return null;
    }

    const opening = input.spans.get(first)?.start;
    const end = input.spans.get(last)?.end;

    if (opening === undefined || end === undefined) {
        return null;
    }

    const trailing = TRAILING_SEMICOLON.exec(input.source.slice(end));

    return { opening, closing: trailing === null ? end : end + trailing[0].length };
}

function jumpEdits(
    input: PreserveInput,
    body: readonly Statement[],
    kind: Statement['kind'],
    keyword: string,
    replacement: string,
): HybridSourceEdit[] | null {
    const found: Statement[] = [];
    const edits: HybridSourceEdit[] = [];

    collectJumps(body, kind, found);

    for (const jump of found) {
        const start = jump.position.offset;

        if (!input.source.startsWith(keyword, start)) {
            return null;
        }

        edits.push({ start, end: start + keyword.length, replacement });
    }

    return edits;
}

export function loopEdits(input: PreserveInput, statement: Statement): HybridSourceEdit[] | null {
    const body = loopBody(statement);

    if (body === null) {
        return null;
    }

    const scaffolding = loopScaffolding(body);

    if (scaffolding.opening.length === 0) {
        return null;
    }

    const anchors = loopAnchors(input, body);
    const continues = jumpEdits(input, body, 'continue-statement', CONTINUE_KEYWORD, BREAK_KEYWORD);

    if (anchors === null || continues === null) {
        return null;
    }

    const guarded = scaffolding.opening.includes(BREAK_FLAG)
        ? jumpEdits(input, body, 'break-statement', BREAK_KEYWORD, `${BREAK_FLAG} = true ${BREAK_KEYWORD}`)
        : [];

    if (guarded === null) {
        return null;
    }

    return [
        { start: anchors.opening, end: anchors.opening, replacement: scaffolding.opening },
        { start: anchors.closing, end: anchors.closing, replacement: scaffolding.closing },
        ...continues,
        ...guarded,
    ];
}
