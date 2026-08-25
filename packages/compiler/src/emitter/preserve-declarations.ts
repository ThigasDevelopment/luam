import { escapeStringLiteral } from './escape';
import type { HybridSourceEdit } from './hybrid-source-map';
import { blankSpan } from './preserve-comments';
import { isPreservableExpression, type ExpressionTypes } from './preserve-guards';

import type { ClassDeclaration, ClassMember, ClassMethodDeclaration, EnumDeclaration } from '@compiler/parser/declaration-nodes';
import type { SourceSpan, SpannedNode } from '@compiler/parser/source-metadata';

const NAME = '[A-Za-z_][A-Za-z0-9_]*';

const ENUM_HEADER = new RegExp(`^enum[ \t]+${NAME}`);

const CLASS_HEADER = new RegExp(
    `^class[ \t]+${NAME}[ \t]*(?:extends[ \t]+${NAME}[ \t]*)?(?:implements[ \t]+${NAME}(?:[ \t]*,[ \t]*${NAME})*[ \t]*)?\{`,
);

export interface DeclarationSpans {
    span: SourceSpan;
    members: ReadonlyMap<SpannedNode, SourceSpan>;
}

function quoted(value: string): string {
    return `'${escapeStringLiteral(value)}'`;
}

function separatorAt(source: string, start: number, limit: number): number | null {
    const gap = source.slice(start, limit);
    const offset = gap.length - gap.trimStart().length;
    const character = gap[offset];

    return character === ';' || character === ',' ? start + offset : null;
}

export function enumEdits(source: string, statement: EnumDeclaration): HybridSourceEdit[] | null {
    const start = statement.position.offset;
    const header = ENUM_HEADER.exec(source.slice(start));

    if (header === null) {
        return null;
    }

    const edits: HybridSourceEdit[] = [{ start, end: start + header[0].length, replacement: `${statement.name} = enum` }];

    for (const member of statement.members) {
        edits.push({
            start: member.position.offset,
            end: member.position.offset + member.name.length,
            replacement: quoted(member.name),
        });
    }

    return edits;
}

function classHeaderEdit(source: string, statement: ClassDeclaration): HybridSourceEdit | null {
    const start = statement.position.offset;
    const header = CLASS_HEADER.exec(source.slice(start));

    if (header === null) {
        return null;
    }

    const name = quoted(statement.name);
    const inheritance = statement.superClass === null ? '' : ` :extends ${quoted(statement.superClass)}`;

    return { start, end: start + header[0].length, replacement: `class ${name}${inheritance} {` };
}

function selfEdit(source: string, member: ClassMethodDeclaration, span: SourceSpan): HybridSourceEdit | null {
    const first = member.parameters[0];

    if (first !== undefined) {
        return { start: first.position.offset, end: first.position.offset, replacement: 'self, ' };
    }

    const parenthesis = source.indexOf('(', span.start);

    if (parenthesis === -1 || parenthesis >= span.end) {
        return null;
    }

    return { start: parenthesis + 1, end: parenthesis + 1, replacement: 'self' };
}

function isKept(member: ClassMember): boolean {
    return member.kind === 'class-method' || member.value !== null;
}

function isLowered(statement: ClassDeclaration, generated: number, types: ExpressionTypes): boolean {
    if (statement.decorators.length > 0 || generated > 0) {
        return true;
    }

    return statement.members.some((member) => {
        if (member.decorators.length > 0) {
            return true;
        }

        return member.kind === 'class-field' && member.value !== null && !isPreservableExpression(member.value, types);
    });
}

export function classEdits(
    source: string,
    statement: ClassDeclaration,
    generated: number,
    types: ExpressionTypes,
    spans: DeclarationSpans,
): HybridSourceEdit[] | null {
    if (isLowered(statement, generated, types)) {
        return null;
    }

    const header = classHeaderEdit(source, statement);

    if (header === null) {
        return null;
    }

    const edits: HybridSourceEdit[] = [header];
    const kept = statement.members.filter(isKept);
    const limit = spans.span.end;

    for (const member of statement.members) {
        const span = spans.members.get(member);

        if (span === undefined) {
            return null;
        }

        const separator = separatorAt(source, span.end, limit);

        if (!isKept(member)) {
            const end = separator === null ? span.end : separator + 1;

            edits.push({ start: span.start, end, replacement: blankSpan(source.slice(span.start, end)) });

            continue;
        }

        if (member.kind === 'class-method') {
            const self = selfEdit(source, member, span);

            if (self === null) {
                return null;
            }

            edits.push(self);
        }

        if (separator === null && member !== kept[kept.length - 1]) {
            edits.push({ start: span.end, end: span.end, replacement: ',' });
        }
    }

    return edits;
}
