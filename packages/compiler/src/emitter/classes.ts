import { emitExpression, emitFunctionBody, emitString } from './expressions';
import { indentLine, markSource, requireHelper, withSymbol, type EmitState } from './state';

import type { Parameter } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration, EnumDeclaration } from '@compiler/parser/declaration-nodes';

const BARE_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function emitMemberKey(name: string): string {
    return BARE_KEY.test(name) ? name : `[${emitString(name)}]`;
}

export function emitMethod(state: EmitState, className: string, member: ClassMethodDeclaration): string {
    const self: Parameter = { name: 'self', annotation: null, isVararg: false, position: member.position };

    if (member.generated !== undefined) {
        return emitGeneratedMethod(state, className, member);
    }

    const parameters = member.isStatic ? member.parameters : [self, ...member.parameters];

    return withSymbol(state, `${className}${member.isStatic ? '.' : ':'}${member.name}`, () => emitFunctionBody(state, parameters, member.body, `${emitMemberKey(member.name)} = function`));
}

function emitGeneratedMethod(state: EmitState, className: string, member: ClassMethodDeclaration): string {
    const fields = member.generated?.fields ?? [];
    const field = fields[0];
    const names = fields.map((value) => value.name);

    if (member.generated?.kind === 'fluent-setter' && field !== undefined) {
        return `${member.name} = function(self, value)\n        self.${field.name} = value\n        return self\n    end`;
    }

    if (member.generated?.kind === 'lazy' && field !== undefined) {
        return `${member.name} = function(self)\n        if self.${field.name} == nil then\n            self.${field.name} = ${emitExpression(state, field.value!)}\n        end\n        return self.${field.name}\n    end`;
    }

    if (member.generated?.kind === 'observable' && field !== undefined) {
        const listener = member.name.startsWith('on');
        const key = `__${field.name}Listeners`;

        return listener
            ? `${member.name} = function(self, listener)\n        self.${key} = self.${key} or {}\n        table.insert(self.${key}, listener)\n    end`
            : `${member.name} = function(self, value)\n        self.${field.name} = value\n        for _, listener in ipairs(self.${key} or {}) do\n            listener(value)\n        end\n    end`;
    }

    if (member.generated?.kind === 'validate' || member.generated?.kind === 'matches') {
        const helper = member.generated.kind === 'validate' ? '__luam_validate' : '__luam_matches';

        requireHelper(state, 'validate');

        return `${member.name} = function(value)\n        return ${helper}(value, ${member.generated.descriptor ?? '{ kind = \'table\' }'})\n    end`;
    }

    if (member.generated?.kind === 'to-string') {
        const values = names.map((name) => `'${name}=' .. tostring(self.${name})`).join(" .. ', ' .. ");
        const body = values.length === 0 ? "''" : values;

        return `${member.name} = function(self)\n        return '${className}{' .. ${body} .. '}'\n    end`;
    }

    if (member.generated?.kind === 'equals') {
        const comparison = names.length === 0 ? 'true' : names.map((name) => `self.${name} == other.${name}`).join(' and ');

        return `${member.name} = function(self, other)\n        return ${comparison}\n    end`;
    }

    if (member.generated?.kind === 'clone') {
        const assignments = names.map((name) => `        value.${name} = self.${name}`).join('\n');

        return `${member.name} = function(self)\n        local value = new '${className}' ()\n${assignments}\n        return value\n    end`;
    }

    if (member.generated?.kind === 'serializable') {
        return `${member.name} = function(self)\n        return { ${names.map((name) => `${name} = self.${name}`).join(', ')} }\n    end`;
    }

    if (member.generated?.kind === 'deserialize') {
        return `${member.name} = function(self, values)\n${names.map((name) => `        self.${name} = values.${name}`).join('\n')}\n    end`;
    }

    return `${member.name} = function(self)\n    end`;
}

function emitMembers(state: EmitState, statement: ClassDeclaration): string[] {
    const entries: string[] = [];

    state.indent += 1;

    for (const member of statement.members) {
        if (member.kind === 'class-method') {
            entries.push(indentLine(state, `${markSource(state, member.position.line, `${statement.name}${member.isStatic ? '.' : ':'}${member.name}`)}${emitMethod(state, statement.name, member)}`));

            continue;
        }

        if (member.decorators.some((decorator) => decorator.name === 'Lazy')) {
            continue;
        }

        const value = member.value === null ? 'nil' : emitExpression(state, member.value);

        entries.push(indentLine(state, `${markSource(state, member.position.line, statement.name)}${emitMemberKey(member.name)} = ${value}`));
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

export function emitBuilder(state: EmitState, statement: ClassDeclaration): string | null {
    if (!statement.decorators.some((decorator) => decorator.name === 'Builder')) {
        return null;
    }

    const name = `${statement.name}Builder`;
    const fields = statement.members.filter((member) => member.kind === 'class-field');
    const methods = fields.map((field) => {
        const method = `with${field.name[0]?.toUpperCase()}${field.name.slice(1)}`;

        return `${method} = function(self, value)\n        self.${field.name} = value\n        return self\n    end`;
    });
    const assignments = fields.map((field) => `        value.${field.name} = self.${field.name}`).join('\n');
    methods.push(`build = function(self)\n        local value = new '${statement.name}' ()\n${assignments}\n        return value\n    end`);
    state.indent += 1;
    const entries = methods.map((method) => indentLine(state, method));
    state.indent -= 1;

    return [`class '${name}' {`, entries.join(',\n'), '}' ].join('\n');
}

export function emitClassDeclaration(state: EmitState, statement: ClassDeclaration): string {
    requireHelper(state, 'class');

    const header = emitClassHeader(statement);
    const entries = emitMembers(state, statement);

    const declaration = entries.length === 0 ? `${header} {}` : [`${header} {`, entries.join(',\n'), indentLine(state, '}')].join('\n');
    const builder = emitBuilder(state, statement);

    return builder === null ? declaration : `${declaration}\n${builder}`;
}

export function emitEnumDeclaration(state: EmitState, statement: EnumDeclaration): string | null {
    if (!state.references.has(statement.name)) {
        return null;
    }

    requireHelper(state, 'class');

    const names = statement.members.map((member) => emitString(member.name));
    const target = statement.isLocal ? `local ${statement.name}` : statement.name;

    return names.length === 0 ? `${target} = enum {}` : `${target} = enum { ${names.join(', ')} }`;
}
