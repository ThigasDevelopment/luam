import { isTableLike, type Type } from '@compiler/checker/types';
import { findExtension, type ExtensionReceiver, type NativeExtension } from '@compiler/extensions/native-extensions';

function receiverKind(type: Type | null): ExtensionReceiver | null {
    if (type === null) {
        return null;
    }

    if (type.kind === 'string' || type.kind === 'string-literal' || type.kind === 'number') {
        return type.kind === 'string-literal' ? 'string' : type.kind;
    }

    return isTableLike(type) ? 'table' : null;
}

export function resolveExtension(type: Type | null, property: string): NativeExtension | null {
    const receiver = receiverKind(type);

    if (receiver === null) {
        return null;
    }

    return findExtension(receiver, property);
}

export function resolvePropertyExtension(type: Type | null, property: string): NativeExtension | null {
    const extension = resolveExtension(type, property);

    return extension !== null && extension.style === 'property' ? extension : null;
}

export function resolveCallExtension(type: Type | null, property: string): NativeExtension | null {
    const extension = resolveExtension(type, property);

    return extension !== null && extension.style === 'call' ? extension : null;
}
