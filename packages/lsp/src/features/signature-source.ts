import { mtaConstructor, mtaMember, mtaStaticMember } from '@compiler/checker/oop-classes';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { typeToString, type RecordType, type Type } from '@compiler/checker/types';
import { isAvailableIn } from '@mta-types/api-declaration';
import { findDeclaration } from '@mta-types/catalog';
import { apiDocumentation, memberDocumentation } from '@mta-types/documentation-lookup';
import { isLibrary, LIBRARY_MEMBERS } from '@mta-types/library-members';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { descriptorText, parameterLabels, typeDescriptorText } from '@lsp/features/api-text';
import { resolveReceiver } from '@lsp/features/completion-context';
import { documentationBody } from '@lsp/features/documentation-text';
import { matchesReferenceKind, type SymbolDeclaration } from '@lsp/symbols/symbol';

export interface SignatureSource {
    name: string;
    parameters: readonly string[];
    returnText: string;
    documentation: readonly string[];
    parameterDocs: readonly string[];
}

function typeParameters(type: Type, names: readonly string[] = []): { parameters: string[]; returnText: string } {
    if (type.kind !== 'function') {
        return { parameters: [], returnText: typeToString(type) };
    }

    const parameters = type.parameters.map((parameter, index) => {
        const optional = index >= type.minimumArguments ? '?' : '';
        const name = names[index] ?? `argument${index + 1}`;

        return `${name}${optional}: ${typeToString(parameter)}`;
    });

    if (type.isVariadic) {
        parameters.push('...');
    }

    return { parameters, returnText: typeToString(type.returnType) };
}

function fromApi(analysis: DocumentAnalysis, name: string): SignatureSource | null {
    const declaration = findDeclaration(name, analysis.environment);

    if (declaration === null || declaration.type.kind !== 'function') {
        return null;
    }

    const documentation = apiDocumentation(name);
    const named = documentation.parameters.filter((parameter) => !parameter.isVariadic);

    return {
        name,
        parameters: parameterLabels(declaration.type, documentation),
        returnText: typeDescriptorText(declaration.type.returnType),
        documentation: documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: named.map((parameter) => parameter.summary),
    };
}

function fromSymbol(declaration: SymbolDeclaration): SignatureSource | null {
    if (declaration.parameters.length === 0 && declaration.kind !== 'function' && declaration.kind !== 'method') {
        return null;
    }

    const returnText = declaration.detail.split('):').at(-1)?.trim() ?? 'any';

    return {
        name: declaration.name,
        parameters: declaration.parameters,
        returnText,
        documentation: [],
        parameterDocs: [],
    };
}

function fromLibrary(library: string, member: string): SignatureSource | null {
    if (!isLibrary(library)) {
        return null;
    }

    const descriptor = LIBRARY_MEMBERS[library][member];

    if (descriptor === undefined || descriptor.kind !== 'function') {
        return null;
    }

    const documentation = memberDocumentation(library, member);
    const named = documentation.parameters.filter((parameter) => !parameter.isVariadic);

    return {
        name: `${library}.${member}`,
        parameters: parameterLabels(descriptor, documentation),
        returnText: typeDescriptorText(descriptor.returnType),
        documentation: documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: named.map((parameter) => parameter.summary),
    };
}

function fromRecord(record: RecordType, member: string): SignatureSource | null {
    const type = record.members.get(member);

    if (type === undefined || type.kind !== 'function') {
        return null;
    }

    const documentation = memberDocumentation(record.name, member);
    const named = documentation.parameters.filter((parameter) => !parameter.isVariadic);
    const shape = typeParameters(type);
    const parameters = shape.parameters.map((label, index) => {
        const name = named[index]?.name;

        return name === undefined ? label : label.replace(/^argument\d+/, name);
    });

    return {
        name: `${record.name}.${member}`,
        parameters,
        returnText: shape.returnText,
        documentation: documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: named.map((parameter) => parameter.summary),
    };
}

function fromMtaMember(owner: string, member: string, isMethodCall: boolean): SignatureSource | null {
    const found = mtaMember(owner, member);

    if (found === null || found.type.kind !== 'function') {
        return null;
    }

    const procedural = found.procedural ?? null;
    const documentation = procedural === null ? null : apiDocumentation(procedural);
    const named = documentation?.parameters.filter((parameter) => !parameter.isVariadic) ?? [];
    const shifted = isMethodCall ? named.slice(1) : named;
    const fallback = typeParameters(found.type);
    const parameters = fallback.parameters.map((label, index) => {
        const name = shifted[index]?.name;

        return name === undefined ? label : label.replace(/^argument\d+/, name);
    });

    return {
        name: `${owner}.${member}`,
        parameters,
        returnText: fallback.returnText,
        documentation: documentation === null ? [] : documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: shifted.map((parameter) => parameter.summary),
    };
}

