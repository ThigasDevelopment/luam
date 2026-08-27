import { descriptorToType } from '@compiler/checker/api-types';
import { mtaMembersFor, mtaStaticMembersFor } from '@compiler/checker/oop-classes';
import { specializedMembers } from '@compiler/checker/generic-class';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { createNamed, typeToString, type RecordType, type Type } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import { isAvailableIn } from '@mta-types/api-declaration';
import { globalsFor } from '@mta-types/catalog';
import { oopClassDocumentation } from '@mta-types/oop-documentation';
import { oopClassesFor } from '@mta-types/oop-surface';
import { CompletionItemKind, MarkupKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { conflictsWithExpectation, expectedArgument, withArgumentRank, type ArgumentExpectation } from '@lsp/features/argument-expectation';
import { contextGlobalFilter, EVENT_CONTEXT_GLOBALS } from '@lsp/features/context-globals';
import { callbackParameterItems } from '@lsp/features/callback-parameter-completion';
import { classBodyNeedsConstructor } from '@lsp/features/class-body';
import { classHeaderItems, classHeaderPosition } from '@lsp/features/class-header';
import { directiveItems, isDirectivePosition } from '@lsp/features/directive-completion';
import { tableLiteralMembers, writtenKeys } from '@lsp/features/table-literal';
import {
    completionContext,
    hasDecoratorPrefix,
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
    projectItem,
    superItem,
    symbolItem,
} from '@lsp/features/completion-items';
import { eventItems, insideEventHandler, isEventArgument } from '@lsp/features/event-completion';
import { manifestCompletion } from '@lsp/features/manifest-completion';
import { expectedStringType, literalItems, onlyStringLiterals, quotedLiteralItems, stringLiteralValues } from '@lsp/features/literal-completion';
import { scanContext, type SourceContext } from '@lsp/features/source-context';
import { isTypePosition, typeItems } from '@lsp/features/type-completion';
import { MEMBER_KINDS } from '@lsp/symbols/symbol';

function classItems(analysis: DocumentAnalysis, name: string, typeArguments: readonly Type[], isMethod: boolean): CompletionItem[] {
    if (analysis.compilerOptions.oop && isMtaElementName(analysis.declarations, name)) {
        return mtaMembersFor(name, analysis.environment)
            .filter((member) => member.isMethod === isMethod)
            .map((member) => mtaMemberItem(member, name));
    }

    return specializedMembers(analysis.declarations, createNamed(name, typeArguments))
        .filter((member) => member.isMethod === isMethod)
        .map((member) => memberItem(member.name, member.type, member.isMethod, name));
}

function enumItems(analysis: DocumentAnalysis, name: string): CompletionItem[] {
    return enumMemberItems(name, analysis.declarations.lookupEnum(name)?.members ?? []);
}

function recordItems(analysis: DocumentAnalysis, record: RecordType): CompletionItem[] {
    const values: Readonly<Record<string, string>> = record.origin === null ? {} : analysis.env;

    return [...record.members].map(([name, type]) => memberItem(name, type, false, record.name, values[name]));
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

function staticItems(analysis: DocumentAnalysis, name: string, isMethod: boolean): CompletionItem[] {
    return analysis.declarations
        .collectStatics(name)
        .filter((member) => member.isMethod === isMethod)
        .map((member) => memberItem(member.name, member.type, member.isMethod, name));
}

function memberItems(analysis: DocumentAnalysis, target: ReceiverTarget, trigger: '.' | ':'): CompletionItem[] {
    if (target.kind === 'class-value') {
        return trigger === ':' ? [] : [...staticItems(analysis, target.name, false), ...staticItems(analysis, target.name, true)];
    }

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
        return recordItems(analysis, target.record);
    }

    return target.kind === 'enum' ? enumItems(analysis, target.name) : classItems(analysis, target.name, target.typeArguments, trigger === ':');
}

function superItems(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
    const target = resolveReceiver(analysis, offset, ['self']);

    if (target?.kind !== 'class') {
        return [];
    }

    const superClass = analysis.declarations.lookupClass(target.name)?.superClass ?? null;

    return superClass === null ? [] : [superItem(superClass)];
}

function scopeItems(analysis: DocumentAnalysis, offset: number, expectation: ArgumentExpectation | null): CompletionItem[] {
    return analysis.index
        .visibleAt(offset)
        .filter((declaration) => !MEMBER_KINDS.has(declaration.kind) && declaration.kind !== 'event')
        .filter((declaration) => !conflictsWithExpectation(expectation, declaration.type))
        .map((declaration) => withArgumentRank(symbolItem(declaration), declaration.type, expectation));
}

function withEventContextRank(item: CompletionItem, inHandler: boolean): CompletionItem {
    const rank = EVENT_CONTEXT_GLOBALS.indexOf(item.label);

    if (!inHandler || rank === -1) {
        return item;
    }

    return { ...item, sortText: `0${rank}${item.label}` };
}

function apiItems(analysis: DocumentAnalysis, offset: number, expectation: ArgumentExpectation | null, inHandler: boolean): CompletionItem[] {
    const inContext = contextGlobalFilter(analysis, offset);

    return globalsFor(analysis.environment)
        .filter((declaration) => inContext(declaration.name))
        .filter((declaration) => !conflictsWithExpectation(expectation, descriptorToType(declaration.type)))
        .map((declaration) =>
            withEventContextRank(withArgumentRank(apiItem(declaration), descriptorToType(declaration.type), expectation), inHandler));
}

function projectItems(analysis: DocumentAnalysis, expectation: ArgumentExpectation | null): CompletionItem[] {
    return analysis.project.globals
        .filter((declaration) => isAvailableIn(declaration.environment, analysis.environment))
        .filter((declaration) => !conflictsWithExpectation(expectation, descriptorToType(declaration.type)))
        .map((declaration) => withArgumentRank(projectItem(declaration, analysis.env), descriptorToType(declaration.type), expectation));
}

function plainItems(items: readonly CompletionItem[], expectation: ArgumentExpectation | null): CompletionItem[] {
    return items.map((item) => withArgumentRank(item, null, expectation));
}

const EXPRESSION_KEYWORDS: ReadonlySet<string> = new Set(['function', 'new', 'nil', 'not', 'true', 'false']);

function keywordItems(expectation: ArgumentExpectation | null): CompletionItem[] {
    if (expectation === null) {
        return [...KEYWORD_ITEMS];
    }

    return KEYWORD_ITEMS.filter((item) => EXPRESSION_KEYWORDS.has(item.label));
}

function mtaClassItems(analysis: DocumentAnalysis): CompletionItem[] {
    if (!analysis.compilerOptions.oop) {
        return [];
    }

    return oopClassesFor(analysis.environment)
        .filter((declaration) => declaration.constructor !== null || declaration.staticMethods.length > 0)
        .map((declaration) => ({
            label: declaration.name,
            kind: CompletionItemKind.Class,
            detail: `MTA OOP class ${declaration.name}`,
            documentation: { kind: MarkupKind.Markdown, value: oopClassDocumentation(declaration.name) },
        }));
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

function stringItems(
    analysis: DocumentAnalysis,
    offset: number,
    others: readonly DocumentAnalysis[],
    context: SourceContext,
    snippets: boolean,
): CompletionItem[] {
    const frame = context.frame;

    if (frame !== null && frame.isCall && isEventArgument(analysis.text, frame)) {
        return eventItems(analysis, others, frame, { stringStart: context.stringStart, snippets });
    }

    const expected = expectedStringType(analysis, context.stringStart) ?? expectedArgument(analysis, offset, frame)?.type ?? null;

    return expected === null ? [] : literalItems(stringLiteralValues(expected));
}

export function completionAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[], snippets = true): CompletionItem[] {
    if (analysis.manifest !== null) {
        return deduplicate(manifestCompletion(analysis, offset));
    }

    const lexical = scanContext(analysis.text, offset);

    if (isDirectivePosition(analysis.text, offset)) {
        return deduplicate(directiveItems());
    }

    if (lexical.inComment) {
        return [];
    }

    if (lexical.inString) {
        return deduplicate(stringItems(analysis, offset, others, lexical, snippets));
    }

    if (hasDecoratorPrefix(analysis.text, offset)) {
        return decoratorItems();
    }

    if (analysis.text[offset - 1] === '@') {
        return [];
    }

    const callbackParameters = callbackParameterItems(analysis, offset, lexical);

    if (callbackParameters !== null) {
        return callbackParameters;
    }

    const header = classHeaderPosition(analysis.text, offset);

    if (header !== null) {
        return deduplicate(classHeaderItems(analysis, offset, header));
    }

    const context = completionContext(analysis.text, offset);

    if (context.trigger !== null) {
        const target = resolveReceiver(analysis, offset, context.segments);

        if (target !== null) {
            return deduplicate(memberItems(analysis, target, context.trigger));
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
    const inHandler = insideEventHandler(analysis.text, lexical.frames);
    const expected = expectation === null ? [] : quotedLiteralItems(stringLiteralValues(expectation.type));

    if (expected.length > 0 && expectation !== null && onlyStringLiterals(expectation.type)) {
        return deduplicate(expected);
    }

    return deduplicate([
        ...expected,
        ...plainItems(tableKeyItems(analysis, offset), expectation),
        ...scopeItems(analysis, offset, expectation),
        ...projectItems(analysis, expectation),
        ...plainItems(workspaceItems(analysis, others), expectation),
        ...plainItems(mtaClassItems(analysis), expectation),
        ...plainItems(superItems(analysis, offset), expectation),
        ...apiItems(analysis, offset, expectation, inHandler),
        ...plainItems(directives, expectation),
        ...plainItems(constructor, expectation),
        ...plainItems(keywordItems(expectation), expectation),
    ]);
}
