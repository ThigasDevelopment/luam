import { createDiagnostic, type Diagnostic, type DiagnosticSeverity, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Environment } from '@compiler/environment/environment';
import type { Expression, TypeAnnotation } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import { isAvailableIn, type ApiEnvironment } from '@mta-types/api-declaration';

import { EMPTY_AMBIENT, type AmbientDeclarations } from './ambient';
import { descriptorToType } from './api-types';
import { Binder, type SymbolInfo } from './binder';
import type { StrictMode } from './directives';
import { builtinSymbols } from './globals';
import { mtaClassRegistry } from './oop-classes';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from './project-declarations';
import { DeclarationRegistry, type ClassInfo } from './registry';
import { missingKeyHint } from './shape-hint';
import { mergeIntersection } from './type-intersection';
import { substituteType } from './type-substitution';
import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createArray,
    createBooleanLiteral,
    createFunction,
    createMap,
    createNamed,
    createNumberLiteral,
    createObjectType,
    createOptional,
    createStringLiteral,
    createTuple,
    createUnion,
    isAssignable,
    isLiteralType,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    THREAD_TYPE,
    typeToString,
    UNKNOWN_TYPE,
    USERDATA_TYPE,
    VOID_TYPE,
    widenInferred,
    widenLiteral,
    type Type,
} from './types';

const BUILTIN_TYPES: Readonly<Record<string, Type>> = {
    any: ANY_TYPE,
    boolean: BOOLEAN_TYPE,
    nil: NIL_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
    thread: THREAD_TYPE,
    unknown: UNKNOWN_TYPE,
    userdata: USERDATA_TYPE,
    void: VOID_TYPE,
};

const TABLE_ANNOTATION = 'table';

const MAP_ARGUMENTS = 2;

const PROJECT_POSITION: SourcePosition = { line: 0, column: 0, offset: 0 };

export interface ClassMethodFrame {
    className: string;
    methodName: string;
}

interface ReturnFrame {
    expected: Type | null;
    inferred: Type[];
}

function nilHint(source: Type, target: Type, mode: StrictMode): string {
    if (mode !== 'strict' || source.kind !== 'nil' || target.kind === 'nil' || target.kind === 'optional') {
        return '';
    }

    return ` Annotate it "${typeToString(target)}?" to allow "nil", or put "#!nonstrict" at the top of the file.`;
}

export class CheckContext {
    readonly binder = new Binder();

    readonly declarations = new DeclarationRegistry();

    readonly diagnostics: Diagnostic[] = [];

    private readonly reported = new Set<string>();

    private readonly narrowings: Map<string, Type>[] = [];

    readonly types = new Map<Expression, Type>();

    readonly references = new Set<string>();

    readonly declaredGlobals = new Map<string, SourcePosition>();

    readonly externalReferences = new Map<string, SourcePosition>();

    readonly unknownTypes = new Map<string, SourcePosition>();

    readonly calledMembers = new Set<Expression>();

    readonly staticAccess = new Set<Expression>();

    private readonly typeParameters = new Set<string>();

    readonly generatedMembers = new Map<ClassDeclaration, ClassMethodDeclaration[]>();

    readonly mode: StrictMode;

    readonly environment: Environment;

    readonly mtaClasses: DeclarationRegistry | null;

    isDeclarationFile = false;

    private readonly returnStack: ReturnFrame[] = [];

    private readonly methodStack: ClassMethodFrame[] = [];

    private readonly projectEnvironments = new Map<string, ApiEnvironment>();

    private readonly predeclared = new Map<string, ClassInfo>();

    private readonly ambientClasses = new Set<string>();

    private readonly ambientInterfaces = new Set<string>();

    private readonly ambientEnums = new Set<string>();

    constructor(
        mode: StrictMode,
        environment: Environment,
        ambient: AmbientDeclarations = EMPTY_AMBIENT,
        project: ProjectDeclarations = EMPTY_PROJECT_DECLARATIONS,
        oop = false,
    ) {
        this.mode = mode;
        this.environment = environment;
        this.mtaClasses = oop ? mtaClassRegistry() : null;

        this.binder.useBuiltins(builtinSymbols(environment));
        this.declareProject(project);
        this.declareAmbient(ambient);
    }

    projectEnvironmentOf(name: string): ApiEnvironment | null {
        return this.projectEnvironments.get(name) ?? null;
    }

    get allowNil(): boolean {
        return this.mode === 'nonstrict';
    }

    declareModuleGlobal(symbol: SymbolInfo): void {
        this.binder.declareGlobal(symbol);
        this.declaredGlobals.set(symbol.name, symbol.position);
    }

    pushNarrowing(facts: ReadonlyMap<string, Type>): void {
        this.narrowings.push(new Map(facts));
    }

    get isNarrowed(): boolean {
        return this.narrowings.length > 0;
    }

    popNarrowing(): void {
        this.narrowings.pop();
    }

    forgetNarrowing(path: string): void {
        for (const frame of this.narrowings) {
            for (const key of [...frame.keys()]) {
                if (key === path || key.startsWith(`${path}.`) || path.startsWith(`${key}.`)) {
                    frame.delete(key);
                }
            }
        }
    }

