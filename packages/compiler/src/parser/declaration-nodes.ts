import type { Expression, NodeBase, Parameter, Statement, TypeAnnotation } from './ast';

export interface Decorator extends NodeBase {
    kind: 'decorator';
    name: string;
}

export interface ClassFieldDeclaration extends NodeBase {
    kind: 'class-field';
    name: string;
    annotation: TypeAnnotation | null;
    value: Expression | null;
    decorators: Decorator[];
}

export interface ClassMethodDeclaration extends NodeBase {
    kind: 'class-method';
    name: string;
    isConstructor: boolean;
    isSynthetic: boolean;
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
    body: Statement[];
    decorators: Decorator[];
    generated?: {
        kind: 'fluent-setter' | 'to-string' | 'equals' | 'clone' | 'serializable' | 'deserialize' | 'lazy' | 'observable';
        fields: ClassFieldDeclaration[];
    };
}

export type ClassMember = ClassFieldDeclaration | ClassMethodDeclaration;

export interface ClassDeclaration extends NodeBase {
    kind: 'class-declaration';
    name: string;
    superClass: string | null;
    interfaces: string[];
    members: ClassMember[];
    decorators: Decorator[];
}

export interface InterfaceFieldSignature extends NodeBase {
    kind: 'interface-field';
    name: string;
    annotation: TypeAnnotation;
}

export interface InterfaceMethodSignature extends NodeBase {
    kind: 'interface-method';
    name: string;
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
}

export type InterfaceMember = InterfaceFieldSignature | InterfaceMethodSignature;

export interface InterfaceDeclaration extends NodeBase {
    kind: 'interface-declaration';
    name: string;
    superInterfaces: string[];
    members: InterfaceMember[];
}

export interface EnumMember extends NodeBase {
    name: string;
}

export interface EnumDeclaration extends NodeBase {
    kind: 'enum-declaration';
    name: string;
    members: EnumMember[];
}

export interface EventDeclaration extends NodeBase {
    kind: 'event-declaration';
    name: string;
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
}

export interface NewExpression extends NodeBase {
    kind: 'new-expression';
    className: string;
    args: Expression[];
}

export type DeclarationStatement = ClassDeclaration | InterfaceDeclaration | EnumDeclaration;
