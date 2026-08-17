import { KNOWN_DECORATORS } from '@compiler/checker/decorators';
import { typeToString } from '@compiler/checker/types';
import { canReference } from '@compiler/environment/environment';
import type { ClassDeclaration, ClassFieldDeclaration, Decorator } from '@compiler/parser/declaration-nodes';
import { findDeclaration } from '@mta-types/catalog';
import { memberDocumentation } from '@mta-types/documentation-lookup';
import { findLibraryMember, isLibrary, type LibraryName } from '@mta-types/library-members';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { descriptorShapeText, namedDescriptorText } from '@lsp/features/api-text';
import { contextualHover } from '@lsp/features/contextual-hover';
import { declarationDocumentation } from '@lsp/features/declaration-documentation';
import { eventHover } from '@lsp/features/event-hover';
import { apiMarkdown, memberMarkdown } from '@lsp/features/documentation-text';
import { manifestHover } from '@lsp/features/manifest-hover';
import { mtaMemberHover } from '@lsp/features/mta-hover';
import { declarationsIn } from '@lsp/features/symbol-lookup';
import { toWordRange } from '@lsp/support/lsp-position';
import { isIdentifierChar, wordAt } from '@lsp/support/source-text';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';
import { annotationText } from '@lsp/symbols/signature-text';

const FIELD_PREFIX = 'field ';

const MEMBER_LIMIT = 24;

function markdown(value: string): string {
    return ['```luam', value, '```'].join('\n');
}

function declarationText(declaration: SymbolDeclaration): string {
    if (declaration.detail.length > 0) {
        return declaration.detail;
    }

    return declaration.type === null ? declaration.name : `${declaration.name}: ${typeToString(declaration.type)}`;
}

function memberText(member: SymbolDeclaration): string {
    if (member.kind === 'field') {
        return member.detail.startsWith(FIELD_PREFIX) ? member.detail.slice(FIELD_PREFIX.length) : member.detail;
    }

    return member.detail;
}

function bodyText(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    if (declaration.kind !== 'class' && declaration.kind !== 'interface') {
        return '';
    }

    const members = analysis.index.membersOf(declaration.name);

    if (members.length === 0) {
        return ' {}';
    }

    const visible = members.slice(0, MEMBER_LIMIT);
    const shown = visible.flatMap((member, index) => {
        const previous = visible[index - 1];
        const separated = previous !== undefined && previous.kind === 'field' && member.kind !== 'field';

        return separated ? ['', `    ${memberText(member)}`] : [`    ${memberText(member)}`];
    });
    const hidden = members.length - visible.length;

    if (hidden > 0) {
        shown.push(`    # ${hidden} more`);
    }

    return ` {\n${shown.join('\n')}\n}`;
}

function summaryText(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    return `${declarationText(declaration)}${bodyText(analysis, declaration)}`;
}

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
    let start = offset;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    if (text[start - 1] !== '.') {
        return null;
    }

    let ownerStart = start - 1;

    while (ownerStart > 0 && isIdentifierChar(text[ownerStart - 1])) {
        ownerStart -= 1;
    }

    const owner = text.slice(ownerStart, start - 1);

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
        return mtaMemberHover(analysis, name, offset) ?? projectHover(analysis, name) ?? recordMemberHover(analysis, name);
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

function containsDecorator(decorator: Decorator, offset: number): boolean {
    return offset >= decorator.position.offset && offset <= decorator.position.offset + decorator.name.length + 1;
}

function decoratedField(statement: ClassDeclaration, offset: number): { decorator: Decorator; field: ClassFieldDeclaration } | null {
    for (const member of statement.members) {
        if (member.kind !== 'class-field') {
            continue;
        }

        const decorator = member.decorators.find((candidate) => containsDecorator(candidate, offset));

        if (decorator !== undefined) {
            return { decorator, field: member };
        }
    }

    return null;
}

function decoratorHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    for (const statement of analysis.program.body) {
        if (statement.kind !== 'class-declaration') {
            continue;
        }

        const classDecorator = statement.decorators.find((decorator) => containsDecorator(decorator, offset));

        if (classDecorator !== undefined) {
            const definition = KNOWN_DECORATORS.get(classDecorator.name);

            return definition === undefined ? null : { contents: { kind: 'markdown', value: definition.documentation } };
        }

        const target = decoratedField(statement, offset);

        if (target === null) {
            continue;
        }

        const generated = (analysis.generatedMembers.get(statement) ?? []).find((member) => {
            const expectedParameters = target.decorator.name === 'Getter' ? 0 : 1;

            return member.position.offset === target.field.position.offset && member.parameters.length === expectedParameters;
        });

        if (generated === undefined) {
            return null;
        }

        const registered = analysis.declarations.lookupMember(statement.name, generated.name);
        const inferred = registered?.type.kind === 'function' ? registered.type.returnType : { kind: 'any' as const };
        const returnType = generated.returnAnnotation === null ? typeToString(inferred) : annotationText(generated.returnAnnotation);
        const parameters = generated.parameters.map((parameter) => `${parameter.name}: ${annotationText(parameter.annotation)}`).join(', ');
        const signature = `${generated.name}(${parameters}): ${returnType}`;
        const position = { ...target.decorator.position, column: target.decorator.position.column + 1, offset: target.decorator.position.offset + 1 };

        return { contents: { kind: 'markdown', value: `Generates \`${signature}\`.` }, range: toWordRange(position, target.decorator.name) };
    }

    return null;
}

export function hoverAt(analysis: DocumentAnalysis, offset: number, others: readonly DocumentAnalysis[] = []): Hover | null {
    if (analysis.manifest !== null) {
        return manifestHover(analysis, offset);
    }

    const contextual = contextualHover(analysis.text, offset);

    if (contextual !== null) {
        return contextual;
    }

    const event = eventHover(analysis, others, offset);

    if (event !== null) {
        return event;
    }

    const decorator = decoratorHover(analysis, offset);

    if (decorator !== null) {
        return decorator;
    }

    const declaration = analysis.index.declarationFor(offset);

    if (declaration === null) {
        return workspaceHover(analysis, others, offset) ?? apiHover(analysis, offset);
    }

    const anchor = analysis.index.findReferenceAt(offset) ?? declaration;

    return {
        contents: { kind: 'markdown', value: `${declarationMarkdown(analysis, declaration)}${exportNote(analysis, declaration)}` },
        range: toWordRange(anchor.position, anchor.name),
    };
}
