import { typeToString } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import { findDeclaration } from '@mta-types/catalog';
import { memberDocumentation } from '@mta-types/documentation-lookup';
import { findLibraryMember, isLibrary, type LibraryName } from '@mta-types/library-members';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { descriptorShapeText, namedDescriptorText } from '@lsp/features/api-text';
import { contextualHover } from '@lsp/features/contextual-hover';
import { declarationDocumentation } from '@lsp/features/declaration-documentation';
import { markdown, summaryText } from '@lsp/features/declaration-shape';
import { decoratorHover } from '@lsp/features/decorator-hover';
import { eventHover } from '@lsp/features/event-hover';
import { keywordHover } from '@lsp/features/keyword-hover';
import { apiMarkdown, memberMarkdown } from '@lsp/features/documentation-text';
import { manifestHover } from '@lsp/features/manifest-hover';
import { mtaClassHover } from '@lsp/features/mta-class-hover';
import { mtaMemberHover } from '@lsp/features/mta-hover';
import { declarationsIn } from '@lsp/features/symbol-lookup';
import { toWordRange } from '@lsp/support/lsp-position';
import { wordAt, wordStart } from '@lsp/support/source-text';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';

function declarationMarkdown(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    const signature = markdown(summaryText(analysis, declaration));
    const documentation = declarationDocumentation(analysis.text, declaration);

    return documentation.length === 0 ? signature : `${signature}\n\n${documentation}`;
}

function originNote(analysis: DocumentAnalysis): string {
    return `declared in ${analysis.relative} (${analysis.environment})`;
}

function projectHover(analysis: DocumentAnalysis, name: string): Hover | null {
    const target = analysis.project.globals.find((global) => global.name === name);

    if (target === undefined) {
        return null;
    }

    const origin = target.type.kind === 'record' && target.type.origin !== null ? `"${target.type.origin}"` : 'the project';
    const scope = `declared in ${origin} (${target.environment})`;

    return { contents: { kind: 'markdown', value: `${markdown(descriptorShapeText(name, target.type, analysis.env))}\n\n${scope}` } };
}

function recordMemberHover(analysis: DocumentAnalysis, name: string): Hover | null {
    for (const [expression, type] of analysis.types) {
        if (expression.kind !== 'member-expression' || expression.property !== name) {
            continue;
        }

        const owner = analysis.types.get(expression.object);

        if (owner !== undefined && owner.kind === 'record') {
            const signature = `${owner.name}.${name}: ${typeToString(type)}`;
            const value = memberMarkdown(owner.name, name, signature, '') ?? markdown(signature);

            return { contents: { kind: 'markdown', value } };
        }
    }

    return null;
}

function workspaceHover(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], offset: number): Hover | null {
    const reference = analysis.index.findReferenceAt(offset);

    if (reference === null) {
        return null;
    }

    for (const other of others) {
        const [declaration] = canReference(analysis.environment, other.environment) ? declarationsIn(other, reference.name) : [];

        if (declaration === undefined) {
            continue;
        }

        return {
            contents: { kind: 'markdown', value: `${declarationMarkdown(other, declaration)}\n\n${originNote(other)}` },
            range: toWordRange(reference.position, reference.name),
        };
    }

    return null;
}

function libraryReceiver(text: string, offset: number): LibraryName | null {
    const start = wordStart(text, offset);

    if (text[start - 1] !== '.') {
        return null;
    }

    const owner = text.slice(wordStart(text, start - 1), start - 1);

    return isLibrary(owner) ? owner : null;
}

function libraryMemberHover(analysis: DocumentAnalysis, name: string, offset: number): Hover | null {
    const library = libraryReceiver(analysis.text, offset);

    if (library === null) {
        return null;
    }

    const descriptor = findLibraryMember(library, name);

    if (descriptor === null) {
        return null;
    }

    const signature = namedDescriptorText(`${library}.${name}`, descriptor, memberDocumentation(library, name));
    const value = memberMarkdown(library, name, signature, 'lua api (shared)') ?? markdown(signature);

    return { contents: { kind: 'markdown', value } };
}

function apiHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const name = wordAt(analysis.text, offset);

    if (name === null) {
        return null;
    }

    const library = libraryMemberHover(analysis, name, offset);

    if (library !== null) {
        return library;
    }

    const declaration = findDeclaration(name, analysis.environment);

    if (declaration === null) {
        return mtaMemberHover(analysis, name, offset) ?? mtaClassHover(analysis, offset) ?? projectHover(analysis, name) ?? recordMemberHover(analysis, name);
    }

    return { contents: { kind: 'markdown', value: apiMarkdown(declaration) } };
}

function exportNote(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    if (declaration.kind !== 'function' || !analysis.directives.exports.some((entry) => entry.name === declaration.name)) {
        return '';
    }

    const sides = analysis.environment === 'shared' ? 'server and client' : analysis.environment;

    return `\n\nexported to other resources (${sides})`;
}

export function hoverAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[] = []): Hover | null {
    if (analysis.manifest !== null) {
        return manifestHover(analysis, offset);
    }

    const decorator = decoratorHover(analysis, offset);

    if (decorator !== null) {
        return decorator;
    }

    const contextual = contextualHover(analysis, offset);

    if (contextual !== null) {
        return contextual;
    }

    const event = eventHover(analysis, others, offset);

    if (event !== null) {
        return event;
    }

    const declaration = analysis.index.declarationFor(offset);

    if (declaration === null) {
        return workspaceHover(analysis, others, offset) ?? apiHover(analysis, offset) ?? keywordHover(analysis, offset);
    }

    const anchor = analysis.index.findReferenceAt(offset) ?? declaration;

    return {
        contents: { kind: 'markdown', value: `${declarationMarkdown(analysis, declaration)}${exportNote(analysis, declaration)}` },
        range: toWordRange(anchor.position, anchor.name),
    };
}
