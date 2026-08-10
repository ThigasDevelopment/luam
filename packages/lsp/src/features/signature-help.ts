import { MarkupKind, type ParameterInformation, type SignatureHelp, type SignatureInformation } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { resolveSignature, type SignatureSource } from '@lsp/features/signature-source';
import { calleeSegments, scanContext } from '@lsp/features/source-context';

function parameterInformation(source: SignatureSource, start: number): ParameterInformation[] {
    const parameters: ParameterInformation[] = [];

    let cursor = start;

    source.parameters.forEach((label, index) => {
        const from = cursor;
        const to = from + label.length;
        const summary = source.parameterDocs[index] ?? '';

        cursor = to + 2;

        if (summary.length === 0) {
            parameters.push({ label: [from, to] });

            return;
        }

        parameters.push({ label: [from, to], documentation: { kind: MarkupKind.Markdown, value: summary } });
    });

    return parameters;
}

function signatureInformation(source: SignatureSource): SignatureInformation {
    const prefix = `${source.name}(`;
    const label = `${prefix}${source.parameters.join(', ')}): ${source.returnText}`;
    const information: SignatureInformation = { label, parameters: parameterInformation(source, prefix.length) };

    if (source.documentation.length === 0) {
        return information;
    }

    return { ...information, documentation: { kind: MarkupKind.Markdown, value: source.documentation.join('\n\n') } };
}

export function signatureHelpAt(analysis: DocumentAnalysis, offset: number): SignatureHelp | null {
    const context = scanContext(analysis.text, offset);

    if (context.inComment || context.frame === null || !context.frame.isCall) {
        return null;
    }

    const { segments, trigger } = calleeSegments(analysis.text, context.frame.open);
    const source = resolveSignature(analysis, offset, segments, trigger);

    if (source === null) {
        return null;
    }

    const active = source.parameters.length === 0 ? 0 : Math.min(context.frame.argument, source.parameters.length - 1);

    return { signatures: [signatureInformation(source)], activeSignature: 0, activeParameter: active };
}
