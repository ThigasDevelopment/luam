import type { ApiDocumentation } from '@mta-types/api-documentation';
import type { RecordMember, TypeDescriptor } from '@mta-types/type-descriptor';

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

const SHAPE_MEMBER_LIMIT = 24;

export function valueText(kind: string, value: string): string {
    return kind === 'string' ? `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : value;
}

function assignedText(member: RecordMember, values: Readonly<Record<string, string>>): string {
    const value = values[member.name];

    return value === undefined ? '' : ` = ${valueText(member.type.kind, value)}`;
}

export function descriptorShapeText(name: string, descriptor: TypeDescriptor, values: Readonly<Record<string, string>> = {}): string {
    if (descriptor.kind !== 'record' || descriptor.members.length === 0) {
        return descriptorText(name, descriptor);
    }

    const visible = descriptor.members.slice(0, SHAPE_MEMBER_LIMIT);
    const lines = visible.map((member) => `    ${member.name}: ${typeDescriptorText(member.type)}${assignedText(member, values)}`);
    const hidden = descriptor.members.length - visible.length;

    if (hidden > 0) {
        lines.push(`    # ${hidden} more`);
    }

    return `${name}: {\n${lines.join('\n')}\n}`;
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
