import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type {
    ClassDeclaration,
    ClassMember,
    DeclarationStatement,
    EnumDeclaration,
    EventDeclaration,
    InterfaceDeclaration,
    InterfaceMember,
} from '@compiler/parser/declaration-nodes';

import { annotationType, signatureType } from '@lsp/symbols/annotation-type';

import {
    addReference,
    declareSymbol,
    locatePosition,
    type BlockContext,
    type CollectorState,
} from './collector-state';
import { collectAnnotation, collectExpression } from './expression-collector';
import { ROOT_SCOPE } from './scope-tree';
import { fieldText, parameterText, signatureText, variableText } from './signature-text';
import { collectFunctionScope } from './statement-collector';

const KEYWORD_LENGTHS: Readonly<Record<DeclarationStatement['kind'], number>> = {
    'class-declaration': 5,
    'interface-declaration': 9,
    'enum-declaration': 4,
};

function namePosition(state: CollectorState, statement: DeclarationStatement): SourcePosition {
    const offset = statement.position.offset + KEYWORD_LENGTHS[statement.kind];

    return locatePosition(state, offset, statement.name) ?? statement.position;
}

function collectSuperTypes(state: CollectorState, block: BlockContext, names: readonly string[], from: number): void {
    let cursor = from;

    for (const name of names) {
        const position = locatePosition(state, cursor, name);

        if (position === null) {
            continue;
        }

        addReference(state, name, 'type', position, block.scopeId);
        cursor = position.offset + name.length;
    }
}

function collectClassMember(state: CollectorState, block: BlockContext, owner: string, member: ClassMember): void {
    if (member.kind === 'class-field') {
        collectAnnotation(state, block, member.annotation);

        if (member.value !== null) {
            collectExpression(state, block, member.value);
        }

        const detail = member.annotation === null ? `field ${member.name}` : fieldText(member.name, member.annotation);
        const type = member.annotation === null ? null : annotationType(member.annotation);

        declareSymbol(state, ROOT_SCOPE, { name: member.name, kind: 'field', position: member.position, detail, container: owner, type });

        return;
    }

    const checked = state.checkerDeclarations.lookupMember(owner, member.name)?.type;
    const inferredReturn = checked?.kind === 'function' ? checked.returnType : null;
    const detail = signatureText(member.name, member.parameters, member.returnAnnotation, inferredReturn);

    const parameters = member.parameters.map(parameterText);

    declareSymbol(state, ROOT_SCOPE, {
        name: member.name,
        kind: 'method',
        position: member.position,
        detail,
        container: owner,
        parameters,
        type:
            member.returnAnnotation === null && checked?.kind === 'function'
                ? checked
                : signatureType(member.parameters, member.returnAnnotation),
        isSynthetic: member.isSynthetic,
    });

    if (member.isSynthetic) {
        return;
    }
    collectAnnotation(state, block, member.returnAnnotation);
    collectFunctionScope(state, block, {
        start: member.position.offset,
        end: block.end,
        parameters: member.parameters,
        body: member.body,
        selfType: owner,
        container: owner,
    });
}

function collectInterfaceMember(state: CollectorState, block: BlockContext, owner: string, member: InterfaceMember): void {
    if (member.kind === 'interface-field') {
        collectAnnotation(state, block, member.annotation);

        const detail = fieldText(member.name, member.annotation);

        declareSymbol(state, ROOT_SCOPE, {
            name: member.name,
            kind: 'field',
            position: member.position,
            detail,
            container: owner,
            type: annotationType(member.annotation),
        });

        return;
    }

    const detail = signatureText(member.name, member.parameters, member.returnAnnotation);

    const parameters = member.parameters.map(parameterText);
    const type = signatureType(member.parameters, member.returnAnnotation);

    declareSymbol(state, ROOT_SCOPE, { name: member.name, kind: 'method', position: member.position, detail, container: owner, parameters, type });
    collectAnnotation(state, block, member.returnAnnotation);

    for (const parameter of member.parameters) {
        collectAnnotation(state, block, parameter.annotation);
    }
}

function collectClass(state: CollectorState, block: BlockContext, statement: ClassDeclaration): void {
    const position = namePosition(state, statement);
    const extendsText = statement.superClass === null ? '' : ` extends ${statement.superClass}`;
    const implementsText = statement.interfaces.length === 0 ? '' : ` implements ${statement.interfaces.join(', ')}`;

    declareSymbol(state, ROOT_SCOPE, {
        name: statement.name,
        kind: 'class',
        position,
        detail: `class ${statement.name}${extendsText}${implementsText}`,
    });
    const names = statement.superClass === null ? statement.interfaces : [statement.superClass, ...statement.interfaces];

    collectSuperTypes(state, block, names, position.offset + statement.name.length);

    for (const member of statement.members) {
        collectClassMember(state, block, statement.name, member);
    }

    for (const member of state.generatedMembers.get(statement) ?? []) {
        collectClassMember(state, block, statement.name, member);
    }
}

function collectInterface(state: CollectorState, block: BlockContext, statement: InterfaceDeclaration): void {
    const position = namePosition(state, statement);
    const extendsText = statement.superInterfaces.length === 0 ? '' : ` extends ${statement.superInterfaces.join(', ')}`;

    declareSymbol(state, ROOT_SCOPE, { name: statement.name, kind: 'interface', position, detail: `interface ${statement.name}${extendsText}` });
    collectSuperTypes(state, block, statement.superInterfaces, position.offset + statement.name.length);

    for (const member of statement.members) {
        collectInterfaceMember(state, block, statement.name, member);
    }
}

function collectEnum(state: CollectorState, statement: EnumDeclaration): void {
    const position = namePosition(state, statement);

    declareSymbol(state, ROOT_SCOPE, { name: statement.name, kind: 'enum', position, detail: `${statement.isLocal ? 'local ' : ''}enum ${statement.name}` });

    statement.members.forEach((member, index) => {
        declareSymbol(state, ROOT_SCOPE, {
            name: member.name,
            kind: 'enum-member',
            position: member.position,
            detail: `${statement.name}.${member.name} = ${index}`,
            container: statement.name,
        });
    });
}

export function collectEvent(state: CollectorState, block: BlockContext, statement: EventDeclaration): void {
    const position = locatePosition(state, statement.position.offset, statement.name) ?? statement.position;

    for (const parameter of statement.parameters) {
        collectAnnotation(state, block, parameter.annotation);
    }

    collectAnnotation(state, block, statement.returnAnnotation);

    const detail = `event '${statement.name}'(${statement.parameters.map(parameterText).join(', ')})`;

    declareSymbol(state, ROOT_SCOPE, { name: statement.name, kind: 'event', position, detail });
}

export function collectDeclaration(state: CollectorState, block: BlockContext, statement: DeclarationStatement): void {
    if (statement.kind === 'class-declaration') {
        collectClass(state, block, statement);

        return;
    }

    if (statement.kind === 'interface-declaration') {
        collectInterface(state, block, statement);

        return;
    }

    collectEnum(state, statement);
}
