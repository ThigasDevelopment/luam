import type { ApiEnvironment } from '#mta-types/api-declaration';
import { ELEMENT_TYPE_ALIASES } from '#mta-types/catalog-overrides';
import { oopClass, oopMethod, oopProperty, type OopClass, type OopMember } from '#mta-types/oop-declaration';
import { ANY, type TypeDescriptor } from '#mta-types/type-descriptor';

import { mergeDescriptor, type NormalizedCatalog } from './catalog-normalizer.ts';
import type { ElementTypeEntry } from './generator-model.ts';
import type { ParsedOopClass, ParsedOopMethod } from './oop-parser.ts';

export interface OopSurfaceResult {
    classes: readonly OopClass[];
    methods: number;
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

function collectMethods(parsed: readonly ParsedOopClass[]): Map<string, Map<string, ParsedOopMethod>> {
    const byClass = new Map<string, Map<string, ParsedOopMethod>>();

    for (const declaration of parsed) {
        const name = ELEMENT_TYPE_ALIASES[declaration.name] ?? declaration.name;
        const methods = byClass.get(name) ?? new Map<string, ParsedOopMethod>();

        for (const method of declaration.methods) {
            const existing = methods.get(method.name);

            if (existing === undefined) {
                methods.set(method.name, method);

                continue;
            }

            methods.set(method.name, { ...existing, type: mergeDescriptor(existing.type, method.type) });
        }

        byClass.set(name, methods);
    }

    return byClass;
}

function collectProperties(parsed: readonly ParsedOopClass[]): Map<string, Set<string>> {
    const byClass = new Map<string, Set<string>>();

    for (const declaration of parsed) {
        const name = ELEMENT_TYPE_ALIASES[declaration.name] ?? declaration.name;
        const properties = byClass.get(name) ?? new Set<string>();

        declaration.properties.forEach((property) => properties.add(property));
        byClass.set(name, properties);
    }

    return byClass;
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
    const methods = collectMethods(parsed);
    const properties = collectProperties(parsed);
    const parents = new Map(elementTypes.map((entry) => [entry.name, entry.parent]));
    const skippedMethods: string[] = [];
    const skippedProperties: string[] = [];
    const classes: OopClass[] = [];

    for (const entry of elementTypes) {
        const members: OopMember[] = [];

        for (const method of (methods.get(entry.name) ?? new Map<string, ParsedOopMethod>()).values()) {
            const environment = environments.get(method.procedural);

            if (environment === undefined) {
                skippedMethods.push(`${entry.name}.${method.name}`);

                continue;
            }

            members.push(oopMethod(method.name, environment, method.procedural, method.type));
        }

        for (const property of properties.get(entry.name) ?? new Set<string>()) {
            const getter = findGetter(entry.name, property, methods, parents);
            const environment = getter === null ? undefined : environments.get(getter.procedural);

            if (getter === null || environment === undefined) {
                skippedProperties.push(`${entry.name}.${property}`);

                continue;
            }

            members.push(oopProperty(property, environment, getter.procedural, returnTypeOf(getter.type)));
        }

        classes.push(oopClass(entry.name, entry.parent, members.sort(byName)));
    }

    const all = classes.flatMap((declaration) => declaration.members);

    return {
        classes,
        methods: all.filter((member) => member.kind === 'method').length,
        properties: all.filter((member) => member.kind === 'property').length,
        skippedMethods: skippedMethods.sort(),
        skippedProperties: skippedProperties.sort(),
    };
}
