import { emitBuilder, emitMethod } from './classes';
import type { PreserveInput } from './preserve-input';
import { createEmitState } from './state';

import type { ClassDeclaration } from '@compiler/parser/declaration-nodes';

const MARKER = new RegExp(String.fromCharCode(0) + 'luam:\\d+' + String.fromCharCode(0), 'g');

function compact(text: string): string {
    return text.replace(MARKER, '').replace(/\s*\n\s*/g, ' ').trim();
}

export function injectedMembersText(input: PreserveInput, statement: ClassDeclaration): string | null {
    const generated = input.generatedMembers.get(statement) ?? [];

    if (generated.length === 0) {
        return null;
    }

    const state = createEmitState(input.types, input.references, input.generatedMembers);

    return generated.map((member) => compact(emitMethod(state, statement.name, member))).join(', ');
}

export function builderClassText(input: PreserveInput, statement: ClassDeclaration): string | null {
    const state = createEmitState(input.types, input.references, input.generatedMembers);
    const builder = emitBuilder(state, statement);

    return builder === null ? null : compact(builder);
}
