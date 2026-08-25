import { literal, named, unionOf, type TypeDescriptor } from '#mta-types/type-descriptor';

import type { ParsedDeclaration } from './generator-model.ts';
import { PARAMETER_ENUMERATIONS, type ParameterEnumeration } from './wiki-enumerations.ts';

export interface EnumerationPage {
    values: ReadonlyMap<string, readonly string[]>;
}

export interface EnumerationResult {
    declarations: readonly ParsedDeclaration[];
    applied: readonly string[];
    skipped: readonly string[];
}

function accepts(current: TypeDescriptor, entry: ParameterEnumeration): boolean {
    return current.kind === 'string' || (entry.element !== undefined && current.kind === 'any');
}

function enumeration(values: readonly string[], element: string | undefined): TypeDescriptor {
    const literals = [...new Set(values)].map(literal);

    return unionOf(element === undefined ? literals : [...literals, named(element)]);
}

function valuesFor(
    entry: ParameterEnumeration,
    templates: ReadonlyMap<string, readonly string[]>,
    page: ReadonlyMap<string, readonly string[]>,
): readonly string[] | null {
    if (entry.values !== undefined) {
        return entry.values;
    }

    if (entry.page === true) {
        return page.get(entry.parameter) ?? null;
    }

    return entry.template === undefined ? null : (templates.get(entry.template) ?? null);
}

function replaced(
    declaration: ParsedDeclaration,
    entries: readonly ParameterEnumeration[],
    templates: ReadonlyMap<string, readonly string[]>,
    page: ReadonlyMap<string, readonly string[]>,
): {
    type: TypeDescriptor;
    applied: string[];
    skipped: string[];
} {
    const applied: string[] = [];
    const skipped: string[] = [];

    if (declaration.type.kind !== 'function') {
        return { type: declaration.type, applied, skipped: entries.map((entry) => `${declaration.name}.${entry.parameter}: not a function`) };
    }

    const names = declaration.documentation.parameters.filter((parameter) => !parameter.isVariadic).map((parameter) => parameter.name);
    const parameters = [...declaration.type.parameters];

    for (const entry of entries) {
        const index = names.indexOf(entry.parameter);
        const current = index === -1 ? undefined : parameters[index];
        const values = valuesFor(entry, templates, page);

        if (index === -1 || current === undefined) {
            skipped.push(`${declaration.name}.${entry.parameter}: the signature declares no such parameter`);
        } else if (!accepts(current, entry)) {
            skipped.push(`${declaration.name}.${entry.parameter}: the parameter is ${current.kind}, which this enumeration does not replace`);
        } else if (values === null || values.length < 2) {
            skipped.push(`${declaration.name}.${entry.parameter}: the enumeration resolved to fewer than two values`);
        } else {
            parameters[index] = enumeration(values, entry.element);
            applied.push(`${declaration.name}.${entry.parameter}`);
        }
    }

    return { type: { ...declaration.type, parameters }, applied, skipped };
}

export function applyEnumerations(
    declarations: readonly ParsedDeclaration[],
    templates: ReadonlyMap<string, readonly string[]>,
    pages: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>,
): EnumerationResult {
    const applied: string[] = [];
    const skipped: string[] = [];

    const updated = declarations.map((declaration) => {
        const entries = PARAMETER_ENUMERATIONS[declaration.name];

        if (entries === undefined) {
            return declaration;
        }

        const result = replaced(declaration, entries, templates, pages.get(declaration.name) ?? new Map());

        applied.push(...result.applied);
        skipped.push(...result.skipped);

        return { ...declaration, type: result.type };
    });

    return { declarations: updated, applied: [...new Set(applied)].sort(), skipped: [...new Set(skipped)].sort() };
}
