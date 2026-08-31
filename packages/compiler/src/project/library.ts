import { emptySourceMapping, SOURCE_SIDES, type SourceMapping } from '@compiler/manifest/manifest-defaults';
import type { Environment } from '@compiler/environment/environment';

import { normalizePattern, patternProblem, patternProblemText } from './path-pattern';

export interface LibraryOrigin {
    package: string;
    root: string;
    relativePath: string;
    packageIndex: number;
    index: number;
}

export interface LibraryFile {
    origin: LibraryOrigin;
    environment: Environment;
    content: string;
}

export function compareLibraryOrigins(left: LibraryOrigin, right: LibraryOrigin): number {
    return left.packageIndex - right.packageIndex || left.index - right.index;
}

export interface LibraryDeclaration {
    name: string;
    sources: SourceMapping;
    requires: readonly string[];
}

export interface LibraryProblem {
    code: string;
    message: string;
}

export interface LibraryDeclarationResult {
    declaration: LibraryDeclaration | null;
    problems: LibraryProblem[];
}

export const LIBRARIES_DIRECTORY = 'libs';

export const LIBRARY_FIELD = 'luam';

export const MISSING_LIBRARY = 'config-library-missing';

export const INVALID_LIBRARY = 'config-library-invalid';

export const DUPLICATE_LIBRARY = 'config-library-duplicate';

export const ESCAPING_LIBRARY = 'config-library-escape';

export const MISSING_REQUIREMENT = 'config-library-requirement-missing';

const PACKAGE_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const SHAPE = `"${LIBRARY_FIELD}" must be a table with "sources" naming patterns per side and an optional "requires" list.`;

export function isPackageName(value: string): boolean {
    return PACKAGE_NAME.test(value);
}

export function libraryDirectory(name: string): string {
    return name.replace(/^@/, '').replace(/\//g, '-');
}

export function libraryFilePath(name: string, relativePath: string): string {
    return `${name}/${normalizePattern(relativePath)}`;
}

export function libraryOutputPath(name: string, environment: Environment, relativePath: string): string {
    const file = normalizePattern(relativePath).replace(/\.luam$/, '.lua');

    return `${LIBRARIES_DIRECTORY}/${libraryDirectory(name)}/${environment}/${file}`;
}

export function installCommand(name: string): string {
    return `npm install ${name}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    return value.every((entry) => typeof entry === 'string') ? [...(value as string[])] : null;
}

function patternProblems(name: string, environment: Environment, patterns: readonly string[], problems: LibraryProblem[]): void {
    for (const pattern of patterns) {
        const problem = patternProblem(pattern);

        if (problem === null) {
            continue;
        }

        const code = problem === 'absolute' || problem === 'traversal' ? ESCAPING_LIBRARY : INVALID_LIBRARY;
        const subject = `"${name}" declares the "${environment}" pattern "${pattern}", which ${patternProblemText(problem)}`;

        problems.push({ code, message: `${subject}. Every pattern stays inside the package directory.` });
    }
}

function readSources(name: string, value: unknown, problems: LibraryProblem[]): SourceMapping | null {
    if (!isRecord(value)) {
        problems.push({ code: INVALID_LIBRARY, message: `"${name}" declares no "sources" table in its "${LIBRARY_FIELD}" field. ${SHAPE}` });

        return null;
    }

    const mapping = emptySourceMapping();

    for (const environment of SOURCE_SIDES) {
        const declared = value[environment];

        if (declared === undefined) {
            continue;
        }

        const patterns = stringList(declared);

        if (patterns === null) {
            problems.push({ code: INVALID_LIBRARY, message: `"${name}" declares "sources.${environment}" as something other than a list of patterns. ${SHAPE}` });

            continue;
        }

        patternProblems(name, environment, patterns, problems);
        mapping[environment] = patterns.map(normalizePattern);
    }

    if (SOURCE_SIDES.every((environment) => mapping[environment].length === 0)) {
        problems.push({ code: INVALID_LIBRARY, message: `"${name}" declares no source patterns for any side. ${SHAPE}` });

        return null;
    }

    return mapping;
}

function readRequires(name: string, value: unknown, problems: LibraryProblem[]): string[] {
    if (value === undefined) {
        return [];
    }

    const requires = stringList(value);

    if (requires === null) {
        problems.push({ code: INVALID_LIBRARY, message: `"${name}" declares "requires" as something other than a list of package names. ${SHAPE}` });

        return [];
    }

    for (const entry of requires) {
        if (!isPackageName(entry)) {
            problems.push({ code: INVALID_LIBRARY, message: `"${name}" requires "${entry}", which is not a package name.` });
        }
    }

    return requires.filter(isPackageName);
}

export function readLibraryDeclaration(name: string, manifest: unknown): LibraryDeclarationResult {
    const problems: LibraryProblem[] = [];

    if (!isRecord(manifest)) {
        return { declaration: null, problems: [{ code: INVALID_LIBRARY, message: `"${name}" has an unreadable "package.json". ${SHAPE}` }] };
    }

    const field = manifest[LIBRARY_FIELD];

    if (field === undefined) {
        const message = `"${name}" is listed in "libraries" but its "package.json" declares no "${LIBRARY_FIELD}" field, so it is not a Luam library.`;

        return { declaration: null, problems: [{ code: INVALID_LIBRARY, message }] };
    }

    if (!isRecord(field)) {
        return { declaration: null, problems: [{ code: INVALID_LIBRARY, message: `"${name}" declares a "${LIBRARY_FIELD}" field that is not a table. ${SHAPE}` }] };
    }

    const sources = readSources(name, field.sources, problems);
    const requires = readRequires(name, field.requires, problems);

    if (sources === null) {
        return { declaration: null, problems };
    }

    return { declaration: { name, sources, requires }, problems };
}

export function missingRequirements(declarations: readonly LibraryDeclaration[]): LibraryProblem[] {
    const listed = new Set(declarations.map((declaration) => declaration.name));
    const problems: LibraryProblem[] = [];

    for (const declaration of declarations) {
        for (const required of declaration.requires) {
            if (listed.has(required)) {
                continue;
            }

            const subject = `"${declaration.name}" requires "${required}", which "libraries" does not list`;

            problems.push({ code: MISSING_REQUIREMENT, message: `${subject}. Add it to "libraries" and install it with "${installCommand(required)}".` });
        }
    }

    return problems;
}
