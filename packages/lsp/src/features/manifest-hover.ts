import { typeToString } from '@compiler/checker/types';
import { ENV_MEMBER_TYPE, findManifestField } from '@compiler/manifest/manifest-fields';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { fieldDocumentation } from '@lsp/features/manifest-items';
import { manifestScopeAt } from '@lsp/features/manifest-scope';
import { toWordRange } from '@lsp/support/lsp-position';
import { isIdentifierChar, positionAt, wordAt } from '@lsp/support/source-text';

const ENV_MEMBER = /env\.$/;

function markdown(signature: string, documentation: string): Hover['contents'] {
    return { kind: 'markdown', value: ['```luam', signature, '```', '', documentation].join('\n') };
}

function wordStart(text: string, offset: number): number {
    let start = offset;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    return start;
}

export function manifestHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const name = wordAt(analysis.text, offset);

    if (name === null) {
        return null;
    }

    const start = wordStart(analysis.text, offset);

    if (ENV_MEMBER.test(analysis.text.slice(0, start))) {
        return { contents: markdown(`env.${name}: ${typeToString(ENV_MEMBER_TYPE)}`, 'Read from the environment, so it may be missing.') };
    }

    const scope = manifestScopeAt(analysis.text, start);
    const field = findManifestField([...scope.path, name]);

    if (field === null) {
        return null;
    }

    const signature = `${[...scope.path, name].join('.')}: ${typeToString(field.type)}`;

    return { contents: markdown(signature, fieldDocumentation(field)), range: toWordRange(positionAt(analysis.starts, start), name) };
}
