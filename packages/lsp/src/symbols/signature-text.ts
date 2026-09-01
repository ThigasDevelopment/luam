import { typeToString, type Type } from '@compiler/checker/types';
import type { Parameter, TypeAnnotation } from '@compiler/parser/ast';

export function annotationText(annotation: TypeAnnotation | null): string {
    if (annotation === null) {
        return 'any';
    }

    if (annotation.kind === 'type-array') {
        return `${annotationText(annotation.element)}[]`;
    }

    if (annotation.kind === 'type-optional') {
        return `${annotationText(annotation.element)}?`;
    }

    if (annotation.kind === 'type-union') {
        return annotation.options.map(annotationText).join(' | ');
    }

    if (annotation.kind === 'type-intersection') {
        return annotation.parts.map(annotationText).join(' & ');
    }

    if (annotation.kind === 'type-string-literal') {
        return `'${annotation.value.replace(/(['\\])/g, '\\$1')}'`;
    }

    if (annotation.kind === 'type-boolean-literal' || annotation.kind === 'type-number-literal') {
        return String(annotation.value);
    }

    if (annotation.kind === 'type-function') {
        const parameters = annotation.parameters.map((parameter, index) => namedAnnotationText(annotation.parameterNames[index] ?? null, parameter));

        if (annotation.isVariadic) {
            parameters.push('...');
        }

        return `fun(${parameters.join(', ')}): ${annotationText(annotation.returnType)}`;
    }

    if (annotation.kind === 'type-object') {
        const members = annotation.members.map((member) => namedAnnotationText(member.name, member.annotation));

        return members.length === 0 ? '{}' : `{ ${members.join(', ')} }`;
    }

    if (annotation.kind === 'type-tuple') {
        return `(${annotation.elements.map(annotationText).join(', ')})`;
    }

    if (annotation.typeArguments.length === 0) {
        return annotation.name;
    }

    return `${annotation.name}<${annotation.typeArguments.map(annotationText).join(', ')}>`;
}

export function namedAnnotationText(name: string | null, annotation: TypeAnnotation | null): string {
    if (name === null) {
        return annotationText(annotation);
    }

    if (annotation === null) {
        return name;
    }

    return annotation.kind === 'type-optional' ? `${name}?: ${annotationText(annotation.element)}` : `${name}: ${annotationText(annotation)}`;
}

export function parameterText(parameter: Parameter): string {
    const prefix = parameter.isVararg ? '...' : '';

    return `${prefix}${namedAnnotationText(parameter.name, parameter.annotation)}`;
}

export function typeParameterText(names: readonly string[]): string {
    return names.length === 0 ? '' : `<${names.join(', ')}>`;
}

export function signatureText(
    name: string,
    parameters: readonly Parameter[],
    returnAnnotation: TypeAnnotation | null,
    inferredReturn: Type | null = null,
    typeParameters: readonly string[] = [],
): string {
    const rendered = parameters.map(parameterText).join(', ');
    const returnType = returnAnnotation === null && inferredReturn !== null ? typeToString(inferredReturn) : annotationText(returnAnnotation);

    return `${name}${typeParameterText(typeParameters)}(${rendered}): ${returnType}`;
}

export function variableText(keyword: string, name: string, annotation: TypeAnnotation | null, fallback: string | null): string {
    if (annotation !== null) {
        return `${keyword} ${namedAnnotationText(name, annotation)}`;
    }

    return fallback === null ? `${keyword} ${name}` : `${keyword} ${name}: ${fallback}`;
}

export function fieldText(name: string, annotation: TypeAnnotation): string {
    return `field ${namedAnnotationText(name, annotation)}`;
}

export function inferredFieldText(name: string, type: Type | null): string {
    if (type === null || type.kind === 'any') {
        return `field ${name}`;
    }

    return `field ${name}: ${typeToString(type)}`;
}

export function assignedText(declaration: string, value: string | null, bytes: number | null = null): string {
    if (value === null) {
        return declaration;
    }

    const measure = bytes === null ? '' : ` # ${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;

    return `${declaration} = ${value}${measure}`;
}