function fromMtaStaticMember(analysis: DocumentAnalysis, owner: string, member: string): SignatureSource | null {
    const found = mtaStaticMember(owner, member);

    if (found === null || found.type.kind !== 'function' || found.environment === undefined || !isAvailableIn(found.environment, analysis.environment)) {
        return null;
    }

    const documentation = found.procedural === undefined ? null : apiDocumentation(found.procedural);
    const named = documentation?.parameters.filter((parameter) => !parameter.isVariadic) ?? [];
    const shape = typeParameters(found.type);
    const parameters = shape.parameters.map((label, index) => {
        const name = named[index]?.name;

        return name === undefined ? label : label.replace(/^argument\d+/, name);
    });

    return {
        name: `${owner}.${member}`,
        parameters,
        returnText: shape.returnText,
        documentation: documentation === null ? [] : documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: named.map((parameter) => parameter.summary),
    };
}

function fromMtaConstructor(analysis: DocumentAnalysis, name: string): SignatureSource | null {
    const found = mtaConstructor(name);
    const constructor = found === null || !isAvailableIn(found.environment, analysis.environment) ? undefined : found.type;

    if (constructor === undefined) {
        return null;
    }

    const procedural = found?.procedural ?? null;

    if (procedural === null) {
        const shape = typeParameters(constructor);

        return { name, parameters: shape.parameters, returnText: shape.returnText, documentation: [], parameterDocs: [] };
    }

    const documentation = apiDocumentation(procedural);
    const named = documentation.parameters.filter((parameter) => !parameter.isVariadic);
    const shape = typeParameters(
        constructor,
        named.map((parameter) => parameter.name),
    );

    return {
        name,
        parameters: shape.parameters,
        returnText: shape.returnText,
        documentation: documentationBody({ ...documentation, parameters: [] }),
        parameterDocs: named.map((parameter) => parameter.summary),
    };
}

function localSignature(analysis: DocumentAnalysis, offset: number, name: string): SignatureSource | null {
    const scopeId = analysis.index.scopes.innermostAt(offset);
    const accept = (candidate: SymbolDeclaration): boolean => matchesReferenceKind(candidate, 'value');
    const declaration = analysis.index.scopes.resolve(scopeId, name, offset, accept);

    return declaration === null ? null : fromSymbol(declaration);
}

function memberSignature(analysis: DocumentAnalysis, offset: number, segments: readonly string[], isMethodCall: boolean): SignatureSource | null {
    const member = segments.at(-1) ?? '';
    const receiver = segments.slice(0, -1);
    const root = receiver[0];

    if (receiver.length === 1 && root !== undefined && isLibrary(root)) {
        return fromLibrary(root, member);
    }

    const target = resolveReceiver(analysis, offset, receiver);

    if (target === null) {
        return null;
    }

    if (target.kind === 'record') {
        return fromRecord(target.record, member);
    }

    if (target.kind === 'static-class') {
        return fromMtaStaticMember(analysis, target.name, member);
    }

    if (target.kind !== 'class') {
        return null;
    }

    if (analysis.compilerOptions.oop && isMtaElementName(analysis.declarations, target.name)) {
        return fromMtaMember(target.name, member, isMethodCall);
    }

    const found = analysis.declarations.lookupMember(target.name, member);

    if (found === null || found.type.kind !== 'function') {
        return null;
    }

    const shape = typeParameters(found.type);
    const declaration = analysis.index.membersOf(target.name).find((candidate) => candidate.name === member);
    const parameters = declaration?.parameters.length === shape.parameters.length ? declaration.parameters : shape.parameters;

    return { name: `${target.name}.${member}`, parameters, returnText: shape.returnText, documentation: [], parameterDocs: [] };
}

export function resolveSignature(
    analysis: DocumentAnalysis,
    offset: number,
    segments: readonly string[],
    trigger: '.' | ':' | null,
): SignatureSource | null {
    const first = segments[0];

    if (first === undefined) {
        return null;
    }

    if (segments.length === 1) {
        return localSignature(analysis, offset, first) ?? (analysis.compilerOptions.oop ? fromMtaConstructor(analysis, first) : null) ?? fromApi(analysis, first);
    }

    return memberSignature(analysis, offset, segments, trigger === ':');
}
