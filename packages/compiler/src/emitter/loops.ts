import { emitBlock } from './emitter';
import { indentLine, type EmitState } from './state';

import type { Statement } from '@compiler/parser/ast';

const BREAK_FLAG = '__luam_break';

export const CONTINUE_JUMP = 'break';

function containsJump(body: readonly Statement[], kind: Statement['kind']): boolean {
    return body.some((statement) => {
        if (statement.kind === kind) {
            return true;
        }

        if (statement.kind === 'do-statement') {
            return containsJump(statement.body, kind);
        }

        if (statement.kind !== 'if-statement') {
            return false;
        }

        const inClause = statement.clauses.some((clause) => containsJump(clause.body, kind));

        return inClause || (statement.alternate !== null && containsJump(statement.alternate, kind));
    });
}

function emitNested(state: EmitState, body: readonly Statement[], wrapped: boolean): string[] {
    const previous = state.loopWrap;

    state.loopWrap = wrapped;

    try {
        return emitBlock(state, body);
    } finally {
        state.loopWrap = previous;
    }
}

function emitWrappedBody(state: EmitState, body: readonly Statement[]): string[] {
    const needsFlag = containsJump(body, 'break-statement');
    const lines: string[] = [];

    if (needsFlag) {
        lines.push(indentLine(state, `local ${BREAK_FLAG} = false`));
    }

    lines.push(indentLine(state, 'repeat'));

    state.indent += 1;
    lines.push(...emitNested(state, body, true));
    state.indent -= 1;

    lines.push(indentLine(state, 'until true'));

    if (needsFlag) {
        lines.push(indentLine(state, `if ${BREAK_FLAG} then break end`));
    }

    return lines;
}

export function emitLoopBody(state: EmitState, body: readonly Statement[]): string[] {
    state.indent += 1;

    const lines = containsJump(body, 'continue-statement') ? emitWrappedBody(state, body) : emitNested(state, body, false);

    state.indent -= 1;

    return lines;
}

export function emitBreak(state: EmitState): string {
    return state.loopWrap ? `${BREAK_FLAG} = true\n${indentLine(state, 'break')}` : 'break';
}
