import { emitExpression, emitFunctionBody, emitString } from './expressions';
import { indentLine, markSource, requireHelper, withSymbol, type EmitState } from './state';

import type { Parameter } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration, EnumDeclaration } from '@compiler/parser/declaration-nodes';

function emitMethod(state: EmitState, className: string, member: ClassMethodDeclaration): string {
    const self: Parameter = { name: 'self', annotation: null, isVararg: false, position: member.position };

    return withSymbol(state, `${className}:${member.name}`, () => emitFunctionBody(state, [self, ...member.parameters], member.body, `${member.name} = function`));
}

function emitMembers(state: EmitState, statement: ClassDeclaration): string[] {
    const entries: string[] = [];

    state.indent += 1;

    for (const member of statement.members) {
        if (member.kind === 'class-method') {
            entries.push(indentLine(state, `${markSource(state, member.position.line, `${statement.name}:${member.name}`)}${emitMethod(state, statement.name, member)}`));

            continue;
        }

        if (member.value !== null) {
            entries.push(indentLine(state, `${markSource(state, member.position.line, statement.name)}${member.name} = ${emitExpression(state, member.value)}`));
        }

    }

    for (const generated of state.generatedMembers.get(statement) ?? []) {
        entries.push(indentLine(state, `${markSource(state, generated.position.line, `${statement.name}:${generated.name}`)}${emitMethod(state, statement.name, generated)}`));
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
