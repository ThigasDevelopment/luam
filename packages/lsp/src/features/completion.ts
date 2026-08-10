import { mtaMembersFor } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import type { RecordType } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import { globalsFor } from '@mta-types/catalog';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { completionContext, isStatementStart, resolveReceiver, type ReceiverTarget } from '@lsp/features/completion-context';
import {
    apiItem,
    DIRECTIVE_ITEMS,
    enumMemberItems,
    extensionItems,
    KEYWORD_ITEMS,
    libraryItems,
    memberItem,
    mtaMemberItem,
    symbolItem,
} from '@lsp/features/completion-items';
import { eventItems, isEventArgument } from '@lsp/features/event-completion';
import { scanContext, type CallFrame } from '@lsp/features/source-context';
import { isTypePosition, typeItems } from '@lsp/features/type-completion';
import { MEMBER_KINDS } from '@lsp/symbols/symbol';

function classItems(analysis: DocumentAnalysis, name: string): CompletionItem[] {
    if (analysis.oop && isMtaElementName(analysis.declarations, name)) {
        return mtaMembersFor(name, analysis.environment).map((member) => mtaMemberItem(member, name));
    }

    return analysis.declarations.collectMembers(name).map((member) => memberItem(member.name, member.type, member.isMethod, name));
}

function enumItems(analysis: DocumentAnalysis, name: string): CompletionItem[] {
    return enumMemberItems(name, analysis.declarations.lookupEnum(name)?.members ?? []);
}

function recordItems(record: RecordType): CompletionItem[] {
    return [...record.members].map(([name, type]) => memberItem(name, type, false, record.name));
}

function memberItems(analysis: DocumentAnalysis, target: ReceiverTarget): CompletionItem[] {
    if (target.kind === 'library') {
        return libraryItems(target.library);
    }

    if (target.kind === 'native') {
        return extensionItems(target.receiver);
    }

    if (target.kind === 'record') {
        return recordItems(target.record);
    }

    return target.kind === 'enum' ? enumItems(analysis, target.name) : classItems(analysis, target.name);
}

function scopeItems(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
    return analysis.index
        .visibleAt(offset)
        .filter((declaration) => !MEMBER_KINDS.has(declaration.kind))
        .map(symbolItem);
}

function apiItems(analysis: DocumentAnalysis): CompletionItem[] {
    return globalsFor(analysis.environment).map(apiItem);
}

function workspaceItems(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[]): CompletionItem[] {
    const items: CompletionItem[] = [];

    for (const other of others) {
        if (!canReference(analysis.environment, other.environment)) {
            continue;
        }

        for (const name of other.declaredGlobals.keys()) {
            items.push({ label: name, kind: CompletionItemKind.Variable, detail: `declared in ${other.path}` });
        }
    }

    return items;
}

function deduplicate(items: readonly CompletionItem[]): CompletionItem[] {
    const seen = new Set<string>();
    const unique: CompletionItem[] = [];

    for (const item of items) {
        if (!seen.has(item.label)) {
            seen.add(item.label);
            unique.push(item);
        }
    }

    return unique;
}

function stringItems(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[], frame: CallFrame | null): CompletionItem[] {
    if (frame === null || !frame.isCall || !isEventArgument(analysis.text, frame)) {
        return [];
    }

    return eventItems(analysis, others);
}

export function completionAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): CompletionItem[] {
    const lexical = scanContext(analysis.text, offset);

    if (lexical.inComment) {
        return [];
    }

    if (lexical.inString) {
        return deduplicate(stringItems(analysis, offset, others, lexical.frame));
    }

    if (isTypePosition(analysis.text, offset)) {
        return deduplicate(typeItems(analysis, offset));
    }

    const context = completionContext(analysis.text, offset);

    if (context.trigger !== null) {
        const target = resolveReceiver(analysis, offset, context.segments);

        return target === null ? [] : deduplicate(memberItems(analysis, target));
    }

    const directives = isStatementStart(analysis.text, offset) ? DIRECTIVE_ITEMS : [];

    return deduplicate([
        ...scopeItems(analysis, offset),
        ...workspaceItems(analysis, others),
        ...apiItems(analysis),
        ...directives,
        ...KEYWORD_ITEMS,
    ]);
}
