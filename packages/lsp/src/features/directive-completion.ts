import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

interface DirectiveEntry {
    name: string;
    detail: string;
}

const DIRECTIVES: readonly DirectiveEntry[] = [
    { name: 'server', detail: 'environment — the file runs on the server' },
    { name: 'client', detail: 'environment — the file runs on the client' },
    { name: 'shared', detail: 'environment — the file runs on both sides' },
    { name: 'strict', detail: 'strictness — every type rule is enforced. The default' },
    { name: 'nonstrict', detail: 'strictness — unannotated values are "any", annotated ones are still checked' },
    { name: 'nocheck', detail: 'strictness — the file is compiled but not type checked' },
];

const DIRECTIVE_LINE = /(?:^|\n)[ \t]*#![ \t]*[A-Za-z]*$/;

export function isDirectivePosition(text: string, offset: number): boolean {
    return DIRECTIVE_LINE.test(text.slice(0, offset));
}

export function directiveItems(): CompletionItem[] {
    return DIRECTIVES.map((directive) => ({
        label: directive.name,
        kind: CompletionItemKind.Keyword,
        detail: directive.detail,
    }));
}
