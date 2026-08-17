import { typeToString } from '@compiler/checker/types';
import { MarkupKind, type ParameterInformation, type SignatureHelp, type SignatureInformation } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { eventCallAt, handlerParameterLabels, handlerText, type EventCall } from '@lsp/features/event-signature';
import { resolveSignature, type SignatureSource } from '@lsp/features/signature-source';
import { calleeSegments, scanContext } from '@lsp/features/source-context';

function withCallback(source: SignatureSource, call: EventCall, callback: number): SignatureSource {
    const label = source.parameters[callback];

    if (label === undefined) {
        return source;
    }

    const name = label.split(':')[0] ?? 'handlerFunction';
    const parameters = [...source.parameters];
    const parameterDocs = [...source.parameterDocs];

    parameters[callback] = `${name}: function(${handlerParameterLabels(call.handler).join(', ')}): ${typeToString(call.handler.returnType)}`;
    parameterDocs[callback] = `Handles \`${handlerText(call.name, call.handler)}\`.`;

    return { ...source, parameters, parameterDocs };
}

function withPayload(source: SignatureSource, call: EventCall, payload: number): SignatureSource {
    const head = source.parameters.slice(0, payload);
    const labels = handlerParameterLabels(call.handler);

    return { ...source, parameters: [...head, ...labels], parameterDocs: source.parameterDocs.slice(0, payload) };
}

function specializeEvent(source: SignatureSource, call: EventCall | null): SignatureSource {
    if (call === null) {
        return source;
    }

    if (call.form.callbackArgument !== undefined) {
        return withCallback(source, call, call.form.callbackArgument);
    }

    return call.form.payloadArgument === undefined ? source : withPayload(source, call, call.form.payloadArgument);
}

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
    const resolved = resolveSignature(analysis, offset, segments, trigger);

    if (resolved === null) {
        return null;
    }

    const source = specializeEvent(resolved, eventCallAt(analysis, offset, context.frame));

    const active = source.parameters.length === 0 ? 0 : Math.min(context.frame.argument, source.parameters.length - 1);

    return { signatures: [signatureInformation(source)], activeSignature: 0, activeParameter: active };
}
