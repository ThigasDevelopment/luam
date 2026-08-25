import { typeToString } from '@compiler/checker/types';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';

const FIELD_PREFIX = 'field ';

const MEMBER_LIMIT = 24;

export function markdown(value: string): string {
    return ['```luam', value, '```'].join('\n');
}

export function declarationText(declaration: SymbolDeclaration): string {
    if (declaration.detail.length > 0) {
        return declaration.detail;
    }

    return declaration.type === null ? declaration.name : `${declaration.name}: ${typeToString(declaration.type)}`;
}

export function memberText(member: SymbolDeclaration): string {
    if (member.kind === 'field') {
        return member.detail.startsWith(FIELD_PREFIX) ? member.detail.slice(FIELD_PREFIX.length) : member.detail;
    }

    return member.detail;
}

export function bodyText(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
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
