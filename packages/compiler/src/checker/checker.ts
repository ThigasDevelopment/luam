import { sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { DEFAULT_ENVIRONMENT, type Environment } from '@compiler/environment/environment';
import type { Expression, Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import { EMPTY_AMBIENT, type AmbientDeclarations } from './ambient';
import { collectDirectives, type SourceDirectives } from './build-directives';
import { CheckContext } from './context';
import { checkDeclarationFile } from './declaration-file';
import type { StrictMode } from './directives';
import { checkJumps } from './jumps';
import { predeclareModule } from './predeclaration';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from './project-declarations';
import type { DeclarationRegistry, EventInfo } from './registry';
import { checkStatements } from './statements';
import { reportUnknownTypes } from './type-names';
import type { Type } from './types';
import { reportUnusedSymbols } from './unused';

export interface CheckResult {
    diagnostics: Diagnostic[];
    types: Map<Expression, Type>;
    references: ReadonlySet<string>;
    declarations: DeclarationRegistry;
    aliases: ReadonlyMap<string, Type>;
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    externalReferences: ReadonlyMap<string, SourcePosition>;
    directives: SourceDirectives;
    mode: StrictMode;
    environment: Environment;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
    events: readonly EventInfo[];
}

function externalReferences(context: CheckContext): Map<string, SourcePosition> {
    const external = new Map<string, SourcePosition>();

    for (const [name, position] of context.externalReferences) {
        if (!context.declaredGlobals.has(name)) {
            external.set(name, position);
        }
    }

    return external;
}

export interface CheckOptions {
    ambient?: AmbientDeclarations;
    project?: ProjectDeclarations;
    isDeclarationFile?: boolean;
    oop?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
}

export function check(program: Program, mode: StrictMode, environment: Environment = DEFAULT_ENVIRONMENT, options: CheckOptions = {}): CheckResult {
    const ambient = options.ambient ?? EMPTY_AMBIENT;
    const project = options.project ?? EMPTY_PROJECT_DECLARATIONS;
    const context = new CheckContext(mode, environment, ambient, project, options.oop === true);

    context.isDeclarationFile = options.isDeclarationFile === true;

    const structure = context.isDeclarationFile ? checkDeclarationFile(program.body) : checkJumps(program.body);
    const directives = collectDirectives(program.body, { isDeclarationFile: context.isDeclarationFile });

    predeclareModule(context, program.body);
    checkStatements(context, program.body);
    reportUnknownTypes(context);
    reportUnusedSymbols(context, options.noUnusedLocals === true, options.noUnusedParameters === true);

    return {
        diagnostics: sortDiagnostics([...structure, ...directives.diagnostics, ...context.diagnostics]),
        types: context.types,
        references: context.references,
        declarations: context.declarations,
        aliases: context.binder.resolvedAliases(),
        declaredGlobals: context.declaredGlobals,
        externalReferences: externalReferences(context),
        directives: directives.directives,
        mode,
        environment,
        generatedMembers: context.generatedMembers,
        events: context.declarations.allEvents(),
    };
}
