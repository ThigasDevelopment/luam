import type { ApiDocumentation } from '@mta-types/api-documentation';
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

export function parameterLabels(descriptor: TypeDescriptor, documentation: ApiDocumentation): string[] {
    if (descriptor.kind !== 'function') {
        return [];
    }

    const named = documentation.parameters.filter((parameter) => !parameter.isVariadic);
    const labels = descriptor.parameters.map((parameter, index) => {
        const optional = index >= descriptor.minimumArguments ? '?' : '';
        const name = named[index]?.name ?? `argument${index + 1}`;

        return `${name}${optional}: ${typeDescriptorText(parameter)}`;
    });

    if (descriptor.isVariadic) {
        const rest = documentation.parameters.find((parameter) => parameter.isVariadic);

        labels.push(rest === undefined ? '...' : `...${rest.name}`);
    }

    return labels;
}

export function namedDescriptorText(name: string, descriptor: TypeDescriptor, documentation: ApiDocumentation): string {
    if (descriptor.kind !== 'function') {
        return `${name}: ${typeDescriptorText(descriptor)}`;
    }

    if (documentation.parameters.length === 0) {
        return descriptorText(name, descriptor);
    }

    return `function ${name}(${parameterLabels(descriptor, documentation).join(', ')}): ${typeDescriptorText(descriptor.returnType)}`;
}
