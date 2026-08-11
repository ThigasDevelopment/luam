import { EMPTY_AMBIENT, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { SourceDirectives } from '@compiler/checker/build-directives';
import { check } from '@compiler/checker/checker';
import { resolveStrictMode, type StrictMode } from '@compiler/checker/directives';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import type { DeclarationRegistry } from '@compiler/checker/registry';
import type { Type } from '@compiler/checker/types';
import { sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { resolveEnvironment, type Environment } from '@compiler/environment/environment';
import type { Token } from '@compiler/lexer/token';
import type { Expression, Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import { parse } from '@compiler/parser/parser';
import { isDeclarationPath } from '@compiler/project/source-kind';

import { lineStarts } from '@lsp/support/source-text';
import { buildSymbolIndex, type SymbolIndex } from '@lsp/symbols/symbol-index';

export interface DocumentAnalysis {
    uri: string;
    path: string;
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
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    directives: SourceDirectives;
    project: ProjectDeclarations;
    oop: boolean;
    index: SymbolIndex;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
}

export interface AnalysisInput {
    uri: string;
    path: string;
    version: number;
    text: string;
    project?: ProjectDeclarations;
    oop?: boolean;
    ambient?: (environment: Environment) => AmbientDeclarations;
}

export function analyzeDocument(input: AnalysisInput): DocumentAnalysis {
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
        declaredGlobals: checked.declaredGlobals,
        directives: checked.directives,
        project,
        oop,
        index: buildSymbolIndex(input.text, starts, parsed.program, checked.types, checked.generatedMembers),
        generatedMembers: checked.generatedMembers,
    };
}
