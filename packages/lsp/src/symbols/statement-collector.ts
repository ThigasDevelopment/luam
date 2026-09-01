import { ANY_TYPE, createNamed, renameRecord, typeToString, widenInferred, type FunctionType } from '@compiler/checker/types';
import type {
    AssignmentStatement,
    DeclareStatement,
    Expression,
    FunctionDeclaration,
    GenericForStatement,
    GlobalStatement,
    IfStatement,
    LocalStatement,
    NumericForStatement,
    Parameter,
    Statement,
    TypeAliasStatement,
} from '@compiler/parser/ast';
import type { EventDeclaration } from '@compiler/parser/declaration-nodes';

import { positionAt } from '@lsp/support/source-text';
import { annotationType, signatureType } from '@lsp/symbols/annotation-type';

import {
    addReference,
    declareGlobalTarget,
    declareSymbol,
    isGlobalTarget,
    locatePosition,
    typeOf,
    type BlockContext,
    type CollectorState,
} from './collector-state';
import { collectDeclaration, collectEvent } from './declaration-collector';
import { collectAnnotation, collectExpression } from './expression-collector';
import { ROOT_SCOPE } from './scope-tree';
import { annotationText, assignedText, parameterText, signatureText, variableText } from './signature-text';
import { valueBytes, valueText } from './value-text';

export interface FunctionScopeInput {
    start: number;
    end: number;
    parameters: readonly Parameter[];
    type?: FunctionType;
    body: readonly Statement[];
    selfType: string | null;
    container: string | null;
    owner?: string | null;
}

export function collectBlock(state: CollectorState, block: BlockContext, start: number, body: readonly Statement[]): void {
    const scopeId = state.scopes.open(block.scopeId, start);

    collectStatements(state, { scopeId, end: block.end, container: block.container }, body);
    state.scopes.close(scopeId, block.end);
}

export function collectFunctionScope(state: CollectorState, block: BlockContext, input: FunctionScopeInput): void {
    const scopeId = state.scopes.open(block.scopeId, input.start, { name: input.owner ?? null });
    const inner: BlockContext = { scopeId, end: input.end, container: input.container };

    if (input.selfType !== null) {
        const position = positionAt(state.starts, input.start);
        const detail = `self: ${input.selfType}`;

        declareSymbol(state, scopeId, { name: 'self', kind: 'parameter', position, detail, type: createNamed(input.selfType) });
    }

    let parameterIndex = 0;

    for (const parameter of input.parameters) {
        collectAnnotation(state, inner, parameter.annotation);

        if (parameter.name.length > 0) {
            const inferred = parameter.isVararg ? ANY_TYPE : (input.type?.parameters[parameterIndex] ?? ANY_TYPE);
            const type = parameter.annotation === null ? inferred : annotationType(parameter.annotation);
            const detail = variableText('parameter', parameter.name, parameter.annotation, typeToString(type));

            declareSymbol(state, scopeId, { name: parameter.name, kind: 'parameter', position: parameter.position, detail, type });
        }

        if (!parameter.isVararg) {
            parameterIndex += 1;
        }
    }

    collectStatements(state, inner, input.body);
    state.scopes.close(scopeId, input.end);
}

function collectLocal(state: CollectorState, block: BlockContext, statement: LocalStatement): void {
    for (const value of statement.values) {
        collectExpression(state, block, value);
    }

    statement.declarations.forEach((declarator, index) => {
        collectAnnotation(state, block, declarator.annotation);

        const value = statement.values[index];
        const inferredType = value === undefined ? null : typeOf(state, value);
        const inferred = inferredType === null ? null : widenInferred(inferredType);
        const type = declarator.annotation === null ? inferred : annotationType(declarator.annotation);
        const declared = variableText('local', declarator.name, declarator.annotation, inferred === null ? null : typeToString(inferred));
        const detail = assignedText(declared, valueText(state.text, value, statement.values.length === 1), valueBytes(value));

        declareSymbol(state, block.scopeId, { name: declarator.name, kind: 'local', position: declarator.position, detail, type });
    });
}

