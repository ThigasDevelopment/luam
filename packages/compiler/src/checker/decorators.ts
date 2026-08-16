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
    ['FluentSetter', { name: 'FluentSetter', documentation: 'Generates a setter that returns self.' }],
    ['ToString', { name: 'ToString', documentation: 'Generates a shallow string representation.' }],
    ['Equals', { name: 'Equals', documentation: 'Generates shallow field equality.' }],
    ['Clone', { name: 'Clone', documentation: 'Generates a shallow clone.' }],
    ['Serializable', { name: 'Serializable', documentation: 'Generates toTable().' }],
    ['Deserialize', { name: 'Deserialize', documentation: 'Generates fromTable(values).' }],
    ['Lazy', { name: 'Lazy', documentation: 'Generates a caching getter for an initialized field.' }],
    ['Observable', { name: 'Observable', documentation: 'Generates a notifying setter and listener registration.' }],
    ['ReadOnly', { name: 'ReadOnly', documentation: 'Prevents writes outside methods of the declaring class.' }],
    ['Deprecated', { name: 'Deprecated', documentation: 'Reports a warning when the decorated member is used.' }],
    ['Override', { name: 'Override', documentation: 'Requires a matching superclass method.' }],
    ['Builder', { name: 'Builder', documentation: 'Generates a companion builder class.' }],
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

function generatedMethod(
    field: { position: TypeAnnotation['position'] },
    name: string,
    parameters: Parameter[],
    returnAnnotation: TypeAnnotation | null,
    kind: NonNullable<ClassMethodDeclaration['generated']>['kind'],
    fields: ClassFieldDeclaration[],
): ClassMethodDeclaration {
    return { kind: 'class-method', name, isConstructor: false, isSynthetic: true, parameters, returnAnnotation, body: [], decorators: [], generated: { kind, fields }, position: field.position };
}

function typeName(name: string, node: { position: TypeAnnotation['position'] }): TypeAnnotation {
    return { kind: 'type-name', name, typeArguments: [], position: node.position };
}

function validateDecorators(context: CheckContext, decorators: readonly Decorator[], target: 'class' | 'field' | 'method'): Decorator[] {
    const valid: Decorator[] = [];
    const seen = new Set<string>();

    for (const decorator of decorators) {
        if (!KNOWN_DECORATORS.has(decorator.name)) {
            context.report('check-unknown-decorator', `Unknown decorator "@${decorator.name}".`, decorator.position);

            continue;
        }

        if (seen.has(decorator.name)) {
            context.report('check-duplicate-decorator', `Decorator "@${decorator.name}" is repeated on this ${target}.`, decorator.position);

            continue;
        }

        seen.add(decorator.name);

        const classOnly = new Set(['ToString', 'Equals', 'Clone', 'Serializable', 'Deserialize', 'Builder']);
        const methodOnly = new Set(['Override']);
        const memberOnly = new Set(['Deprecated']);
        const classAllowed = new Set(['Getter', 'Setter', ...classOnly]);
        const fieldAllowed = new Set(['Getter', 'Setter', 'FluentSetter', 'Lazy', 'Observable', 'ReadOnly', ...memberOnly]);
        const methodAllowed = new Set([...methodOnly, ...memberOnly]);

        if (
            (target === 'class' && !classAllowed.has(decorator.name)) ||
            (target === 'field' && !fieldAllowed.has(decorator.name)) ||
            (target === 'method' && !methodAllowed.has(decorator.name))
        ) {
            context.report('check-decorator-target', `Decorator "@${decorator.name}" is not valid on this ${target}.`, decorator.position);

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

        for (const decoratorName of ['Getter', 'Setter', 'FluentSetter', 'Lazy', 'Observable']) {
            const decorator = decoratorFor(decoratorName, classDecorators, fieldDecorators);

            if (decorator === null) {
                continue;
            }

            const accessor = decoratorName === 'Getter' || decoratorName === 'Lazy' ? names.getter : decoratorName === 'FluentSetter' ? `with${member.name[0]?.toUpperCase()}${member.name.slice(1)}` : names.setter;
            const conflict = occupied.get(accessor);

            if (conflict !== undefined) {
                const message = `Decorator "@${decoratorName}" on field "${member.name}" would generate "${accessor}", which is already declared by "${conflict}".`;

                context.report('check-decorator-conflict', message, decorator.position);

                continue;
            }

            if (decoratorName === 'Lazy' && member.value === null) {
                context.report('check-lazy-initializer', `Decorator "@Lazy" on field "${member.name}" requires an initializer.`, decorator.position);
                continue;
            }

            occupied.set(accessor, member.name);
            if (decoratorName === 'Getter' || decoratorName === 'Setter') {
                generated.push(accessorMethod(member, decoratorName, accessor));
            } else {
                const value: Parameter = { name: 'value', annotation: member.annotation, isVararg: false, position: member.position };
                const listener: Parameter = { name: 'listener', annotation: null, isVararg: false, position: member.position };
                const kind = decoratorName === 'FluentSetter' ? 'fluent-setter' : decoratorName === 'Lazy' ? 'lazy' : 'observable';
                generated.push(generatedMethod(member, accessor, decoratorName === 'Lazy' ? [] : [value], decoratorName === 'FluentSetter' ? typeName(statement.name, member) : typeName('void', member), kind, [member]));
                if (decoratorName === 'Observable') {
                    const listenerName = `on${member.name[0]?.toUpperCase()}${member.name.slice(1)}Changed`;
                    const listenerConflict = occupied.get(listenerName);

                    if (listenerConflict !== undefined) {
                        context.report(
                            'check-decorator-conflict',
                            `Decorator "@Observable" on field "${member.name}" would generate "${listenerName}", which is already declared by "${listenerConflict}".`,
                            decorator.position,
                        );
                    } else {
                        occupied.set(listenerName, member.name);
                        generated.push(generatedMethod(member, listenerName, [listener], typeName('void', member), 'observable', [member]));
                    }
                }
            }
        }
    }

    const fields = statement.members.filter((member): member is ClassFieldDeclaration => member.kind === 'class-field');
    const classMethods: Readonly<Record<string, [string, TypeAnnotation | null, NonNullable<ClassMethodDeclaration['generated']>['kind']]>> = {
        ToString: ['toString', typeName('string', statement), 'to-string'],
        Equals: ['equals', typeName('boolean', statement), 'equals'],
        Clone: ['clone', typeName(statement.name, statement), 'clone'],
        Serializable: ['toTable', typeName('table', statement), 'serializable'],
        Deserialize: ['fromTable', typeName('void', statement), 'deserialize'],
    };

    for (const [decorator, [name, returnAnnotation, kind]] of Object.entries(classMethods)) {
        const found = classDecorators.find((value) => value.name === decorator);

        if (found !== undefined && !occupied.has(name)) {
            const parameters = decorator === 'Equals' ? [{ name: 'other', annotation: typeName(statement.name, statement), isVararg: false, position: statement.position }] : decorator === 'Deserialize' ? [{ name: 'values', annotation: typeName('table', statement), isVararg: false, position: statement.position }] : [];
            generated.push(generatedMethod(statement, name, parameters, returnAnnotation, kind, fields));
            occupied.set(name, statement.name);
        } else if (found !== undefined) {
            context.report(
                'check-decorator-conflict',
                `Decorator "@${decorator}" would generate "${name}", which is already declared by "${occupied.get(name)}".`,
                found.position,
            );
        }
    }

    return generated;
}
