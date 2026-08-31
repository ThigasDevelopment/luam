import { widenInferred, type Type } from '@compiler/checker/types';
import type { CallExpression, Expression, FunctionExpression, LocalStatement, TypeAnnotation } from '@compiler/parser/ast';
import { findDeclaration } from '@mta-types/catalog';
import { apiDocumentation } from '@mta-types/documentation-lookup';
import { InlayHintKind, type InlayHint } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import type { InlayHintSettings } from '@lsp/features/inlay-hint-settings';
import { parameterListEnd, typeLabel, type ParenIndex } from '@lsp/features/inlay-hint-text';
import { toLspPosition } from '@lsp/support/lsp-position';
import { positionAt } from '@lsp/support/source-text';

const LITERAL_KINDS: ReadonlySet<string> = new Set(['nil-literal', 'boolean-literal', 'number-literal', 'string-literal']);

export interface HintState {
    analysis: DocumentAnalysis;
    settings: InlayHintSettings;
    parens: ParenIndex;
    from: number;
    to: number;
    hints: InlayHint[];
}

export function typeOf(state: HintState, expression: Expression): Type | null {
    return state.analysis.types.get(expression) ?? null;
}

function push(state: HintState, offset: number, hint: Omit<InlayHint, 'position'>): void {
    if (offset < state.from || offset > state.to) {
        return;
    }

    state.hints.push({ position: toLspPosition(positionAt(state.analysis.starts, offset)), ...hint });
}

function typeHint(state: HintState, offset: number, type: Type | null | undefined): void {
    const label = typeLabel(type);

    if (label !== null) {
        push(state, offset, { label: `: ${label}`, kind: InlayHintKind.Type });
    }
}

export function localHints(state: HintState, statement: LocalStatement): void {
    if (!state.settings.localTypes) {
        return;
    }

    statement.declarations.forEach((declarator, index) => {
        const value = statement.values[index];

        if (declarator.annotation !== null || value === undefined || declarator.name.length === 0) {
            return;
        }

        const inferred = typeOf(state, value);

        typeHint(state, declarator.position.offset + declarator.name.length, inferred === null ? null : widenInferred(inferred));
    });
}

export function returnHint(state: HintState, from: number, annotation: TypeAnnotation | null, signature: Type | null): void {
    if (!state.settings.returnTypes || annotation !== null || signature === null || signature.kind !== 'function') {
        return;
    }

    const end = parameterListEnd(state.parens, from);

    if (end !== null) {
        typeHint(state, end, signature.returnType);
    }
}

export function callbackParameterHints(state: HintState, expression: FunctionExpression, signature: Type | null): void {
    if (!state.settings.callbackParameterTypes || signature === null || signature.kind !== 'function') {
        return;
    }

    let index = 0;

    for (const parameter of expression.parameters) {
        if (parameter.isVararg) {
            continue;
        }

        if (parameter.annotation === null && parameter.name.length > 0) {
            typeHint(state, parameter.position.offset + parameter.name.length, signature.parameters[index]);
        }

        index += 1;
    }
}

function apiParameterNames(state: HintState, callee: Expression): readonly (string | null)[] | null {
    if (callee.kind !== 'identifier') {
        return null;
    }

    const declared = findDeclaration(callee.name, state.analysis.environment);

    if (declared === null || declared.type.kind !== 'function') {
        return null;
    }

    const documented = apiDocumentation(callee.name).parameters.filter((parameter) => !parameter.isVariadic);

    return documented.length === 0 ? null : documented.map((parameter) => parameter.name);
}

function calleeParameterNames(state: HintState, expression: CallExpression): readonly (string | null)[] | null {
    const type = typeOf(state, expression.callee);
    const named = type !== null && type.kind === 'function' ? (type.parameterNames ?? null) : null;

    return named ?? apiParameterNames(state, expression.callee);
}

export function parameterNameHints(state: HintState, expression: CallExpression): void {
    if (!state.settings.parameterNames || expression.method !== null) {
        return;
    }

    const names = calleeParameterNames(state, expression);

    if (names === null) {
        return;
    }

    expression.args.forEach((argument, index) => {
        const name = names[index];

        if (name === null || name === undefined || name.length === 0 || !LITERAL_KINDS.has(argument.kind)) {
            return;
        }

        push(state, argument.position.offset, { label: `${name}:`, kind: InlayHintKind.Parameter, paddingRight: true });
    });
}
