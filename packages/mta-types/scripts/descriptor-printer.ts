import type { TypeDescriptor } from '#mta-types/type-descriptor';

import { quote } from './documentation-text.ts';

const PRIMITIVES: Readonly<Record<string, string>> = {
    any: 'ANY',
    boolean: 'BOOLEAN',
    nil: 'NIL',
    number: 'NUMBER',
    string: 'STRING',
    table: 'TABLE',
    thread: 'THREAD',
    userdata: 'USERDATA',
    void: 'VOID',
};

export function printDescriptor(descriptor: TypeDescriptor): string {
    if (descriptor.kind === 'array') {
        return `arrayOf(${printDescriptor(descriptor.element)})`;
    }

    if (descriptor.kind === 'optional') {
        return `optionalOf(${printDescriptor(descriptor.element)})`;
    }

    if (descriptor.kind === 'union') {
        return `unionOf([${descriptor.options.map(printDescriptor).join(', ')}])`;
    }

    if (descriptor.kind === 'named') {
        return `named('${descriptor.name}')`;
    }

    if (descriptor.kind === 'literal') {
        return `literal(${quote(descriptor.value)})`;
    }

    if (descriptor.kind === 'tuple') {
        return `tupleOf([${descriptor.elements.map(printDescriptor).join(', ')}])`;
    }

    if (descriptor.kind === 'function') {
        const parameters = `[${descriptor.parameters.map(printDescriptor).join(', ')}]`;
        const head = `fn(${parameters}, ${printDescriptor(descriptor.returnType)}, ${descriptor.minimumArguments}`;
        const names = descriptor.parameterNames === undefined ? 'undefined' : `[${descriptor.parameterNames.map((name) => `'${name}'`).join(', ')}]`;

        if (descriptor.variadicType !== undefined) {
            return `${head}, ${descriptor.isVariadic}, ${names}, ${printDescriptor(descriptor.variadicType)})`;
        }

        return descriptor.isVariadic || descriptor.parameterNames !== undefined ? `${head}, ${descriptor.isVariadic}, ${names})` : `${head})`;
    }

    return PRIMITIVES[descriptor.kind] ?? 'ANY';
}

export function collectHelpers(descriptor: TypeDescriptor, helpers: Set<string>): void {
    if (descriptor.kind === 'array') {
        helpers.add('arrayOf');
        collectHelpers(descriptor.element, helpers);

        return;
    }

    if (descriptor.kind === 'optional') {
        helpers.add('optionalOf');
        collectHelpers(descriptor.element, helpers);

        return;
    }

    if (descriptor.kind === 'union') {
        helpers.add('unionOf');
        descriptor.options.forEach((option) => collectHelpers(option, helpers));

        return;
    }

    if (descriptor.kind === 'named') {
        helpers.add('named');

        return;
    }

    if (descriptor.kind === 'literal') {
        helpers.add('literal');

        return;
    }

    if (descriptor.kind === 'tuple') {
        helpers.add('tupleOf');
        descriptor.elements.forEach((element) => collectHelpers(element, helpers));

        return;
    }

    if (descriptor.kind === 'function') {
        helpers.add('fn');
        descriptor.parameters.forEach((parameter) => collectHelpers(parameter, helpers));
        collectHelpers(descriptor.returnType, helpers);

        return;
    }

    const primitive = PRIMITIVES[descriptor.kind];

    if (primitive !== undefined) {
        helpers.add(primitive);
    }
}
