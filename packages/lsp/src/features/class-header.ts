import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { isIdentifierChar } from '@lsp/support/source-text';

export type ClassHeaderPosition = 'modifier' | 'super-class' | 'interface' | 'interface-modifier' | 'super-interface';

const NAME = '[A-Za-z_][A-Za-z0-9_]*';

const DECLARATION_NAME = new RegExp(`^\\s*(?:class|interface)\\s+(${NAME})`);

const SUPER_CLASS_HEAD = new RegExp(`^\\s*class\\s+${NAME}\\s+extends\\s+$`);

const INTERFACE_HEAD = new RegExp(`^\\s*class\\s+${NAME}(?:\\s+extends\\s+${NAME})?\\s+implements\\s+(?:${NAME}\\s*,\\s*)*$`);

const MODIFIER_HEAD = new RegExp(`^\\s*class\\s+${NAME}(?:\\s+extends\\s+${NAME})?\\s+$`);

const SUPER_INTERFACE_HEAD = new RegExp(`^\\s*interface\\s+${NAME}\\s+extends\\s+(?:${NAME}\\s*,\\s*)*$`);

const INTERFACE_MODIFIER_HEAD = new RegExp(`^\\s*interface\\s+${NAME}\\s+$`);

const EXTENDS_ITEM: CompletionItem = {
    label: 'extends',
    kind: CompletionItemKind.Keyword,
    detail: 'extends Base — inherit fields and methods from another class',
};

const INTERFACE_EXTENDS_ITEM: CompletionItem = {
    label: 'extends',
    kind: CompletionItemKind.Keyword,
    detail: 'extends Shape — inherit members from one or more interfaces',
};

const IMPLEMENTS_ITEM: CompletionItem = {
    label: 'implements',
    kind: CompletionItemKind.Keyword,
    detail: 'implements Shape — declare the interfaces this class satisfies',
};

function headOf(text: string, offset: number): string {
    let start = offset;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    return text.slice(text.lastIndexOf('\n', start - 1) + 1, start);
}

export function classHeaderPosition(text: string, offset: number): ClassHeaderPosition | null {
    const head = headOf(text, offset);

    if (SUPER_CLASS_HEAD.test(head)) {
        return 'super-class';
    }

    if (INTERFACE_HEAD.test(head)) {
        return 'interface';
    }

    if (SUPER_INTERFACE_HEAD.test(head)) {
        return 'super-interface';
    }

    if (INTERFACE_MODIFIER_HEAD.test(head)) {
        return 'interface-modifier';
    }

    return MODIFIER_HEAD.test(head) ? 'modifier' : null;
}

function modifierItems(head: string): CompletionItem[] {
    return /\bextends\b/.test(head) ? [IMPLEMENTS_ITEM] : [EXTENDS_ITEM, IMPLEMENTS_ITEM];
}

function typeItemsOf(analysis: DocumentAnalysis, kind: 'class' | 'interface', declared: string): CompletionItem[] {
    const names = kind === 'class' ? analysis.declarations.allClasses() : analysis.declarations.allInterfaces();
    const itemKind = kind === 'class' ? CompletionItemKind.Class : CompletionItemKind.Interface;

    return names
        .filter((info) => info.name !== declared)
        .map((info) => ({ label: info.name, kind: itemKind, detail: `${kind} ${info.name}` }));
}

export function classHeaderItems(analysis: DocumentAnalysis, offset: number, position: ClassHeaderPosition): CompletionItem[] {
    const head = headOf(analysis.text, offset);
    const declared = DECLARATION_NAME.exec(head)?.[1] ?? '';

    if (position === 'modifier') {
        return modifierItems(head);
    }

    if (position === 'interface-modifier') {
        return [INTERFACE_EXTENDS_ITEM];
    }

    return typeItemsOf(analysis, position === 'super-class' ? 'class' : 'interface', declared);
}
