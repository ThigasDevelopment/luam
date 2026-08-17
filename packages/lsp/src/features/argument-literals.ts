export function stringLiteralValue(argument: string): string | null {
    const match = /^(['"])([^'"\\]*)\1$/.exec(argument);

    return match?.[2] ?? null;
}

export function argumentKind(argument: string): 'boolean' | 'number' | 'string' | null {
    if (argument === 'true' || argument === 'false') {
        return 'boolean';
    }

    if (/^-?\d+(\.\d+)?$/.test(argument)) {
        return 'number';
    }

    return stringLiteralValue(argument) === null ? null : 'string';
}
