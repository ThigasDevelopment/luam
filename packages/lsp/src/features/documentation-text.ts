import type { ApiDeclaration } from '@mta-types/api-declaration';
import { hasDocumentation, type ApiDocumentation, type ParameterDocumentation } from '@mta-types/api-documentation';
import { apiDocumentation, memberDocumentation } from '@mta-types/documentation-lookup';

import { namedDescriptorText } from '@lsp/features/api-text';

const SUMMARY_LIMIT = 140;

export function documentationFor(name: string): ApiDocumentation {
    return apiDocumentation(name);
}

export function parameterList(documentation: { parameters: readonly ParameterDocumentation[] }): string[] {
    return documentation.parameters
        .filter((parameter) => parameter.summary.length > 0)
        .map((parameter) => `- \`${parameter.name}\` — ${parameter.summary}`);
}

export function documentationBody(documentation: ApiDocumentation): string[] {
    const sections: string[] = [];

    if (documentation.summary.length > 0) {
        sections.push(documentation.summary);
    }

    const parameters = parameterList(documentation);

    if (parameters.length > 0) {
        sections.push(['**Parameters**', '', ...parameters].join('\n'));
    }

    if (documentation.returns.length > 0) {
        sections.push(`**Returns** — ${documentation.returns}`);
    }

    return sections;
}

export function apiFooter(declaration: ApiDeclaration, documentation: ApiDocumentation): string {
    const scope = `${declaration.source} api (${declaration.environment})`;

    return documentation.wiki.length === 0 ? scope : `${scope} · [wiki](${documentation.wiki})`;
}

export function apiMarkdown(declaration: ApiDeclaration): string {
    const documentation = documentationFor(declaration.name);
    const signature = ['```luam', namedDescriptorText(declaration.name, declaration.type, documentation), '```'].join('\n');

    return [signature, ...documentationBody(documentation), apiFooter(declaration, documentation)].join('\n\n');
}

export function memberMarkdown(owner: string, member: string, signature: string, note: string): string | null {
    const documentation = memberDocumentation(owner, member);
    const body = documentationBody(documentation);
    const footer = documentation.wiki.length === 0 ? note : `${note} · [wiki](${documentation.wiki})`;
    const sections = [['```luam', signature, '```'].join('\n'), ...body];

    if (footer.length > 0) {
        sections.push(footer);
    }

    return sections.length === 1 && body.length === 0 && footer.length === 0 ? null : sections.join('\n\n');
}

export function shortSummary(documentation: ApiDocumentation): string {
    if (!hasDocumentation(documentation) || documentation.summary.length === 0) {
        return '';
    }

    const firstLine = documentation.summary.split('\n')[0] ?? '';

    return firstLine.length > SUMMARY_LIMIT ? `${firstLine.slice(0, SUMMARY_LIMIT).trimEnd()}…` : firstLine;
}
