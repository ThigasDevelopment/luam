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
    isStatic: boolean;
}

export interface ClassMethodDeclaration extends NodeBase {
    kind: 'class-method';
    name: string;
    isAsync: boolean;
    isConstructor: boolean;
    isSynthetic: boolean;
    isStatic: boolean;
    typeParameters: string[];
    typeConstraints: (TypeAnnotation | null)[];
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
    body: Statement[];
    decorators: Decorator[];
    generated?: {
        kind: 'fluent-setter' | 'to-string' | 'equals' | 'clone' | 'serializable' | 'deserialize' | 'lazy' | 'observable' | 'validate' | 'matches';
        fields: ClassFieldDeclaration[];
        descriptor?: string;
    };
}

export type ClassMember = ClassFieldDeclaration | ClassMethodDeclaration;

export interface ClassDeclaration extends NodeBase {
    kind: 'class-declaration';
    name: string;
    typeParameters: string[];
    typeConstraints: (TypeAnnotation | null)[];
    superClass: string | null;
    superClassArguments: TypeAnnotation[];
    interfaces: string[];
    interfaceArguments: TypeAnnotation[][];
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
    typeParameters: string[];
    typeConstraints: (TypeAnnotation | null)[];
    superInterfaces: string[];
    members: InterfaceMember[];
}

export interface EnumMember extends NodeBase {
    name: string;
}

export interface EnumDeclaration extends NodeBase {
    kind: 'enum-declaration';
    name: string;
    isLocal: boolean;
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
    typeArguments: TypeAnnotation[];
    args: Expression[];
}

export type DeclarationStatement = ClassDeclaration | InterfaceDeclaration | EnumDeclaration;
