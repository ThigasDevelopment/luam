export interface AccessorNames {
    getter: string;
    setter: string;
}

function capitalize(name: string): string {
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

export function accessorNames(fieldName: string, isBoolean: boolean): AccessorNames {
    const booleanPrefix = isBoolean && /^is[A-Z]/.test(fieldName);
    const base = capitalize(booleanPrefix ? fieldName.slice(2) : fieldName);

    return {
        getter: booleanPrefix ? fieldName : `${isBoolean ? 'is' : 'get'}${capitalize(fieldName)}`,
        setter: `set${base}`,
    };
}
