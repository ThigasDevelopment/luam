import { KNOWN_DECORATORS, type DecoratorDefinition } from '@compiler/checker/decorator-catalog';
import { typeToString, type Type } from '@compiler/checker/types';
import type { ClassDeclaration, ClassFieldDeclaration, ClassMethodDeclaration, Decorator } from '@compiler/parser/declaration-nodes';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { markdown, memberText } from '@lsp/features/declaration-shape';
import { decoratorDocumentation } from '@lsp/features/decorator-text';
import { toRange } from '@lsp/support/lsp-position';
import { annotationText } from '@lsp/symbols/signature-text';

const ANY_TYPE: Type = { kind: 'any' };

const MEMBER_LIMIT = 24;

const GENERATED_KINDS: Readonly<Record<string, string>> = {
    FluentSetter: 'fluent-setter',
    Lazy: 'lazy',
    Observable: 'observable',
    ToString: 'to-string',
    Equals: 'equals',
    Clone: 'clone',
    Serializable: 'serializable',
    Deserialize: 'deserialize',
};

interface DecoratorSite {
    decorator: Decorator;
    definition: DecoratorDefinition;
    statement: ClassDeclaration;
    field: ClassFieldDeclaration | null;
    method: ClassMethodDeclaration | null;
}

function containsDecorator(decorator: Decorator, offset: number): boolean {
    return offset >= decorator.position.offset && offset <= decorator.position.offset + decorator.name.length + 1;
}

function decoratorAt(decorators: readonly Decorator[], offset: number): Decorator | null {
    return decorators.find((decorator) => containsDecorator(decorator, offset)) ?? null;
}

function withDefinition(site: Omit<DecoratorSite, 'definition'>): DecoratorSite | null {
    const definition = KNOWN_DECORATORS.get(site.decorator.name);

    return definition === undefined ? null : { ...site, definition };
}

function siteIn(statement: ClassDeclaration, offset: number): DecoratorSite | null {
    const own = decoratorAt(statement.decorators, offset);

    if (own !== null) {
        return withDefinition({ decorator: own, statement, field: null, method: null });
    }

    for (const member of statement.members) {
        const decorator = decoratorAt(member.decorators, offset);

        if (decorator === null) {
            continue;
        }

        const field = member.kind === 'class-field' ? member : null;
        const method = member.kind === 'class-method' ? member : null;

        return withDefinition({ decorator, statement, field, method });
    }

    return null;
}

function siteAt(analysis: DocumentAnalysis, offset: number): DecoratorSite | null {
    for (const statement of analysis.program.body) {
        const site = statement.kind === 'class-declaration' ? siteIn(statement, offset) : null;

        if (site !== null) {
            return site;
        }
    }

    return null;
}

function matchesDecorator(name: string, member: ClassMethodDeclaration): boolean {
    const kind = GENERATED_KINDS[name];

    if (kind !== undefined) {
        return member.generated?.kind === kind;
    }

    if (name === 'Getter') {
        return member.generated === undefined && member.parameters.length === 0;
    }

    return name === 'Setter' && member.generated === undefined && member.parameters.length === 1;
}

function generatedFor(analysis: DocumentAnalysis, site: DecoratorSite): ClassMethodDeclaration[] {
    const generated = analysis.generatedMembers.get(site.statement) ?? [];
    const field = site.field;
    const scoped = field === null ? generated : generated.filter((member) => member.position.offset === field.position.offset);

    return scoped.filter((member) => matchesDecorator(site.definition.name, member));
}

function memberType(analysis: DocumentAnalysis, owner: string, member: string): Type {
    return analysis.declarations.lookupMember(owner, member)?.type ?? ANY_TYPE;
}

function methodSignature(analysis: DocumentAnalysis, statement: ClassDeclaration, member: ClassMethodDeclaration): string {
    const registered = memberType(analysis, statement.name, member.name);
    const inferred = registered.kind === 'function' ? registered.returnType : ANY_TYPE;
    const returnType = member.returnAnnotation === null ? typeToString(inferred) : annotationText(member.returnAnnotation);
    const parameters = member.parameters.map((parameter) => `${parameter.name}: ${annotationText(parameter.annotation)}`).join(', ');

    return `${member.name}(${parameters}): ${returnType}`;
}

function fieldTypeText(analysis: DocumentAnalysis, statement: ClassDeclaration, field: ClassFieldDeclaration): string {
    return field.annotation === null ? typeToString(memberType(analysis, statement.name, field.name)) : annotationText(field.annotation);
}

function builderMethod(field: ClassFieldDeclaration): string {
    return `with${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
}

function builderShape(analysis: DocumentAnalysis, statement: ClassDeclaration): string {
    const name = `${statement.name}Builder`;
    const fields = statement.members.filter((member): member is ClassFieldDeclaration => member.kind === 'class-field');
    const visible = fields.slice(0, MEMBER_LIMIT);
    const lines = visible.map((field) => `    ${builderMethod(field)}(value: ${fieldTypeText(analysis, statement, field)}): ${name}`);

    if (fields.length > visible.length) {
        lines.push(`    # ${fields.length - visible.length} more`);
    }

    lines.push(`    build(): ${statement.name}`);

    return `class ${name} {\n${lines.join('\n')}\n}`;
}

function decoratedText(analysis: DocumentAnalysis, site: DecoratorSite): string {
    const name = site.field?.name ?? site.method?.name ?? null;
    const member = name === null ? undefined : analysis.index.membersOf(site.statement.name).find((entry) => entry.name === name);
    const target = member === undefined ? site.statement.name : memberText(member);

    return `@${site.definition.name}\n${target}`;
}

function shapeText(analysis: DocumentAnalysis, site: DecoratorSite): string {
    if (site.definition.name === 'Builder') {
        return builderShape(analysis, site.statement);
    }

    const generated = generatedFor(analysis, site);

    if (generated.length === 0) {
        return decoratedText(analysis, site);
    }

    return generated.map((member) => methodSignature(analysis, site.statement, member)).join('\n');
}

export function decoratorHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const site = siteAt(analysis, offset);

    if (site === null) {
        return null;
    }

    const value = `${markdown(shapeText(analysis, site))}\n\n${decoratorDocumentation(site.definition)}`;

    return { contents: { kind: 'markdown', value }, range: toRange(site.decorator.position, site.decorator.name.length + 1) };
}
