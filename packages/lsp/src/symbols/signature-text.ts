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

    if (annotation.kind === 'type-function') {
        const parameters = annotation.parameters.map(annotationText);

        if (annotation.isVariadic) {
            parameters.push('...');
        }

        return `function(${parameters.join(', ')}): ${annotationText(annotation.returnType)}`;
    }

    if (annotation.typeArguments.length === 0) {
        return annotation.name;
    }

    return `${annotation.name}<${annotation.typeArguments.map(annotationText).join(', ')}>`;
}

export function parameterText(parameter: Parameter): string {
    const prefix = parameter.isVararg ? '...' : '';
    const annotation = parameter.annotation === null ? '' : `: ${annotationText(parameter.annotation)}`;

    return `${prefix}${parameter.name}${annotation}`;
}

export function signatureText(name: string, parameters: readonly Parameter[], returnAnnotation: TypeAnnotation | null): string {
    const rendered = parameters.map(parameterText).join(', ');

    return `${name}(${rendered}): ${annotationText(returnAnnotation)}`;
}

export function variableText(keyword: string, name: string, annotation: TypeAnnotation | null, fallback: string | null): string {
    if (annotation !== null) {
        return `${keyword} ${name}: ${annotationText(annotation)}`;
    }

    return fallback === null ? `${keyword} ${name}` : `${keyword} ${name}: ${fallback}`;
}
