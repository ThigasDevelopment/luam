import type { Role } from '@theme/role-types';

type Layer = Role['layer'];

interface Flags {
    ambient?: boolean;
    exception?: string;
}

function role(id: string, set: Role['set'], tone: string, layer: Layer, description: string, flags: Flags = {}): Role {
    const [hue, step, style] = tone.split('/') as [Role['hue'], Role['step'], Role['style']];

    return { id, set, hue, step, style, layer, ambient: flags.ambient === true, exception: flags.exception ?? null, description };
}

const CALLABLE: readonly Role[] = [
    role('call.constructor', 'callable', 'gold/strong/none', 'runtime', 'A class instantiated through new'),
    role('call.function', 'callable', 'blue/strong/none', 'runtime', 'A function the user declared, called by name'),
    role('call.method', 'callable', 'blue/muted/none', 'runtime', 'A method reached through a colon call'),
    role('call.native', 'callable', 'violet/muted/none', 'runtime', 'An MTA native: vocabulary the platform gave you'),
    role('call.library', 'callable', 'violet/muted/bold', 'runtime', 'A Lua standard library symbol: the vocabulary underneath everything'),
    role('call.decorator', 'callable', 'cyan/base/italic', 'erased', 'A decorator name, erased before the Lua is written'),
];

const DECLARATION_NAME: readonly Role[] = [
    role('name.type', 'declaration-name', 'gold/base/bold', 'neutral', 'The name a class, interface, enum, or type alias introduces'),
    role('name.inherited', 'declaration-name', 'gold/base/none', 'neutral', 'A name after extends or implements'),
];

const IDENTIFIER: readonly Role[] = [
    role('identifier.language', 'identifier', 'rose/strong/none', 'runtime', 'self, super, the vararg, and the values the manifest injects'),
    role('identifier.member', 'identifier', 'rose/base/none', 'runtime', 'A field, property, or enum member reached through a dot'),
    role('identifier.parameter', 'identifier', 'rose/muted/none', 'runtime', 'A parameter read in a function body'),
    role('identifier.local', 'identifier', 'blue/base/none', 'runtime', 'A local read in an expression'),
    role('identifier.generated', 'identifier', 'blue/muted/italic', 'runtime', 'A member a decorator produced rather than the user writing it'),
];

const KEYWORD: readonly Role[] = [
    role('directive.environment', 'keyword', 'violet/strong/bold', 'neutral', 'The environment a file belongs to', { exception: 'R6' }),
    role('keyword', 'keyword', 'violet/base/bold', 'neutral', 'Every word the language reserves: control flow and the words that introduce a name'),
    role('keyword.modifier', 'keyword', 'violet/muted/none', 'neutral', 'extends, implements, and the export and http build directives'),
    role('directive.strictness', 'keyword', 'cyan/base/italic', 'erased', 'The strict, nonstrict, and nocheck directives'),
];

const LITERAL: readonly Role[] = [
    role('literal.string', 'literal', 'green/base/none', 'runtime', 'Every string form, and an MTA event name'),
    role('literal.constant', 'literal', 'orange/base/none', 'runtime', 'Every scalar constant: numbers, booleans, nil, and an escape inside a string'),
    role('punctuation.interpolation', 'literal', 'ink/muted/none', 'runtime', 'The delimiters that reopen code inside a template', { ambient: true }),
];

const TYPE: readonly Role[] = [
    role('type.name', 'type', 'cyan/base/none', 'erased', 'A named type in an annotation'),
    role('type.primitive', 'type', 'cyan/muted/none', 'erased', 'A primitive type in an annotation'),
];

const PUNCTUATION: readonly Role[] = [
    role('operator.logical', 'punctuation', 'violet/muted/none', 'runtime', 'and, or, and not'),
    role('punctuation', 'punctuation', 'ink/muted/none', 'neutral', 'Brackets, separators, accessors, operators, and type punctuation', { ambient: true }),
];

const COMMENT: readonly Role[] = [role('comment', 'comment', 'ink/faint/italic', 'neutral', 'Line and block comments', { ambient: true })];

export const ROLES: readonly Role[] = [...CALLABLE, ...DECLARATION_NAME, ...IDENTIFIER, ...KEYWORD, ...LITERAL, ...TYPE, ...PUNCTUATION, ...COMMENT];

export const ROLE_BY_ID: ReadonlyMap<string, Role> = new Map(ROLES.map((entry) => [entry.id, entry]));

export function roleOf(id: string): Role {
    const found = ROLE_BY_ID.get(id);

    if (found === undefined) {
        throw new Error(`The role table has no "${id}" role.`);
    }

    return found;
}
