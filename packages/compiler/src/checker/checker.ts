import { sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { ResourceAbi } from '@compiler/project/export-abi';
import { DEFAULT_ENVIRONMENT, type Environment } from '@compiler/environment/environment';
import type { Expression, Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import { EMPTY_AMBIENT, EVENT_NAME_PREFIX, type AmbientDeclarations } from './ambient';
import { collectDirectives, type SourceDirectives } from './build-directives';
import { CheckContext } from './context';
import { checkDeclarationFile } from './declaration-file';
import type { StrictMode } from './directives';
import { checkJumps } from './jumps';
import { predeclareModule } from './predeclaration';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from './project-declarations';
import type { DeclarationRegistry, EventInfo } from './registry';
import { settleRecordObligations } from './record-completion';
import { checkStatements } from './statements';
import { reportUnknownTypes } from './type-names';
import type { Type } from './types';
import { reportUnusedSymbols } from './unused';

export interface CheckResult {
    diagnostics: Diagnostic[];
    types: Map<Expression, Type>;
    references: ReadonlySet<string>;
    staticAccess: ReadonlySet<Expression>;
    declarations: DeclarationRegistry;
    aliases: ReadonlyMap<string, Type>;
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    moduleGlobals: ReadonlyMap<string, Type>;
    externalReferences: ReadonlyMap<string, SourcePosition>;
    referencedNames: ReadonlySet<string>;
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

function referencedNames(context: CheckContext, external: ReadonlyMap<string, SourcePosition>): Set<string> {
    const events = [...context.eventReferences].map((name) => `${EVENT_NAME_PREFIX}${name}`);

    return new Set([...external.keys(), ...context.globalReferences, ...context.unknownTypes.keys(), ...events]);
}

export interface CheckOptions {
    ambient?: AmbientDeclarations;
    contracts?: readonly ResourceAbi[];
    project?: ProjectDeclarations;
    isDeclarationFile?: boolean;
    oop?: boolean;
    noUnusedLocals?: boolean;
    noImplicitGlobals?: boolean;
    noUnusedParameters?: boolean;
}

export function check(program: Program, mode: StrictMode, environment: Environment = DEFAULT_ENVIRONMENT, options: CheckOptions = {}): CheckResult {
    const ambient = options.ambient ?? EMPTY_AMBIENT;
    const project = options.project ?? EMPTY_PROJECT_DECLARATIONS;
    const context = new CheckContext(mode, environment, ambient, project, options.oop === true);

    context.noImplicitGlobals = options.noImplicitGlobals === true;

    context.isDeclarationFile = options.isDeclarationFile === true;
    context.contracts = options.contracts ?? [];

    const structure = context.isDeclarationFile ? checkDeclarationFile(program.body) : checkJumps(program.body);
    const directives = collectDirectives(program.body, { isDeclarationFile: context.isDeclarationFile });

    predeclareModule(context, program.body);
    checkStatements(context, program.body);
    settleRecordObligations(context, new Set());
    reportUnknownTypes(context);
    reportUnusedSymbols(context, options.noUnusedLocals === true, options.noUnusedParameters === true);

    const external = externalReferences(context);

    return {
        diagnostics: sortDiagnostics([...structure, ...directives.diagnostics, ...context.diagnostics]),
        types: context.types,
        references: context.references,
        staticAccess: context.staticAccess,
        declarations: context.declarations,
        aliases: context.binder.resolvedAliases(),
        declaredGlobals: context.declaredGlobals,
        moduleGlobals: context.moduleGlobals,
        externalReferences: external,
        referencedNames: referencedNames(context, external),
        directives: directives.directives,
        mode,
        environment,
        generatedMembers: context.generatedMembers,
        events: context.declarations.allEvents(),
    };
}
