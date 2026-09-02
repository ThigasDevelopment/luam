import { mtaMember, mtaStaticMember } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { typeToString } from '@compiler/checker/types';
import { isVisibleIn } from '@mta-types/api-declaration';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { isSideRestricted, sideNote } from '@lsp/features/side-surface';
import { isIdentifierChar } from '@lsp/support/source-text';

function markdown(value: string): string {
    return ['```luam', value, '```'].join('\n');
}

function instanceReceiver(analysis: DocumentAnalysis, name: string): string | null {
    for (const [expression] of analysis.types) {
        const owner =
            expression.kind === 'member-expression' && expression.property === name
                ? analysis.types.get(expression.object)
                : expression.kind === 'call-expression' && expression.method === name
                  ? analysis.types.get(expression.callee)
                  : undefined;

        if (owner?.kind === 'named' && isMtaElementName(analysis.declarations, owner.name)) {
            return owner.name;
        }
    }

    return null;
}

function staticReceiver(text: string, offset: number): string | null {
    let memberStart = offset;

    while (memberStart > 0 && isIdentifierChar(text[memberStart - 1])) {
        memberStart -= 1;
    }

    if (text[memberStart - 1] !== '.') {
        return null;
    }

    const ownerEnd = memberStart - 1;
    let ownerStart = ownerEnd;

    while (ownerStart > 0 && isIdentifierChar(text[ownerStart - 1])) {
        ownerStart -= 1;
    }

    return ownerStart === ownerEnd ? null : text.slice(ownerStart, ownerEnd);
}

export function mtaMemberHover(analysis: DocumentAnalysis, name: string, offset: number): Hover | null {
    if (!analysis.compilerOptions.oop) {
        return null;
    }

    const staticOwner = staticReceiver(analysis.text, offset);
    const staticMember = staticOwner === null ? null : mtaStaticMember(staticOwner, name);
    const owner = staticMember === null ? instanceReceiver(analysis, name) : staticOwner;
    const member = staticMember ?? (owner === null ? null : mtaMember(owner, name));

    if (owner === null || member === null || member.environment === undefined || !isVisibleIn(member.environment, analysis.environment)) {
        return null;
    }

    const signature = `${owner}.${name}: ${typeToString(member.type)}`;
    const note = `wraps \`${member.procedural ?? ''}\` (${member.environment})`;
    const side = isSideRestricted(member.environment, analysis.environment) ? [sideNote(member.environment)] : [];

    return { contents: { kind: 'markdown', value: [markdown(signature), note, ...side].join('\n\n') } };
}
