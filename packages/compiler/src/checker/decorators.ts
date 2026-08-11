import type { Parameter, Statement, TypeAnnotation } from '@compiler/parser/ast';
import type {
    ClassDeclaration,
    ClassFieldDeclaration,
    ClassMethodDeclaration,
    Decorator,
} from '@compiler/parser/declaration-nodes';

import { accessorNames } from './accessor-names';
import type { CheckContext } from './context';
import { isBooleanType, type Type } from './types';

export interface DecoratorDefinition {
    name: string;
    documentation: string;
}

export const KNOWN_DECORATORS: ReadonlyMap<string, DecoratorDefinition> = new Map([
    ['Getter', { name: 'Getter', documentation: 'Generates a typed getter for each decorated field.' }],
    ['Setter', { name: 'Setter', documentation: 'Generates a typed setter for each decorated field.' }],
]);

function memberExpression(field: ClassFieldDeclaration) {
    return {
        kind: 'member-expression' as const,
        object: { kind: 'identifier' as const, name: 'self', position: field.position },
        property: field.name,
        position: field.position,
    };
}

function accessorMethod(field: ClassFieldDeclaration, decorator: string, name: string): ClassMethodDeclaration {
    const value: Parameter = { name: 'value', annotation: field.annotation, isVararg: false, position: field.position };
    const voidAnnotation: TypeAnnotation = { kind: 'type-name', name: 'void', typeArguments: [], position: field.position };
    const body: Statement[] =
        decorator === 'Getter'
            ? [{ kind: 'return-statement', values: [memberExpression(field)], position: field.position }]
            : [
                  {
                      kind: 'assignment-statement',
                      operator: '=',
                      targets: [memberExpression(field)],
                      values: [{ kind: 'identifier', name: 'value', position: field.position }],
                      position: field.position,
                  },
              ];

    return {
        kind: 'class-method',
        name,
        isConstructor: false,
        isSynthetic: true,
        parameters: decorator === 'Getter' ? [] : [value],
        returnAnnotation: decorator === 'Getter' ? field.annotation : voidAnnotation,
        body,
        decorators: [],
        position: field.position,
    };
}

function validateDecorators(context: CheckContext, decorators: readonly Decorator[], target: 'class' | 'field' | 'method'): Decorator[] {
    const valid: Decorator[] = [];
    const seen = new Set<string>();

    for (const decorator of decorators) {
        if (!KNOWN_DECORATORS.has(decorator.name)) {
            context.report('check-unknown-decorator', `Unknown decorator "@${decorator.name}". Available decorators: @Getter, @Setter.`, decorator.position);

            continue;
        }

        if (seen.has(decorator.name)) {
            context.report('check-duplicate-decorator', `Decorator "@${decorator.name}" is repeated on this ${target}.`, decorator.position);

            continue;
        }

        seen.add(decorator.name);

        if (target === 'method') {
            context.report('check-decorator-target', `Decorator "@${decorator.name}" can only generate accessors from fields.`, decorator.position);

            continue;
        }

        valid.push(decorator);
    }

    return valid;
}

function decoratorFor(name: string, classDecorators: readonly Decorator[], fieldDecorators: readonly Decorator[]): Decorator | null {
    return fieldDecorators.find((decorator) => decorator.name === name) ?? classDecorators.find((decorator) => decorator.name === name) ?? null;
}

export function expandClassDecorators(
    context: CheckContext,
    statement: ClassDeclaration,
    fieldTypes: ReadonlyMap<ClassFieldDeclaration, Type>,
): ClassMethodDeclaration[] {
    const generated: ClassMethodDeclaration[] = [];
    const occupied = new Map(statement.members.filter((member) => member.kind === 'class-method').map((member) => [member.name, member.name]));
    const classDecorators = validateDecorators(context, statement.decorators, 'class');

    for (const member of statement.members) {
        if (member.kind === 'class-method' || member.name === 'constructor') {
            validateDecorators(context, member.decorators, 'method');

            continue;
        }

        const fieldDecorators = validateDecorators(context, member.decorators, 'field');
        const names = accessorNames(member.name, isBooleanType(fieldTypes.get(member)));

        for (const decoratorName of KNOWN_DECORATORS.keys()) {
            const decorator = decoratorFor(decoratorName, classDecorators, fieldDecorators);

            if (decorator === null) {
                continue;
            }

            const accessor = decoratorName === 'Getter' ? names.getter : names.setter;
            const conflict = occupied.get(accessor);

            if (conflict !== undefined) {
                const message = `Decorator "@${decoratorName}" on field "${member.name}" would generate "${accessor}", which is already declared by "${conflict}".`;

                context.report('check-decorator-conflict', message, decorator.position);

                continue;
            }

            occupied.set(accessor, member.name);
            generated.push(accessorMethod(member, decoratorName, accessor));
        }
    }

    return generated;
}
