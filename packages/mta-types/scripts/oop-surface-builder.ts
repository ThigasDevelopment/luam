import type { ApiEnvironment } from '#mta-types/api-declaration';
import { ELEMENT_TYPE_ALIASES, OOP_CONSTRUCTOR_OVERRIDES } from '#mta-types/catalog-overrides';
import { oopClass, oopConstructor, oopMethod, oopProperty, type OopClass, type OopMember } from '#mta-types/oop-declaration';
import { ANY, type TypeDescriptor } from '#mta-types/type-descriptor';

import { mergeDescriptor, type NormalizedCatalog } from './catalog-normalizer.ts';
import type { ElementTypeEntry } from './generator-model.ts';
import type { ParsedOopClass, ParsedOopConstructor, ParsedOopMethod } from './oop-parser.ts';

export interface OopSurfaceResult {
    classes: readonly OopClass[];
    methods: number;
    staticMethods: number;
    constructors: number;
    properties: number;
    skippedMethods: readonly string[];
    skippedProperties: readonly string[];
}

const GETTER_PREFIXES: readonly string[] = ['get', 'is', 'are', 'does', 'doesHave', 'has', 'was', 'can'];

function catalogEnvironments(catalog: NormalizedCatalog): ReadonlyMap<string, ApiEnvironment> {
    const environments = new Map<string, ApiEnvironment>();

    for (const entry of [...catalog.shared, ...catalog.server, ...catalog.client]) {
        environments.set(entry.name, entry.environment);
    }

    return environments;
}

function mergedEnvironment(left: ApiEnvironment, right: ApiEnvironment): ApiEnvironment {
    return left === right ? left : 'shared';
}

function availableEnvironment(shape: ApiEnvironment, procedural: ApiEnvironment): ApiEnvironment | null {
    if (shape === procedural) {
        return shape;
    }

    if (shape === 'shared') {
        return procedural;
    }

    return procedural === 'shared' ? shape : null;
}

function collectMethods(parsed: readonly ParsedOopClass[], select: (declaration: ParsedOopClass) => readonly ParsedOopMethod[]): Map<string, Map<string, ParsedOopMethod>> {
    const byClass = new Map<string, Map<string, ParsedOopMethod>>();

    for (const declaration of parsed) {
        const name = ELEMENT_TYPE_ALIASES[declaration.name] ?? declaration.name;
        const methods = byClass.get(name) ?? new Map<string, ParsedOopMethod>();

        for (const method of select(declaration)) {
            const existing = methods.get(method.name);

            if (existing === undefined) {
                methods.set(method.name, method);

                continue;
            }

            methods.set(method.name, {
                ...existing,
                type: mergeDescriptor(existing.type, method.type),
                environment: mergedEnvironment(existing.environment, method.environment),
            });
        }

        byClass.set(name, methods);
    }

    return byClass;
}

function collectProperties(parsed: readonly ParsedOopClass[]): Map<string, Map<string, ApiEnvironment>> {
    const byClass = new Map<string, Map<string, ApiEnvironment>>();

    for (const declaration of parsed) {
        const name = ELEMENT_TYPE_ALIASES[declaration.name] ?? declaration.name;
        const properties = byClass.get(name) ?? new Map<string, ApiEnvironment>();

        for (const property of declaration.properties) {
            const existing = properties.get(property.name);

            properties.set(property.name, existing === undefined ? property.environment : mergedEnvironment(existing, property.environment));
        }
        byClass.set(name, properties);
    }

    return byClass;
}

function collectConstructors(parsed: readonly ParsedOopClass[]): Map<string, ParsedOopConstructor> {
    const constructors = new Map<string, ParsedOopConstructor>();

    for (const declaration of parsed) {
        const name = ELEMENT_TYPE_ALIASES[declaration.name] ?? declaration.name;

        for (const constructor of declaration.constructors) {
            const existing = constructors.get(name);

            constructors.set(
                name,
                existing === undefined
                    ? constructor
                    : {
                          procedural: existing.procedural ?? constructor.procedural,
                          type: mergeDescriptor(existing.type, constructor.type),
                          environment: mergedEnvironment(existing.environment, constructor.environment),
                      },
            );
        }
    }

    return constructors;
}

