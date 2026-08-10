import type { TypeDescriptor } from '@mta-types/type-descriptor';

export function typeDescriptorText(descriptor: TypeDescriptor): string {
    if (descriptor.kind === 'array') {
        return `${typeDescriptorText(descriptor.element)}[]`;
    }

    if (descriptor.kind === 'optional') {
        return `${typeDescriptorText(descriptor.element)}?`;
    }

    if (descriptor.kind === 'union') {
        return descriptor.options.map(typeDescriptorText).join(' | ');
    }

    if (descriptor.kind === 'named' || descriptor.kind === 'record') {
        return descriptor.name;
    }

    if (descriptor.kind === 'function') {
        const parameters = descriptor.parameters.map(typeDescriptorText);

        if (descriptor.isVariadic) {
            parameters.push('...');
        }

        return `function(${parameters.join(', ')}): ${typeDescriptorText(descriptor.returnType)}`;
    }

    return descriptor.kind;
}

export function descriptorText(name: string, descriptor: TypeDescriptor): string {
    if (descriptor.kind !== 'function') {
        return `${name}: ${typeDescriptorText(descriptor)}`;
    }

    const parameters = descriptor.parameters.map((parameter, index) => {
        const optional = index >= descriptor.minimumArguments ? '?' : '';

        return `${typeDescriptorText(parameter)}${optional}`;
    });

    if (descriptor.isVariadic) {
        parameters.push('...');
    }

    return `function ${name}(${parameters.join(', ')}): ${typeDescriptorText(descriptor.returnType)}`;
}