    narrowedType(path: string): Type | null {
        for (let index = this.narrowings.length - 1; index >= 0; index -= 1) {
            const found = this.narrowings[index]?.get(path);

            if (found !== undefined) {
                return found;
            }
        }

        return null;
    }

    predeclareClass(info: ClassInfo): void {
        this.predeclared.set(info.name, info);
    }

    takePredeclaredClass(name: string): ClassInfo | null {
        const info = this.predeclared.get(name) ?? null;

        this.predeclared.delete(name);

        return info;
    }

    pendingDeclarationOf(name: string): string | null {
        const seen = new Set<string>();

        let current: ClassInfo | null = this.declarations.lookupClass(name);

        while (current !== null && !seen.has(current.name)) {
            if (this.predeclared.has(current.name)) {
                return current.name;
            }

            seen.add(current.name);
            current = current.superClass === null ? null : this.declarations.lookupClass(current.superClass);
        }

        return null;
    }

    awaitsDeclaration(name: string): boolean {
        return this.pendingDeclarationOf(name) !== null;
    }

    insideFunction(): boolean {
        return this.returnStack.length > 0;
    }

    isAmbientClass(name: string): boolean {
        return this.ambientClasses.has(name);
    }

    isAmbientInterface(name: string): boolean {
        return this.ambientInterfaces.has(name);
    }

    isAmbientEnum(name: string): boolean {
        return this.ambientEnums.has(name);
    }

    noteExternalReference(name: string, position: SourcePosition): void {
        if (!this.externalReferences.has(name)) {
            this.externalReferences.set(name, position);
        }
    }

    report(code: string, message: string, position: SourcePosition): void {
        this.push(code, message, position, 'error');
    }

    warn(code: string, message: string, position: SourcePosition): void {
        this.push(code, message, position, 'warning');
    }

    private push(code: string, message: string, position: SourcePosition, severity: DiagnosticSeverity): void {
        if (this.mode === 'nocheck') {
            return;
        }

        const key = `${code}|${position.offset}|${message}`;

        if (this.reported.has(key)) {
            return;
        }

        this.reported.add(key);
        this.diagnostics.push(createDiagnostic('checker', code, message, position, severity));
    }

    noteTypeParameters(names: readonly string[]): void {
        for (const name of names) {
            this.typeParameters.add(name);
        }
    }

    isTypeParameter(name: string): boolean {
        return this.typeParameters.has(name);
    }

    noteUnknownType(name: string, position: SourcePosition): void {
        if (!this.unknownTypes.has(name)) {
            this.unknownTypes.set(name, position);
        }
    }

    record(expression: Expression, type: Type): Type {
        this.types.set(expression, type);

        return type;
    }

    typeOf(expression: Expression): Type {
        return this.types.get(expression) ?? UNKNOWN_TYPE;
    }

    pushReturnType(type: Type | null): void {
        this.returnStack.push({ expected: type, inferred: [] });
    }

    popReturnType(): Type {
        const frame = this.returnStack.pop();

        if (frame === undefined || frame.inferred.length === 0) {
            return VOID_TYPE;
        }

        const tuples = frame.inferred.filter((type) => type.kind === 'tuple');

        const tupleSize = tuples[0]?.kind === 'tuple' ? tuples[0].elements.length : null;
        const sameTupleSize = tuples.length === frame.inferred.length && tuples.every((type) => type.kind === 'tuple' && type.elements.length === tupleSize);

        if (sameTupleSize) {
            const first = tuples[0];

            if (first?.kind === 'tuple') {
                const elements = first.elements.map((_, index) =>
                    createUnion(tuples.map((type) => type.kind === 'tuple' ? type.elements[index] ?? ANY_TYPE : ANY_TYPE)),
                );

                return createTuple(elements);
            }
        }

        return createUnion(frame.inferred);
    }

    currentReturnType(): Type | null {
        return this.returnStack[this.returnStack.length - 1]?.expected ?? null;
    }

    inferReturnType(type: Type): void {
        this.returnStack[this.returnStack.length - 1]?.inferred.push(widenInferred(type));
    }

    pushClassMethod(frame: ClassMethodFrame): void {
        this.methodStack.push(frame);
    }

    popClassMethod(): void {
        this.methodStack.pop();
    }

    currentClassMethod(): ClassMethodFrame | null {
        return this.methodStack[this.methodStack.length - 1] ?? null;
    }