function collectAssignment(state: CollectorState, block: BlockContext, statement: AssignmentStatement): void {
    for (const value of statement.values) {
        collectExpression(state, block, value);
    }

    for (const target of statement.targets) {
        collectExpression(state, block, target);

        if (target.kind === 'identifier' && isGlobalTarget(state, block.scopeId, target.name, target.position.offset)) {
            declareGlobalTarget(state, target.name, target.position, `global ${target.name}`);
        }
    }
}

function collectFunctionName(state: CollectorState, block: BlockContext, statement: FunctionDeclaration): string | null {
    const name = statement.name;

    if (name.kind === 'identifier') {
        const checked = typeOf(state, name);
        const inferredReturn = checked?.kind === 'function' ? checked.returnType : null;
        const detail = signatureText(name.name, statement.parameters, statement.returnAnnotation, inferredReturn, statement.typeParameters);
        const scopeId = statement.isLocal ? block.scopeId : ROOT_SCOPE;

        const parameters = statement.parameters.map(parameterText);
        const type =
            statement.returnAnnotation === null && checked?.kind === 'function'
                ? checked
                : signatureType(statement.parameters, statement.returnAnnotation);

        declareSymbol(state, scopeId, { name: name.name, kind: 'function', position: name.position, detail, parameters, type });
        addReference(state, name.name, 'value', name.position, block.scopeId);

        return null;
    }

    collectExpression(state, block, name.object);

    const position = locatePosition(state, name.position.offset + 1, name.property);

    if (position !== null) {
        addReference(state, name.property, 'member', position, block.scopeId);
    }

    return name.object.kind === 'identifier' ? name.object.name : null;
}

function collectFunctionDeclaration(state: CollectorState, block: BlockContext, statement: FunctionDeclaration): void {
    const owner = collectFunctionName(state, block, statement);

    collectAnnotation(state, block, statement.returnAnnotation);
    collectFunctionScope(state, block, {
        start: statement.position.offset,
        end: block.end,
        parameters: statement.parameters,
        body: statement.body,
        selfType: statement.isMethod ? owner : null,
        container: block.container,
        owner: statement.name.kind === 'identifier' ? statement.name.name : statement.name.property,
    });
}

function collectIf(state: CollectorState, block: BlockContext, statement: IfStatement): void {
    for (const clause of statement.clauses) {
        collectExpression(state, block, clause.condition);
        collectBlock(state, block, clause.position.offset, clause.body);
    }

    if (statement.alternate !== null) {
        collectBlock(state, block, alternateStart(statement), statement.alternate);
    }
}

function alternateStart(statement: IfStatement): number {
    const clause = statement.clauses[statement.clauses.length - 1];

    if (clause === undefined) {
        return statement.position.offset;
    }

    return (clause.body[clause.body.length - 1]?.position.offset ?? clause.position.offset) + 1;
}

function collectNumericFor(state: CollectorState, block: BlockContext, statement: NumericForStatement): void {
    collectExpression(state, block, statement.start);
    collectExpression(state, block, statement.limit);

    if (statement.step !== null) {
        collectExpression(state, block, statement.step);
    }

    const scopeId = state.scopes.open(block.scopeId, statement.position.offset);
    const inner: BlockContext = { scopeId, end: block.end, container: block.container };
    const detail = variableText('local', statement.variable.name, statement.variable.annotation, 'number');

    declareSymbol(state, scopeId, { name: statement.variable.name, kind: 'local', position: statement.variable.position, detail });
    collectStatements(state, inner, statement.body);
    state.scopes.close(scopeId, block.end);
}

function collectGenericFor(state: CollectorState, block: BlockContext, statement: GenericForStatement): void {
    for (const iterator of statement.iterators) {
        collectExpression(state, block, iterator);
    }

    const scopeId = state.scopes.open(block.scopeId, statement.position.offset);
    const inner: BlockContext = { scopeId, end: block.end, container: block.container };

    for (const variable of statement.variables) {
        collectAnnotation(state, inner, variable.annotation);

        const detail = variableText('local', variable.name, variable.annotation, null);

        declareSymbol(state, scopeId, { name: variable.name, kind: 'local', position: variable.position, detail });
    }

    collectStatements(state, inner, statement.body);
    state.scopes.close(scopeId, block.end);
}

