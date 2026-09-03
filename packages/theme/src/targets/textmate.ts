export const UNPAINTED_SCOPES: readonly string[] = ['meta.embedded.expression.luam', 'meta.type.luam', 'meta.embedded.expression.luam-manifest'];

export const TEXTMATE_MAP: Readonly<Record<string, readonly string[]>> = {
    comment: ['comment.block.luam', 'comment.line.number-sign.luam', 'comment.block.luam-manifest', 'comment.line.number-sign.luam-manifest'],
    punctuation: [
        'punctuation.definition.directive.luam',
        'punctuation.definition.decorator.luam',
        'punctuation.section.parens.begin.luam',
        'punctuation.section.parens.end.luam',
        'punctuation.section.brackets.begin.luam',
        'punctuation.section.brackets.end.luam',
        'punctuation.section.braces.begin.luam',
        'punctuation.section.braces.end.luam',
        'punctuation.separator.comma.luam',
        'punctuation.terminator.statement.luam',
        'punctuation.accessor.luam',
        'punctuation.separator.type.luam',
        'punctuation.definition.array.luam',
        'punctuation.definition.typeparameters.begin.luam',
        'punctuation.definition.typeparameters.end.luam',
        'keyword.operator.type.luam',
        'keyword.operator.optional.luam',
        'keyword.operator.increment.luam',
        'keyword.operator.comparison.luam',
        'keyword.operator.assignment.luam',
        'keyword.operator.arithmetic.luam',
        'punctuation.section.parens.begin.luam-manifest',
        'punctuation.section.parens.end.luam-manifest',
        'punctuation.section.brackets.begin.luam-manifest',
        'punctuation.section.brackets.end.luam-manifest',
        'punctuation.section.braces.begin.luam-manifest',
        'punctuation.section.braces.end.luam-manifest',
        'punctuation.separator.comma.luam-manifest',
        'punctuation.accessor.luam-manifest',
        'keyword.operator.assignment.luam-manifest',
        'keyword.operator.comparison.luam-manifest',
        'keyword.operator.arithmetic.luam-manifest',
    ],
    'punctuation.interpolation': [
        'punctuation.definition.template-expression.begin.luam',
        'punctuation.definition.template-expression.end.luam',
        'punctuation.definition.template-expression.begin.luam-manifest',
        'punctuation.definition.template-expression.end.luam-manifest',
    ],
    'operator.logical': ['keyword.operator.logical.luam', 'keyword.operator.logical.luam-manifest'],
    'directive.strictness': ['keyword.control.directive.strictness.luam'],
    'directive.environment': [
        'keyword.control.directive.environment.server.luam',
        'keyword.control.directive.environment.client.luam',
        'keyword.control.directive.environment.shared.luam',
    ],
    keyword: [
        'keyword.control.luam',
        'keyword.local.luam',
        'storage.type.function.luam',
        'storage.type.class.luam',
        'storage.type.enum.luam',
        'storage.type.interface.luam',
        'storage.type.alias.luam',
        'storage.type.declare.luam',
        'storage.type.constructor.luam',
        'keyword.operator.new.luam',
        'storage.modifier.local.luam-manifest',
        'keyword.control.await.luam',
    ],
    'keyword.modifier': ['storage.modifier.luam', 'storage.modifier.extends.luam', 'storage.modifier.export.luam', 'storage.modifier.http.luam', 'storage.modifier.async.luam'],
    'call.decorator': ['entity.name.function.decorator.luam'],
    'call.constructor': ['entity.name.function.constructor.luam'],
    'call.function': ['entity.name.function.call.luam', 'entity.name.function.luam'],
    'call.method': ['entity.name.function.method.luam'],
    'call.library': ['support.function.library.luam', 'support.function.luam'],
    'name.type': ['entity.name.type.class.luam', 'entity.name.type.enum.luam', 'entity.name.type.interface.luam', 'entity.name.type.alias.luam'],
    'name.inherited': ['entity.other.inherited-class.luam', 'entity.other.inherited-interface.luam'],
    'identifier.local': ['variable.other.luam', 'variable.other.luam-manifest', 'variable.other.readwrite.luam-manifest'],
    'identifier.member': [
        'entity.other.attribute.luam',
        'variable.other.enummember.luam',
        'variable.other.property.luam',
        'meta.object-literal.key.luam',
        'support.type.property-name.luam-manifest',
    ],
    'identifier.parameter': ['variable.parameter.luam'],
    'identifier.language': ['variable.language.self.luam', 'variable.language.vararg.luam', 'variable.language.luam-manifest'],
    'literal.string': [
        'string.quoted.single.luam',
        'string.quoted.double.luam',
        'string.template.luam',
        'string.quoted.other.long.luam',
        'string.unquoted.default.luam',
        'string.quoted.single.luam-manifest',
        'string.quoted.double.luam-manifest',
        'string.template.luam-manifest',
    ],
    'literal.constant': [
        'constant.numeric.luam',
        'constant.language.luam',
        'constant.character.escape.luam',
        'constant.numeric.luam-manifest',
        'constant.language.luam-manifest',
        'constant.character.escape.luam-manifest',
    ],
    'type.name': ['entity.name.type.luam'],
    'type.primitive': ['support.type.primitive.luam', 'storage.type.fun.luam'],
};

export const FOREIGN_MAP: Readonly<Record<string, readonly string[]>> = {
    comment: ['comment', 'punctuation.definition.comment'],
    punctuation: ['punctuation', 'meta.brace', 'punctuation.definition.tag', 'keyword.operator'],
    keyword: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'],
    'literal.string': ['string', 'string.quoted', 'markup.inline.raw', 'markup.raw'],
    'literal.constant': ['constant.numeric', 'constant.language', 'constant.character.escape'],
    'call.function': ['entity.name.function', 'support.function'],
    'call.library': ['support.function.builtin'],
    'name.type': ['entity.name.type', 'entity.name.class', 'support.class', 'markup.heading'],
    'type.name': ['support.type', 'entity.other.attribute-name'],
    'identifier.local': ['variable', 'variable.other', 'source'],
    'identifier.member': ['support.type.property-name', 'meta.object-literal.key', 'entity.name.tag', 'variable.other.member', 'meta.diff.header', 'markup.list'],
    'name.inherited': ['markup.underline.link', 'markup.italic'],
    'call.constructor': ['markup.bold'],
};

export const FALLBACK_SCOPES: Readonly<Record<string, string>> = {
    'call.native': 'entity.name.function.call.luam',
    'identifier.parameter': 'variable.parameter.luam',
    'identifier.generated': 'entity.name.function.luam',
};

export function scopesFor(role: string): readonly string[] {
    return [...(TEXTMATE_MAP[role] ?? []), ...(FOREIGN_MAP[role] ?? [])];
}

export function luamScopes(): string[] {
    return Object.values(TEXTMATE_MAP).flatMap((scopes) => [...scopes]);
}

export function fallbackScope(role: string): string {
    return FALLBACK_SCOPES[role] ?? (TEXTMATE_MAP[role]?.[0] as string | undefined) ?? 'variable.other.luam';
}