function returnTypeOf(type: TypeDescriptor): TypeDescriptor {
    return type.kind === 'function' ? type.returnType : ANY;
}

function findGetter(
    className: string,
    property: string,
    methods: ReadonlyMap<string, ReadonlyMap<string, ParsedOopMethod>>,
    parents: ReadonlyMap<string, string | null>,
): ParsedOopMethod | null {
    const wanted = new Set(GETTER_PREFIXES.map((prefix) => `${prefix}${property}`.toLowerCase()));
    let current: string | null = className;

    while (current !== null) {
        for (const [name, method] of methods.get(current) ?? []) {
            if (wanted.has(name.toLowerCase())) {
                return method;
            }
        }

        current = parents.get(current) ?? null;
    }

    return null;
}

function byName(left: OopMember, right: OopMember): number {
    return left.name.localeCompare(right.name, 'en');
}

export function buildOopSurface(
    parsed: readonly ParsedOopClass[],
    elementTypes: readonly ElementTypeEntry[],
    catalog: NormalizedCatalog,
): OopSurfaceResult {
    const environments = catalogEnvironments(catalog);
    const methods = collectMethods(parsed, (declaration) => declaration.methods);
    const staticMethods = collectMethods(parsed, (declaration) => declaration.staticMethods);
    const constructors = collectConstructors(parsed);
    const properties = collectProperties(parsed);
    const parents = new Map(elementTypes.map((entry) => [entry.name, entry.parent]));
    const skippedMethods: string[] = [];
    const skippedProperties: string[] = [];
    const classes: OopClass[] = [];

    for (const entry of elementTypes) {
        const members: OopMember[] = [];
        const statics: OopMember[] = [];

        for (const method of (methods.get(entry.name) ?? new Map<string, ParsedOopMethod>()).values()) {
            const proceduralEnvironment = environments.get(method.procedural);
            const environment = proceduralEnvironment === undefined ? null : availableEnvironment(method.environment, proceduralEnvironment);

            if (environment === null) {
                skippedMethods.push(`${entry.name}.${method.name}`);

                continue;
            }

            members.push(oopMethod(method.name, environment, method.procedural, method.type));
        }

        for (const method of (staticMethods.get(entry.name) ?? new Map<string, ParsedOopMethod>()).values()) {
            const proceduralEnvironment = environments.get(method.procedural);
            const environment = proceduralEnvironment === undefined ? null : availableEnvironment(method.environment, proceduralEnvironment);

            if (environment === null) {
                skippedMethods.push(`${entry.name}.${method.name}`);

                continue;
            }

            statics.push(oopMethod(method.name, environment, method.procedural, method.type));
        }

        for (const [property, shapeEnvironment] of properties.get(entry.name) ?? new Map<string, ApiEnvironment>()) {
            const getter = findGetter(entry.name, property, methods, parents);
            const proceduralEnvironment = getter === null ? undefined : environments.get(getter.procedural);
            const environment = proceduralEnvironment === undefined ? null : availableEnvironment(shapeEnvironment, proceduralEnvironment);

            if (getter === null || environment === null) {
                skippedProperties.push(`${entry.name}.${property}`);

                continue;
            }

            members.push(oopProperty(property, environment, getter.procedural, returnTypeOf(getter.type)));
        }

        const parsedConstructor = constructors.get(entry.name);
        const constructorType = OOP_CONSTRUCTOR_OVERRIDES[entry.name] ?? parsedConstructor?.type;
        const callable =
            parsedConstructor === undefined || constructorType === undefined
                ? null
                : oopConstructor(parsedConstructor.environment, constructorType, parsedConstructor.procedural);

        classes.push(oopClass(entry.name, entry.parent, members.sort(byName), statics.sort(byName), callable));
    }

    const all = classes.flatMap((declaration) => declaration.members);

    return {
        classes,
        methods: all.filter((member) => member.kind === 'method').length,
        staticMethods: classes.reduce((total, declaration) => total + declaration.staticMethods.length, 0),
        constructors: classes.filter((declaration) => declaration.constructor !== null).length,
        properties: all.filter((member) => member.kind === 'property').length,
        skippedMethods: skippedMethods.sort(),
        skippedProperties: skippedProperties.sort(),
    };
}
