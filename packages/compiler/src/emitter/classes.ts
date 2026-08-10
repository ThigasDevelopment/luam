import type { Parameter } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration, EnumDeclaration } from '@compiler/parser/declaration-nodes';

import { emitExpression, emitFunctionBody, emitString } from './expressions';
import { indentLine, requireHelper, type EmitState } from './state';

function emitMethod(state: EmitState, member: ClassMethodDeclaration): string {
    const self: Parameter = { name: 'self', annotation: null, isVararg: false, position: member.position };

    return emitFunctionBody(state, [self, ...member.parameters], member.body, `${member.name} = function`);
}

function emitMembers(state: EmitState, statement: ClassDeclaration): string[] {
    const entries: string[] = [];

    state.indent += 1;

    for (const member of statement.members) {
        if (member.kind === 'class-method') {
            entries.push(indentLine(state, emitMethod(state, member)));

            continue;
        }

        if (member.value !== null) {
            entries.push(indentLine(state, `${member.name} = ${emitExpression(state, member.value)}`));
        }
    }

    state.indent -= 1;

    return entries;
}

function emitClassHeader(statement: ClassDeclaration): string {
    const name = emitString(statement.name);

    return statement.superClass === null ? `class ${name}` : `class ${name} :extends ${emitString(statement.superClass)}`;
}

export function emitClassDeclaration(state: EmitState, statement: ClassDeclaration): string {
    requireHelper(state, 'class');

    const header = emitClassHeader(statement);
    const entries = emitMembers(state, statement);

    if (entries.length === 0) {
        return `${header} {}`;
    }

    return [`${header} {`, entries.join(',\n'), indentLine(state, '}')].join('\n');
}

export function emitEnumDeclaration(state: EmitState, statement: EnumDeclaration): string | null {
    if (!state.references.has(statement.name)) {
        return null;
    }

    requireHelper(state, 'class');

    const names = statement.members.map((member) => emitString(member.name));

    return names.length === 0 ? `${statement.name} = enum {}` : `${statement.name} = enum { ${names.join(', ')} }`;
}
