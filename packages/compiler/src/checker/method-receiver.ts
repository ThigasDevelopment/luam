import { createFunction, type FunctionType, type Type } from './types';

const SELF_PARAMETER = 'self';

export function resolveNonNominalMethod(receiver: Type, method: string): FunctionType | null {
    if (receiver.kind !== 'record') {
        return null;
    }

    const member = receiver.members.get(method);

    return member !== undefined && member.kind === 'function' ? member : null;
}

export function withoutSelfParameter(signature: FunctionType): FunctionType {
    const names = signature.parameterNames;

    if (names === undefined || names[0] !== SELF_PARAMETER) {
        return signature;
    }

    const minimum = Math.max(0, signature.minimumArguments - 1);

    return createFunction(signature.parameters.slice(1), signature.returnType, minimum, signature.isVariadic, names.slice(1), signature.variadicType);
}
