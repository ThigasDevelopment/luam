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
    own: AmbientDeclarations;
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    directives: SourceDirectives;
    project: ProjectDeclarations;
    oop: boolean;
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
    oop?: boolean;
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
    const parsed = parse(input.text);
    const mode = resolveStrictMode(parsed.directives);
    const resolved = resolveEnvironment(input.path, parsed.directives);
    const project = input.project ?? EMPTY_PROJECT_DECLARATIONS;
    const oop = input.oop === true;
    const ambient = input.ambient?.(resolved.environment) ?? EMPTY_AMBIENT;
    const checked = check(parsed.program, mode, resolved.environment, {
        ambient,
        project,
        isDeclarationFile: isDeclarationPath(input.path),
        oop,
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
        own: ownDeclarations(checked.declarations, ambient),
        declaredGlobals: checked.declaredGlobals,
        directives: checked.directives,
        project,
        oop,
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
        own: EMPTY_AMBIENT,
        declaredGlobals: new Map(),
        directives: EMPTY_DIRECTIVES,
        project: input.project ?? EMPTY_PROJECT_DECLARATIONS,
        oop: false,
        index: buildSymbolIndex(input.text, starts, EMPTY_PROGRAM, new Map(), declarations),
        generatedMembers: new Map(),
        manifest,
    };
}
