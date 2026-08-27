import { canReference } from '@compiler/environment/environment';
import { scan } from '@compiler/lexer/lexer';
import type { CallExpression, Expression } from '@compiler/parser/ast';
import { TokenStream } from '@compiler/parser/token-stream';
import { parseTypeAnnotation } from '@compiler/parser/type-annotation';
import { knowsResource, lookupAbiExport, type AbiExport } from '@compiler/project/export-abi';

import type { CheckContext } from './context';
import { checkSignature, checkValueList } from './expressions';
import { ANY_TYPE, createFunction, type FunctionType, type Type } from './types';

const RESOURCE_LOOKUP = 'getResourceFromName';

const EXPORTS_TABLE = 'exports';

const CALL_FUNCTION = 'call';

function literalString(expression: Expression | undefined): string | null {
    return expression?.kind === 'string-literal' ? expression.value : null;
}

function resourceOfLookup(expression: Expression | undefined): string | null {
    if (expression?.kind !== 'call-expression' || expression.callee.kind !== 'identifier' || expression.callee.name !== RESOURCE_LOOKUP) {
        return null;
    }

    return literalString(expression.args[0]);
}

function resourceOfExports(expression: Expression): string | null {
    if (expression.kind === 'member-expression' && expression.object.kind === 'identifier' && expression.object.name === EXPORTS_TABLE) {
        return expression.property;
    }

    if (expression.kind !== 'index-expression' || expression.object.kind !== 'identifier' || expression.object.name !== EXPORTS_TABLE) {
        return null;
    }

    return literalString(expression.index);
}

export function abiType(context: CheckContext, text: string): Type {
    const scanned = scan(text);

    if (scanned.diagnostics.length > 0) {
        return ANY_TYPE;
    }

    try {
        return context.resolveAnnotation(parseTypeAnnotation(new TokenStream(scanned.tokens)));
    } catch {
        return ANY_TYPE;
    }
}

function signatureOf(context: CheckContext, entry: AbiExport): FunctionType {
    const parameters = entry.parameters.map((parameter) => abiType(context, parameter.type));
    const names = entry.parameters.map((parameter) => parameter.name);
    const minimum = Math.min(Math.max(entry.minimumArguments, 0), parameters.length);

    return createFunction(parameters, abiType(context, entry.returns), minimum, entry.variadic, names);
}

function checkSide(context: CheckContext, entry: AbiExport, resource: string, expression: CallExpression): void {
    if (canReference(context.environment, entry.side)) {
        return;
    }

    const message = `Export "${entry.name}" of resource "${resource}" is ${entry.side}-only and cannot be called from a "${context.environment}" file.`;

    context.report('check-resource-export-side', message, expression.position);
}

function checkKnownExport(context: CheckContext, resource: string, name: string, args: readonly Expression[], expression: CallExpression): Type {
    const entry = lookupAbiExport(context.contracts, resource, name);

    if (entry === null) {
        const known = context.contracts
            .find((contract) => contract.resource === resource)
            ?.exports.map((declared) => `"${declared.name}"`)
            .join(', ');
        const hint = known === undefined || known.length === 0 ? ' It exports nothing.' : ` It exports ${known}.`;

        checkValueList(context, args);
        context.report('check-unknown-resource-export', `Resource "${resource}" has no export "${name}".${hint}`, expression.position);

        return ANY_TYPE;
    }

    checkSide(context, entry, resource, expression);

    return checkSignature(context, args, signatureOf(context, entry), expression.position);
}

export function checkResourceCall(context: CheckContext, expression: CallExpression): Type | null {
    if (context.contracts.length === 0) {
        return null;
    }

    if (expression.method !== null) {
        const resource = resourceOfExports(expression.callee);

        if (resource === null || !knowsResource(context.contracts, resource)) {
            return null;
        }

        return checkKnownExport(context, resource, expression.method, expression.args, expression);
    }

    if (expression.callee.kind !== 'identifier' || expression.callee.name !== CALL_FUNCTION) {
        return null;
    }

    const resource = resourceOfLookup(expression.args[0]);
    const name = literalString(expression.args[1]);

    if (resource === null || name === null || !knowsResource(context.contracts, resource)) {
        return null;
    }

    checkValueList(context, expression.args.slice(0, 2));

    return checkKnownExport(context, resource, name, expression.args.slice(2), expression);
}
