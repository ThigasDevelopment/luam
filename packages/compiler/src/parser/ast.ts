import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { TemplateSegment } from '@compiler/lexer/token';

import type { ClassDeclaration, EnumDeclaration, InterfaceDeclaration, NewExpression } from './declaration-nodes';

export interface NodeBase {
    position: SourcePosition;
}

export interface TypeNameAnnotation extends NodeBase {
    kind: 'type-name';
    name: string;
    typeArguments: TypeAnnotation[];
}

export interface TypeArrayAnnotation extends NodeBase {
    kind: 'type-array';
    element: TypeAnnotation;
}

export interface TypeOptionalAnnotation extends NodeBase {
    kind: 'type-optional';
    element: TypeAnnotation;
}

export interface TypeUnionAnnotation extends NodeBase {
    kind: 'type-union';
    options: TypeAnnotation[];
}

export interface TypeFunctionAnnotation extends NodeBase {
    kind: 'type-function';
    parameters: TypeAnnotation[];
    isVariadic: boolean;
    returnType: TypeAnnotation | null;
}

export type TypeAnnotation =
    | TypeNameAnnotation
    | TypeArrayAnnotation
    | TypeOptionalAnnotation
    | TypeUnionAnnotation
    | TypeFunctionAnnotation;

export interface Parameter extends NodeBase {
    name: string;
    annotation: TypeAnnotation | null;
    isVararg: boolean;
}

export interface NilLiteral extends NodeBase {
    kind: 'nil-literal';
}

export interface BooleanLiteral extends NodeBase {
    kind: 'boolean-literal';
    value: boolean;
}

export interface NumberLiteral extends NodeBase {
    kind: 'number-literal';
    raw: string;
    value: number;
}

export interface StringLiteral extends NodeBase {
    kind: 'string-literal';
    value: string;
}

export interface TemplateLiteral extends NodeBase {
    kind: 'template-literal';
    segments: TemplateSegment[];
}

export interface VarargExpression extends NodeBase {
    kind: 'vararg-expression';
}

export interface Identifier extends NodeBase {
    kind: 'identifier';
    name: string;
}

export interface MemberExpression extends NodeBase {
    kind: 'member-expression';
    object: Expression;
    property: string;
}

export interface IndexExpression extends NodeBase {
    kind: 'index-expression';
    object: Expression;
    index: Expression;
}

export interface CallExpression extends NodeBase {
    kind: 'call-expression';
    callee: Expression;
    method: string | null;
    args: Expression[];
}

export interface FunctionExpression extends NodeBase {
    kind: 'function-expression';
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
    body: Statement[];
}

export interface TableField extends NodeBase {
    key: Expression | null;
    name: string | null;
    value: Expression;
}

export interface TableExpression extends NodeBase {
    kind: 'table-expression';
    fields: TableField[];
}

export interface BinaryExpression extends NodeBase {
    kind: 'binary-expression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface UnaryExpression extends NodeBase {
    kind: 'unary-expression';
    operator: string;
    operand: Expression;
}

export interface GroupExpression extends NodeBase {
    kind: 'group-expression';
    expression: Expression;
}

export type Expression =
    | NilLiteral
    | BooleanLiteral
    | NumberLiteral
    | StringLiteral
    | TemplateLiteral
    | VarargExpression
    | Identifier
    | MemberExpression
    | IndexExpression
    | CallExpression
    | FunctionExpression
    | TableExpression
    | BinaryExpression
    | UnaryExpression
    | GroupExpression
    | NewExpression;

export interface VariableDeclarator extends NodeBase {
    name: string;
    annotation: TypeAnnotation | null;
}

export interface LocalStatement extends NodeBase {
    kind: 'local-statement';
    declarations: VariableDeclarator[];
    values: Expression[];
}

export interface AssignmentStatement extends NodeBase {
    kind: 'assignment-statement';
    operator: string;
    targets: Expression[];
    values: Expression[];
}

export interface CallStatement extends NodeBase {
    kind: 'call-statement';
    expression: CallExpression;
}

export interface FunctionDeclaration extends NodeBase {
    kind: 'function-declaration';
    name: Identifier | MemberExpression;
    isLocal: boolean;
    isExported: boolean;
    isMethod: boolean;
    parameters: Parameter[];
    returnAnnotation: TypeAnnotation | null;
    body: Statement[];
}

export interface ReturnStatement extends NodeBase {
    kind: 'return-statement';
    values: Expression[];
}

export interface BreakStatement extends NodeBase {
    kind: 'break-statement';
}

export interface ContinueStatement extends NodeBase {
    kind: 'continue-statement';
}

export interface DoStatement extends NodeBase {
    kind: 'do-statement';
    body: Statement[];
}

export interface WhileStatement extends NodeBase {
    kind: 'while-statement';
    condition: Expression;
    body: Statement[];
}

export interface RepeatStatement extends NodeBase {
    kind: 'repeat-statement';
    body: Statement[];
    condition: Expression;
}

export interface IfClause extends NodeBase {
    condition: Expression;
    body: Statement[];
}

export interface IfStatement extends NodeBase {
    kind: 'if-statement';
    clauses: IfClause[];
    alternate: Statement[] | null;
}

export interface NumericForStatement extends NodeBase {
    kind: 'numeric-for-statement';
    variable: VariableDeclarator;
    start: Expression;
    limit: Expression;
    step: Expression | null;
    body: Statement[];
}

export interface GenericForStatement extends NodeBase {
    kind: 'generic-for-statement';
    variables: VariableDeclarator[];
    iterators: Expression[];
    body: Statement[];
}

export interface TypeAliasStatement extends NodeBase {
    kind: 'type-alias-statement';
    name: string;
    typeParameters: string[];
    annotation: TypeAnnotation;
}

export interface DeclareStatement extends NodeBase {
    kind: 'declare-statement';
    name: string;
    annotation: TypeAnnotation;
}

export type Statement =
    | LocalStatement
    | AssignmentStatement
    | CallStatement
    | FunctionDeclaration
    | ReturnStatement
    | BreakStatement
    | ContinueStatement
    | DoStatement
    | WhileStatement
    | RepeatStatement
    | IfStatement
    | NumericForStatement
    | GenericForStatement
    | TypeAliasStatement
    | DeclareStatement
    | ClassDeclaration
    | InterfaceDeclaration
    | EnumDeclaration;

export interface Program extends NodeBase {
    kind: 'program';
    body: Statement[];
}
