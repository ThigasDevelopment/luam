import type { MemberInfo } from '@compiler/checker/registry';
import { typeToString, type Type } from '@compiler/checker/types';
import { NATIVE_EXTENSIONS } from '@compiler/extensions/native-extensions';
import type { ApiDeclaration } from '@mta-types/api-declaration';
import type { ApiDocumentation } from '@mta-types/api-documentation';
import { memberDocumentation } from '@mta-types/documentation-lookup';
import { LIBRARY_MEMBERS, type LibraryName } from '@mta-types/library-members';
import { CompletionItemKind, MarkupKind, type CompletionItem } from 'vscode-languageserver';

import { descriptorText, namedDescriptorText } from '@lsp/features/api-text';
import { documentationBody, documentationFor } from '@lsp/features/documentation-text';
import type { SymbolDeclaration, SymbolKind } from '@lsp/symbols/symbol';

const ITEM_KINDS: Readonly<Record<SymbolKind, CompletionItemKind>> = {
    local: CompletionItemKind.Variable,
    parameter: CompletionItemKind.Variable,
    function: CompletionItemKind.Function,
    global: CompletionItemKind.Variable,
    class: CompletionItemKind.Class,
    interface: CompletionItemKind.Interface,
    enum: CompletionItemKind.Enum,
    'type-alias': CompletionItemKind.TypeParameter,
    field: CompletionItemKind.Field,
    method: CompletionItemKind.Method,
    'enum-member': CompletionItemKind.EnumMember,
};

export const KEYWORD_ITEMS: readonly CompletionItem[] = [
    'and',
    'break',
    'class',
    'do',
    'else',
    'elseif',
    'end',
    'enum',
    'false',
    'for',
    'function',
    'if',
    'in',
    'interface',
    'local',
    'new',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'type',
    'until',
    'while',
].map((label) => ({ label, kind: CompletionItemKind.Keyword }));

export const DIRECTIVE_ITEMS: readonly CompletionItem[] = [
    { label: 'export', kind: CompletionItemKind.Keyword, detail: 'export function — expose a function to other resources' },
];

export function symbolItem(declaration: SymbolDeclaration): CompletionItem {
    return { label: declaration.name, kind: ITEM_KINDS[declaration.kind], detail: declaration.detail };
}

export function apiItem(declaration: ApiDeclaration): CompletionItem {
    const kind = declaration.type.kind === 'function' ? CompletionItemKind.Function : CompletionItemKind.Variable;
    const documentation = documentationFor(declaration.name);
    const body = documentationBody(documentation);
    const item: CompletionItem = { label: declaration.name, kind, detail: namedDescriptorText(declaration.name, declaration.type, documentation) };

    if (body.length === 0) {
        return item;
    }

    return { ...item, documentation: { kind: MarkupKind.Markdown, value: body.join('\n\n') } };
}

function withDocumentation(item: CompletionItem, documentation: ApiDocumentation): CompletionItem {
    const body = documentationBody(documentation);

    return body.length === 0 ? item : { ...item, documentation: { kind: MarkupKind.Markdown, value: body.join('\n\n') } };
}

export function memberItem(name: string, type: Type, isMethod: boolean, owner: string): CompletionItem {
    const item: CompletionItem = {
        label: name,
        kind: isMethod ? CompletionItemKind.Method : CompletionItemKind.Field,
        detail: `${owner}.${name}: ${typeToString(type)}`,
    };

    return withDocumentation(item, memberDocumentation(owner, name));
}

export function mtaMemberItem(member: MemberInfo, owner: string): CompletionItem {
    return {
        label: member.name,
        kind: member.isMethod ? CompletionItemKind.Method : CompletionItemKind.Field,
        detail: `${owner}.${member.name}: ${typeToString(member.type)} — wraps ${member.procedural ?? ''} (${member.environment ?? ''})`,
    };
}

export function enumMemberItems(name: string, members: readonly string[]): CompletionItem[] {
    return members.map((member, index) => ({
        label: member,
        kind: CompletionItemKind.EnumMember,
        detail: `${name}.${member} = ${index}`,
    }));
}

export function libraryItems(library: LibraryName): CompletionItem[] {
    return Object.entries(LIBRARY_MEMBERS[library]).map(([name, descriptor]) => {
        const documentation = memberDocumentation(library, name);
        const item: CompletionItem = {
            label: name,
            kind: descriptor.kind === 'function' ? CompletionItemKind.Function : CompletionItemKind.Variable,
            detail: namedDescriptorText(`${library}.${name}`, descriptor, documentation),
        };

        return withDocumentation(item, documentation);
    });
}

export function extensionItems(receiver: 'table' | 'string' | 'number'): CompletionItem[] {
    return NATIVE_EXTENSIONS.filter((extension) => extension.receiver === receiver).map((extension) => ({
        label: extension.property,
        kind: extension.style === 'call' ? CompletionItemKind.Method : CompletionItemKind.Property,
        detail: `${extension.target} -> ${extension.result}`,
    }));
}