    resolveAnnotation(annotation: TypeAnnotation | null): Type {
        if (annotation === null) {
            return ANY_TYPE;
        }

        if (annotation.kind === 'type-array') {
            return createArray(this.resolveAnnotation(annotation.element));
        }

        if (annotation.kind === 'type-optional') {
            return createOptional(this.resolveAnnotation(annotation.element));
        }

        if (annotation.kind === 'type-union') {
            return createUnion(annotation.options.map((option) => this.resolveAnnotation(option)));
        }

        if (annotation.kind === 'type-intersection') {
            const parts = annotation.parts.map((part) => this.resolveAnnotation(part));

            return mergeIntersection(this, parts, annotation.position);
        }

        if (annotation.kind === 'type-string-literal') {
            return createStringLiteral(annotation.value);
        }

        if (annotation.kind === 'type-boolean-literal') {
            return createBooleanLiteral(annotation.value);
        }

        if (annotation.kind === 'type-number-literal') {
            return createNumberLiteral(annotation.value);
        }

        if (annotation.kind === 'type-object') {
            const members = new Map<string, Type>();

            for (const member of annotation.members) {
                members.set(member.name, this.resolveAnnotation(member.annotation));
            }

            return createObjectType(members);
        }

        if (annotation.kind === 'type-tuple') {
            return createTuple(annotation.elements.map((element) => this.resolveAnnotation(element)));
        }

        if (annotation.kind === 'type-function') {
            const parameters = annotation.parameters.map((parameter) => this.resolveAnnotation(parameter));
            const optional = parameters.findIndex((parameter) => parameter.kind === 'optional');
            const minimum = optional === -1 ? parameters.length : optional;

            return createFunction(parameters, this.resolveAnnotation(annotation.returnType), minimum, annotation.isVariadic);
        }

        return this.resolveNamedAnnotation(annotation.name, annotation.typeArguments, annotation.position);
    }

    expectAssignable(source: Type, target: Type, position: SourcePosition, subject: string): void {
        if (isAssignable(source, target, { allowNil: this.allowNil })) {
            return;
        }

        const received = isLiteralType(target) || target.kind === 'union' ? source : widenLiteral(source);
        const message = `${subject} expects "${typeToString(target)}" but received "${typeToString(received)}".`;

        const hint = `${nilHint(source, target, this.mode)}${missingKeyHint(source, target)}`;

        this.report('check-type-mismatch', `${message}${hint}`, position);
    }

    private declareProject(project: ProjectDeclarations): void {
        for (const declaration of project.globals) {
            this.projectEnvironments.set(declaration.name, declaration.environment);

            if (isAvailableIn(declaration.environment, this.environment)) {
                const symbol = { name: declaration.name, type: descriptorToType(declaration.type), isLocal: false, position: PROJECT_POSITION };

                this.binder.declareGlobal(symbol);
            }
        }
    }

    private declareAmbient(ambient: AmbientDeclarations): void {
        for (const info of ambient.classes) {
            this.ambientClasses.add(info.name);
            this.declarations.declareClass(info);
            this.binder.declareGlobal({ name: info.name, type: createNamed(info.name), isLocal: false, position: info.position });
        }

        for (const info of ambient.interfaces) {
            this.ambientInterfaces.add(info.name);
            this.declarations.declareInterface(info);
        }

        for (const info of ambient.enums) {
            this.ambientEnums.add(info.name);
            this.declarations.declareEnum(info);
            this.binder.declareGlobal({ name: info.name, type: createNamed(info.name), isLocal: false, position: info.position });
        }

        for (const info of ambient.globals) {
            this.binder.declareGlobal({ name: info.name, type: info.type, isLocal: false, position: info.position });
        }

        for (const info of ambient.events) {
            this.declarations.declareEvent(info);
        }
    }

    private resolveMapAnnotation(typeArguments: readonly TypeAnnotation[], position: SourcePosition): Type {
        const [key, value] = typeArguments;

        if (key === undefined || value === undefined || typeArguments.length !== MAP_ARGUMENTS) {
            const message = `Type "${TABLE_ANNOTATION}" expects a key type and a value type but received ${typeArguments.length}.`;

            this.report('check-generic-arity', message, position);

            for (const argument of typeArguments) {
                this.resolveAnnotation(argument);
            }

            return TABLE_TYPE;
        }

        return createMap(this.resolveAnnotation(key), this.resolveAnnotation(value));
    }

    private resolveNamedAnnotation(name: string, typeArguments: readonly TypeAnnotation[], position: SourcePosition): Type {
        const builtin = BUILTIN_TYPES[name];

        if (builtin !== undefined) {
            if (name === TABLE_ANNOTATION && typeArguments.length > 0) {
                return this.resolveMapAnnotation(typeArguments, position);
            }

            if (typeArguments.length > 0) {
                this.report('check-generic-arity', `Type "${name}" does not accept type arguments.`, position);
            }

            return builtin;
        }

        const alias = this.binder.lookupAlias(name);

        if (alias === null) {
            this.noteUnknownType(name, position);

            return createNamed(name);
        }

        if (typeArguments.length !== alias.parameters.length) {
            const expected = alias.parameters.length === 1 ? '1 type argument' : `${alias.parameters.length} type arguments`;

            this.report('check-generic-arity', `Type "${name}" expects ${expected} but received ${typeArguments.length}.`, position);
        }

        const resolved = typeArguments.map((argument) => this.resolveAnnotation(argument));
        const substitutions = new Map(alias.parameters.map((parameter, index) => [parameter, resolved[index] ?? ANY_TYPE]));

        return substituteType(alias.type, substitutions);
    }
}
