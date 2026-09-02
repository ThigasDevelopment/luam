import { typeToString, type Type } from '@compiler/checker/types';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { shapeMembers } from '@lsp/features/type-shape';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';

const FIELD_PREFIX = 'field ';

const MEMBER_LIMIT = 24;

const SHAPED_KINDS: ReadonlySet<string> = new Set(['class', 'interface', 'enum']);

export function markdown(value: string): string {
    return ['```luam', value, '```'].join('\n');
}

export function declarationText(declaration: SymbolDeclaration): string {
    if (declaration.detail.length > 0) {
        return declaration.detail;
    }

    return declaration.type === null ? declaration.name : `${declaration.name}: ${typeToString(declaration.type)}`;
}

function withoutPrefix(detail: string, prefix: string): string {
    return detail.startsWith(prefix) ? detail.slice(prefix.length) : detail;
}

export function memberText(member: SymbolDeclaration): string {
    if (member.kind === 'field') {
        return withoutPrefix(member.shape ?? member.detail, FIELD_PREFIX);
    }

    if (member.kind === 'enum-member' && member.container !== null) {
        return withoutPrefix(member.detail, `${member.container}.`);
    }

    return member.detail;
}

export function bodyText(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    if (!SHAPED_KINDS.has(declaration.kind)) {
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

export function summaryText(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    return `${declarationText(declaration)}${bodyText(analysis, declaration)}`;
}

function isContainer(declaration: SymbolDeclaration, name: string): boolean {
    return declaration.name === name && (declaration.kind === 'class' || declaration.kind === 'interface');
}

export function containerShape(analysis: DocumentAnalysis, name: string): string | null {
    const found = analysis.index.declarations.find((declaration) => isContainer(declaration, name));

    return found === undefined ? null : summaryText(analysis, found);
}

function fieldLine(name: string, type: Type): string {
    return type.kind === 'optional' ? `${name}?: ${typeToString(type.element)}` : `${name}: ${typeToString(type)}`;
}

function shapeBody(name: string, members: ReadonlyMap<string, Type>): string {
    const entries = [...members];
    const visible = entries.slice(0, MEMBER_LIMIT);
    const shown = visible.map(([field, type]) => `    ${fieldLine(field, type)}`);
    const hidden = entries.length - visible.length;

    if (hidden > 0) {
        shown.push(`    # ${hidden} more`);
    }

    const header = name.startsWith('{') ? '' : `${name} `;

    return `${header}{\n${shown.join('\n')}\n}`;
}

export function declaredShape(analysis: DocumentAnalysis, type: Type): string | null {
    const resolved = type.kind === 'optional' ? type.element : type;

    return resolved.kind === 'named' ? containerShape(analysis, resolved.name) : null;
}

export function inferredShape(analysis: DocumentAnalysis, type: Type): string | null {
    const resolved = type.kind === 'optional' ? type.element : type;
    const members = shapeMembers(analysis, resolved);

    return members === null || members.size === 0 ? null : shapeBody(typeToString(resolved), members);
}

export function typeShape(analysis: DocumentAnalysis, type: Type): string | null {
    return declaredShape(analysis, type) ?? inferredShape(analysis, type);
}
