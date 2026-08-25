import { emitBlock } from './emitter';
import { indentLine, type EmitState } from './state';

import type { Statement } from '@compiler/parser/ast';

export const BREAK_FLAG = '__luam_break';

export const CONTINUE_JUMP = 'break';

export function containsJump(body: readonly Statement[], kind: Statement['kind']): boolean {
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

export interface LoopScaffolding {
    opening: string;
    closing: string;
}

export function loopScaffolding(body: readonly Statement[]): LoopScaffolding {
    if (!containsJump(body, 'continue-statement')) {
        return { opening: '', closing: '' };
    }

    if (!containsJump(body, 'break-statement')) {
        return { opening: 'repeat ', closing: ' until true' };
    }

    return { opening: `local ${BREAK_FLAG} = false repeat `, closing: ` until true if ${BREAK_FLAG} then break end` };
}

function wrapBody(lines: readonly string[], scaffolding: LoopScaffolding): string[] {
    const first = lines[0];
    const last = lines.length - 1;

    if (scaffolding.opening.length === 0 || first === undefined) {
        return [...lines];
    }

    const indent = first.length - first.trimStart().length;
    const wrapped = [...lines];

    wrapped[0] = `${first.slice(0, indent)}${scaffolding.opening}${first.slice(indent)}`;
    wrapped[last] = `${wrapped[last] as string}${scaffolding.closing}`;

    return wrapped;
}

export function emitLoop(state: EmitState, header: string, body: readonly Statement[], closing: string): string {
    const scaffolding = loopScaffolding(body);

    state.indent += 1;

    const lines = emitNested(state, body, scaffolding.opening.length > 0);

    state.indent -= 1;

    return [header, ...wrapBody(lines, scaffolding), indentLine(state, closing)].join('\n');
}

export function emitBreak(state: EmitState): string {
    return state.loopWrap ? `${BREAK_FLAG} = true break` : 'break';
}
