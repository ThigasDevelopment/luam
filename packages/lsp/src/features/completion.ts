import { descriptorToType } from '@compiler/checker/api-types';
import { mtaMembersFor, mtaStaticMembersFor } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { typeToString, type RecordType } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import { globalsFor } from '@mta-types/catalog';
import { oopClassesFor } from '@mta-types/oop-surface';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { expectedArgument, withArgumentRank, type ArgumentExpectation } from '@lsp/features/argument-expectation';
import { classBodyNeedsConstructor } from '@lsp/features/class-body';
import { classHeaderItems, classHeaderPosition } from '@lsp/features/class-header';
import { tableLiteralMembers, writtenKeys } from '@lsp/features/table-literal';
import {
    completionContext,
    hasDecoratorPrefix,
    isDecoratorPosition,
    isStatementStart,
    resolveReceiver,
    type CompletionContext,
    type ReceiverTarget,
} from '@lsp/features/completion-context';
import {
    apiItem,
    constructorItem,
    DIRECTIVE_ITEMS,
    decoratorItems,
    enumMemberItems,
    extensionItems,
    KEYWORD_ITEMS,
    libraryItems,
    memberItem,
    mtaMemberItem,
    superItem,
    symbolItem,
} from '@lsp/features/completion-items';
import { eventItems, isEventArgument } from '@lsp/features/event-completion';
import { manifestCompletion } from '@lsp/features/manifest-completion';
import { scanContext, type CallFrame } from '@lsp/features/source-context';
import { isTypePosition, typeItems } from '@lsp/features/type-completion';
import { MEMBER_KINDS } from '@lsp/symbols/symbol';

function classItems(analysis: DocumentAnalysis, name: string, isMethod: boolean): CompletionItem[] {
    if (analysis.oop && isMtaElementName(analysis.declarations, name)) {
        return mtaMembersFor(name, analysis.environment)
            .filter((member) => member.isMethod === isMethod)
            .map((member) => mtaMemberItem(member, name));
    }

    return analysis.declarations
        .collectMembers(name)
        .filter((member) => member.isMethod === isMethod)
        .map((member) => memberItem(member.name, member.type, member.isMethod, name));
}

function enumItems(analysis: DocumentAnalysis, name: string): CompletionItem[] {
    return enumMemberItems(name, analysis.declarations.lookupEnum(name)?.members ?? []);
}

function recordItems(record: RecordType): CompletionItem[] {
    return [...record.members].map(([name, type]) => memberItem(name, type, false, record.name));
}

function tableKeyItems(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
    const members = tableLiteralMembers(analysis, offset);

    if (members === null) {
        return [];
    }

    const written = writtenKeys(analysis.text, offset);

    return [...members]
        .filter(([name]) => !written.has(name))
        .map(([name, type]) => ({
            label: name,
            kind: CompletionItemKind.Field,
            detail: `${name}: ${typeToString(type)}`,
            insertText: `${name} = `,
        }));
}

function memberItems(analysis: DocumentAnalysis, target: ReceiverTarget, trigger: '.' | ':'): CompletionItem[] {
    if (target.kind === 'static-class') {
        return trigger === ':' ? [] : mtaStaticMembersFor(target.name, analysis.environment).map((member) => mtaMemberItem(member, target.name));
    }

    if (target.kind === 'library') {
        return libraryItems(target.library);
    }

    if (target.kind === 'native') {
        return extensionItems(target.receiver);
    }

    if (target.kind === 'record') {
        return recordItems(target.record);
    }

    return target.kind === 'enum' ? enumItems(analysis, target.name) : classItems(analysis, target.name, trigger === ':');
}

function superItems(analysis: DocumentAnalysis, target: ReceiverTarget, context: CompletionContext): CompletionItem[] {
    if (context.trigger !== ':' || context.segments.length !== 1 || context.segments[0] !== 'self' || target.kind !== 'class') {
        return [];
    }

    const superClass = analysis.declarations.lookupClass(target.name)?.superClass ?? null;

    return superClass === null ? [] : [superItem(superClass)];
}

function scopeItems(analysis: DocumentAnalysis, offset: number, expectation: ArgumentExpectation | null): CompletionItem[] {
    return analysis.index
        .visibleAt(offset)
        .filter((declaration) => !MEMBER_KINDS.has(declaration.kind))
        .map((declaration) => withArgumentRank(symbolItem(declaration), declaration.type, expectation));
}

function apiItems(analysis: DocumentAnalysis, expectation: ArgumentExpectation | null): CompletionItem[] {
    return globalsFor(analysis.environment).map((declaration) => withArgumentRank(apiItem(declaration), descriptorToType(declaration.type), expectation));
}

function plainItems(items: readonly CompletionItem[], expectation: ArgumentExpectation | null): CompletionItem[] {
    return items.map((item) => withArgumentRank(item, null, expectation));
}

function mtaClassItems(analysis: DocumentAnalysis): CompletionItem[] {
    if (!analysis.oop) {
        return [];
    }

    return oopClassesFor(analysis.environment)
        .filter((declaration) => declaration.constructor !== null || declaration.staticMethods.length > 0)
        .map((declaration) => ({ label: declaration.name, kind: CompletionItemKind.Class, detail: `MTA OOP class ${declaration.name}` }));
}

function workspaceItems(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[]): CompletionItem[] {
    const items: CompletionItem[] = [];

    for (const other of others) {
        if (!canReference(analysis.environment, other.environment)) {
            continue;
        }

        for (const name of other.declaredGlobals.keys()) {
            items.push({ label: name, kind: CompletionItemKind.Variable, detail: `declared in ${other.relative}` });
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
    if (analysis.manifest !== null) {
        return deduplicate(manifestCompletion(analysis, offset));
    }

    const lexical = scanContext(analysis.text, offset);

    if (lexical.inComment) {
        return [];
    }

    if (lexical.inString) {
        return deduplicate(stringItems(analysis, offset, others, lexical.frame));
    }

    if (isDecoratorPosition(analysis.text, offset)) {
        return decoratorItems();
    }

    if (hasDecoratorPrefix(analysis.text, offset) || analysis.text[offset - 1] === '@') {
        return [];
    }

    const header = classHeaderPosition(analysis.text, offset);

    if (header !== null) {
        return deduplicate(classHeaderItems(analysis, offset, header));
    }

    const context = completionContext(analysis.text, offset);

    if (context.trigger !== null) {
        const target = resolveReceiver(analysis, offset, context.segments);

        if (target !== null) {
            return deduplicate([...memberItems(analysis, target, context.trigger), ...superItems(analysis, target, context)]);
        }
    }

    if (isTypePosition(analysis.text, offset)) {
        return deduplicate(typeItems(analysis, offset));
    }

    if (context.trigger !== null) {
        return [];
    }

    const directives = isStatementStart(analysis.text, offset) ? DIRECTIVE_ITEMS : [];
    const constructor = classBodyNeedsConstructor(analysis, lexical.frame, offset) ? [constructorItem()] : [];
    const expectation = expectedArgument(analysis, offset, lexical.frame);

    return deduplicate([
        ...plainItems(tableKeyItems(analysis, offset), expectation),
        ...scopeItems(analysis, offset, expectation),
        ...plainItems(workspaceItems(analysis, others), expectation),
        ...plainItems(mtaClassItems(analysis), expectation),
        ...apiItems(analysis, expectation),
        ...plainItems(directives, expectation),
        ...plainItems(constructor, expectation),
        ...plainItems(KEYWORD_ITEMS, expectation),
    ]);
}
