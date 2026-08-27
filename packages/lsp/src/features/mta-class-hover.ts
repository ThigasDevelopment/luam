import { mtaConstructor, mtaMembersFor, mtaStaticMembersFor } from '@compiler/checker/oop-classes';
import { isAvailableIn, type ApiEnvironment } from '@mta-types/api-declaration';
import { findOopClassDocumentation } from '@mta-types/oop-documentation';
import { findOopClass, oopClassAncestors, oopClassEnvironment } from '@mta-types/oop-surface';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { markdown } from '@lsp/features/declaration-shape';
import { toWordRange } from '@lsp/support/lsp-position';
import { positionAt, wordAt, wordStart } from '@lsp/support/source-text';

const OOP_OFF = 'Only the type name works here: `compiler.oop` is off, so reading a member of this class is `check-oop-disabled`.';

function scopeLabel(environment: ApiEnvironment): string {
    return environment === 'shared' ? 'shared' : `${environment}-only`;
}

function countText(count: number, singular: string): string {
    return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function inheritanceText(name: string): string {
    const ancestors = oopClassAncestors(name);

    return ancestors.length === 0 ? '' : `**Inherits** — ${ancestors.map((ancestor) => `\`${ancestor}\``).join(' → ')}`;
}

function constructorText(name: string, environment: ApiEnvironment): string {
    const constructor = mtaConstructor(name);

    return constructor !== null && isAvailableIn(constructor.environment, environment) ? `callable as \`${name}(...)\`` : '';
}

function memberText(name: string, environment: ApiEnvironment, members: number): string {
    if (members === 0) {
        return '';
    }

    const own = findOopClass(name)?.members.filter((member) => isAvailableIn(member.environment, environment)).length ?? members;
    const inherited = members - own;

    return inherited === 0 ? countText(members, 'instance member') : `${countText(members, 'instance member')} (${inherited} inherited)`;
}

function surfaceText(analysis: DocumentAnalysis, name: string): string {
    const environment = analysis.environment;
    const statics = mtaStaticMembersFor(name, environment).length;
    const parts = [
        memberText(name, environment, mtaMembersFor(name, environment).length),
        statics === 0 ? '' : countText(statics, 'static method'),
        constructorText(name, environment),
    ].filter((part) => part.length > 0);

    return parts.length === 0 ? '' : `**Surface** — ${parts.join(' · ')}`;
}

function availabilityText(analysis: DocumentAnalysis, name: string, declared: ApiEnvironment): string {
    if (isAvailableIn(declared, analysis.environment)) {
        return '';
    }

    return `\`${name}\` is ${scopeLabel(declared)} and its members are not available in a \`${analysis.environment}\` file.`;
}

function isReceiverWord(text: string, offset: number): boolean {
    const before = text[wordStart(text, offset) - 1];

    return before === '.' || before === ':';
}

export function mtaClassHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const name = wordAt(analysis.text, offset);

    if (name === null || isReceiverWord(analysis.text, offset) || findOopClass(name) === null) {
        return null;
    }

    const environment = oopClassEnvironment(name) ?? 'shared';
    const parent = findOopClass(name)?.parent ?? null;
    const heading = markdown(parent === null ? `class ${name}` : `class ${name} extends ${parent}`);
    const reachable = isAvailableIn(environment, analysis.environment);
    const sections = [
        heading,
        findOopClassDocumentation(name) ?? '',
        inheritanceText(name),
        availabilityText(analysis, name, environment),
        reachable ? surfaceText(analysis, name) : '',
        analysis.compilerOptions.oop ? '' : OOP_OFF,
        `mta oop class (${environment})`,
    ].filter((section) => section.length > 0);

    return {
        contents: { kind: 'markdown', value: sections.join('\n\n') },
        range: toWordRange(positionAt(analysis.starts, wordStart(analysis.text, offset)), name),
    };
}
