import { dirname } from 'node:path';

import { EMPTY_AMBIENT, ownDeclarations, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_DIRECTIVES, type SourceDirectives } from '@compiler/checker/build-directives';
import { check } from '@compiler/checker/checker';
import { resolveStrictMode, type StrictMode } from '@compiler/checker/directives';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { DeclarationRegistry } from '@compiler/checker/registry';
import type { Type } from '@compiler/checker/types';
import { createPosition, sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { resolveEnvironment, type Environment } from '@compiler/environment/environment';
import type { Token } from '@compiler/lexer/token';
import { analyzeManifest, type ManifestAnalysis } from '@compiler/manifest/manifest-analysis';
import { DEFAULT_COMPILER_OPTIONS, type CompilerOptions } from '@compiler/manifest/manifest-defaults';
import type { Expression, Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import { parse } from '@compiler/parser/parser';
import { isDeclarationPath } from '@compiler/project/source-kind';

import { isManifestPath } from '@lsp/workspace/project-settings';

import { lineStarts } from '@lsp/support/source-text';
import { buildSymbolIndex, type SymbolIndex } from '@lsp/symbols/symbol-index';

const DEFAULT_MANIFEST_MODE = 'check';

const EMPTY_PROGRAM: Program = { kind: 'program', body: [], position: createPosition(1, 1, 0) };

export interface DocumentAnalysis {
    uri: string;
    path: string;
    relative: string;
    version: number;
    text: string;
    tokens: Token[];
    starts: number[];
    program: Program;
    environment: Environment;
    mode: StrictMode;
    diagnostics: Diagnostic[];
    types: ReadonlyMap<Expression, Type>;
    declarations: DeclarationRegistry;
    aliases: ReadonlyMap<string, Type>;
    own: AmbientDeclarations;
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    referencedNames: ReadonlySet<string>;
    directives: SourceDirectives;
    project: ProjectDeclarations;
    env: Readonly<Record<string, string>>;
    compilerOptions: CompilerOptions;
    index: SymbolIndex;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
    manifest: ManifestAnalysis | null;
}

export interface AnalysisInput {
    uri: string;
    path: string;
    relative?: string;
    version: number;
    text: string;
    project?: ProjectDeclarations;
    compilerOptions?: CompilerOptions;
    environment?: Environment | null;
    env?: Readonly<Record<string, string>>;
    ambient?: (environment: Environment) => AmbientDeclarations;
}

export function analyzeDocument(input: AnalysisInput): DocumentAnalysis {
    if (isManifestPath(input.path)) {
        return analyzeManifestDocument(input);
    }

    return analyzeSourceDocument(input);
}

function analyzeSourceDocument(input: AnalysisInput): DocumentAnalysis {
    const compilerOptions = input.compilerOptions ?? DEFAULT_COMPILER_OPTIONS;
    const parsed = parse(input.text);
    const mode = resolveStrictMode(parsed.directives, compilerOptions.strict);
    const resolved = resolveEnvironment(input.path, parsed.directives, input.environment ?? null);
    const project = input.project ?? EMPTY_PROJECT_DECLARATIONS;
    const ambient = input.ambient?.(resolved.environment) ?? EMPTY_AMBIENT;
    const checked = check(parsed.program, mode, resolved.environment, {
        ambient,
        project,
        isDeclarationFile: isDeclarationPath(input.path),
        oop: compilerOptions.oop,
        noUnusedLocals: compilerOptions.noUnusedLocals,
        noUnusedParameters: compilerOptions.noUnusedParameters,
    });
    const diagnostics = sortDiagnostics([...parsed.diagnostics, ...resolved.diagnostics, ...checked.diagnostics]);
    const starts = lineStarts(input.text);

    return {
        uri: input.uri,
        path: input.path,
        relative: input.relative ?? input.path,
        version: input.version,
        text: input.text,
        tokens: parsed.tokens,
        starts,
        program: parsed.program,
        environment: resolved.environment,
        mode,
        diagnostics,
        types: checked.types,
        declarations: checked.declarations,
        aliases: checked.aliases,
        own: ownDeclarations(checked.declarations, ambient),
        declaredGlobals: checked.declaredGlobals,
        referencedNames: checked.referencedNames,
        directives: checked.directives,
        project,
        env: input.env ?? {},
        compilerOptions,
        index: buildSymbolIndex(input.text, starts, parsed.program, checked.types, checked.declarations, checked.generatedMembers),
        generatedMembers: checked.generatedMembers,
        manifest: null,
    };
}

function analyzeManifestDocument(input: AnalysisInput): DocumentAnalysis {
    const root = dirname(input.path);
    const manifest = analyzeManifest(input.text, { mode: DEFAULT_MANIFEST_MODE, root, env: input.env ?? {} });
    const starts = lineStarts(input.text);
    const declarations = new DeclarationRegistry();

    return {
        uri: input.uri,
        path: input.path,
        relative: input.relative ?? input.path,
        version: input.version,
        text: input.text,
        tokens: manifest.tokens,
        starts,
        program: manifest.program,
        environment: 'shared',
        mode: 'strict',
        diagnostics: manifest.diagnostics,
        types: new Map(),
        declarations,
        aliases: new Map(),
        own: EMPTY_AMBIENT,
        declaredGlobals: new Map(),
        referencedNames: new Set(),
        directives: EMPTY_DIRECTIVES,
        project: input.project ?? EMPTY_PROJECT_DECLARATIONS,
        env: input.env ?? {},
        compilerOptions: DEFAULT_COMPILER_OPTIONS,
        index: buildSymbolIndex(input.text, starts, EMPTY_PROGRAM, new Map(), declarations),
        generatedMembers: new Map(),
        manifest,
    };
}