function collectTypeAlias(state: CollectorState, block: BlockContext, statement: TypeAliasStatement): void {
    const position = locatePosition(state, statement.position.offset + 4, statement.name);

    collectAnnotation(state, block, statement.annotation);

    if (position !== null) {
        const resolved = annotationType(statement.annotation);
        const type = statement.annotation.kind === 'type-object' ? renameRecord(resolved, statement.name) : resolved;

        const parameters = statement.typeParameters.length === 0 ? '' : `<${statement.typeParameters.join(', ')}>`;
        const detail = `type ${statement.name}${parameters} = ${annotationText(statement.annotation)}`;

        declareSymbol(state, ROOT_SCOPE, { name: statement.name, kind: 'type-alias', position, detail, type });
    }
}

function collectDeclare(state: CollectorState, block: BlockContext, statement: DeclareStatement): void {
    const position = locatePosition(state, statement.position.offset + 7, statement.name);

    collectAnnotation(state, block, statement.annotation);

    if (position !== null) {
        const detail = variableText('declare', statement.name, statement.annotation, null);
        const type = annotationType(statement.annotation);

        declareSymbol(state, ROOT_SCOPE, { name: statement.name, kind: 'global', position, detail, type });
    }
}

function collectGlobalDeclaration(state: CollectorState, block: BlockContext, statement: GlobalStatement): void {
    const declaration = statement.declaration;
    const position = locatePosition(state, statement.position.offset, declaration.name);

    collectAnnotation(state, block, declaration.annotation);

    for (const value of statement.values) {
        collectExpression(state, block, value);
    }

    if (position !== null) {
        const detail = variableText('', declaration.name, declaration.annotation, null).trimStart();
        const type = annotationType(declaration.annotation);

        declareSymbol(state, ROOT_SCOPE, { name: declaration.name, kind: 'global', position, detail, type });
    }
}

function collectStatement(state: CollectorState, block: BlockContext, statement: Statement): void {
    if (statement.kind === 'global-statement') {
        collectGlobalDeclaration(state, block, statement);
    } else if (statement.kind === 'local-statement') {
        collectLocal(state, block, statement);
    } else if (statement.kind === 'assignment-statement') {
        collectAssignment(state, block, statement);
    } else if (statement.kind === 'call-statement') {
        collectExpression(state, block, statement.expression);
    } else if (statement.kind === 'function-declaration') {
        collectFunctionDeclaration(state, block, statement);
    } else if (statement.kind === 'return-statement') {
        for (const value of statement.values) {
            collectExpression(state, block, value);
        }
    } else if (statement.kind === 'do-statement') {
        collectBlock(state, block, statement.position.offset, statement.body);
    } else if (statement.kind === 'while-statement') {
        collectExpression(state, block, statement.condition);
        collectBlock(state, block, statement.position.offset, statement.body);
    } else if (statement.kind === 'repeat-statement') {
        collectRepeat(state, block, statement.position.offset, statement.body, statement.condition);
    } else if (statement.kind === 'if-statement') {
        collectIf(state, block, statement);
    } else if (statement.kind === 'numeric-for-statement') {
        collectNumericFor(state, block, statement);
    } else if (statement.kind === 'generic-for-statement') {
        collectGenericFor(state, block, statement);
    } else if (statement.kind === 'type-alias-statement') {
        collectTypeAlias(state, block, statement);
    } else if (statement.kind === 'declare-statement') {
        collectDeclare(state, block, statement);
    } else if (statement.kind === 'event-declaration') {
        collectEvent(state, block, statement);
    } else if (statement.kind !== 'break-statement' && statement.kind !== 'continue-statement') {
        collectDeclaration(state, block, statement);
    }
}

function collectRepeat(
    state: CollectorState,
    block: BlockContext,
    start: number,
    body: readonly Statement[],
    condition: Expression,
): void {
    const scopeId = state.scopes.open(block.scopeId, start);
    const inner: BlockContext = { scopeId, end: block.end, container: block.container };

    collectStatements(state, inner, body);
    collectExpression(state, inner, condition);
    state.scopes.close(scopeId, block.end);
}

export function collectStatements(state: CollectorState, block: BlockContext, statements: readonly Statement[]): void {
    statements.forEach((statement, index) => {
        const next = statements[index + 1];
        const end = next === undefined ? block.end : next.position.offset;

        collectStatement(state, { scopeId: block.scopeId, end, container: block.container }, statement);
    });
}
