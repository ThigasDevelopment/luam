import { canReference } from '@compiler/environment/environment';
import { findDeclaration } from '@mta-types/catalog';
import { memberDocumentation } from '@mta-types/documentation-lookup';
import { findLibraryMember, isLibrary, type LibraryName } from '@mta-types/library-members';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { descriptorShapeText, namedDescriptorText } from '@lsp/features/api-text';
import { contextualHover } from '@lsp/features/contextual-hover';
import { declarationDocumentation } from '@lsp/features/declaration-documentation';
import { markdown, summaryText, typeShape } from '@lsp/features/declaration-shape';
import { decoratorHover } from '@lsp/features/decorator-hover';
import { eventHover } from '@lsp/features/event-hover';
import { keywordHover } from '@lsp/features/keyword-hover';
import { apiMarkdown, memberMarkdown } from '@lsp/features/documentation-text';
import { manifestHover } from '@lsp/features/manifest-hover';
import { memberAccessAt, memberHover, methodHover } from '@lsp/features/member-hover';
import { mtaClassHover } from '@lsp/features/mta-class-hover';
import { mtaMemberHover } from '@lsp/features/mta-hover';
import { isSideRestricted, sideNote } from '@lsp/features/side-surface';
import { declarationsIn } from '@lsp/features/symbol-lookup';
import { toWordRange } from '@lsp/support/lsp-position';
import { wordAt, wordStart } from '@lsp/support/source-text';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';

const VALUE_KINDS: ReadonlySet<string> = new Set(['local', 'parameter', 'field', 'global']);

function shapeSection(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    if (!VALUE_KINDS.has(declaration.kind) || declaration.type === null) {
        return '';
    }

    const shape = typeShape(analysis, declaration.type);

    return shape === null ? '' : `\n\n**Instance**\n\n${markdown(shape)}`;
}

function declarationMarkdown(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    const signature = `${markdown(summaryText(analysis, declaration))}${shapeSection(analysis, declaration)}`;
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
    const side = isSideRestricted(target.environment, analysis.environment) ? [sideNote(target.environment)] : [];
    const sections = [markdown(descriptorShapeText(name, target.type, analysis.env)), scope, ...side];

    return { contents: { kind: 'markdown', value: sections.join('\n\n') } };
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

function apiHover(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): Hover | null {
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
        return mtaMemberHover(analysis, name, offset) ?? mtaClassHover(analysis, offset) ?? projectHover(analysis, name) ?? memberHover(analysis, offset, others);
    }

    if (!isSideRestricted(declaration.environment, analysis.environment)) {
        return { contents: { kind: 'markdown', value: apiMarkdown(declaration) } };
    }

    return { contents: { kind: 'markdown', value: `${apiMarkdown(declaration)}\n\n${sideNote(declaration.environment)}` } };
}

function resolvedMember(analysis: DocumentAnalysis, offset: number): SymbolDeclaration | null {
    const reference = analysis.index.findReferenceAt(offset);

    return reference === null || reference.kind !== 'member' ? null : analysis.index.resolve(reference);
}

function propertyHover(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[]): Hover | null {
    if (memberAccessAt(analysis, offset) === null || resolvedMember(analysis, offset) !== null) {
        return null;
    }

    const name = wordAt(analysis.text, offset);
    const library = name === null ? null : libraryMemberHover(analysis, name, offset);
    const mta = name === null ? null : mtaMemberHover(analysis, name, offset);

    return library ?? mta ?? memberHover(analysis, offset, others);
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

    const property = propertyHover(analysis, offset, others);

    if (property !== null) {
        return property;
    }

    const declaration = analysis.index.declarationFor(offset);

    if (declaration === null) {
        return methodHover(analysis, offset, others) ?? workspaceHover(analysis, others, offset) ?? apiHover(analysis, offset, others) ?? keywordHover(analysis, offset);
    }

    const anchor = analysis.index.findReferenceAt(offset) ?? declaration;

    return {
        contents: { kind: 'markdown', value: `${declarationMarkdown(analysis, declaration)}${exportNote(analysis, declaration)}` },
        range: toWordRange(anchor.position, anchor.name),
    };
}
