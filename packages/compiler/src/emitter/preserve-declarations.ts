import { escapeStringLiteral } from './escape';
import type { HybridSourceEdit } from './hybrid-source-map';
import { blankSpan, longComment } from './preserve-comments';
import { builderClassText, injectedMembersText } from './preserve-decorators';
import { isPreservableExpression } from './preserve-guards';
import type { PreserveInput } from './preserve-input';

import type { ClassDeclaration, ClassMember, ClassMethodDeclaration, Decorator, EnumDeclaration } from '@compiler/parser/declaration-nodes';
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
    return !isLazyField(member) && (member.kind === 'class-method' || member.value !== null);
}

function isLazyField(member: ClassMember): boolean {
    return member.kind === 'class-field' && member.decorators.some((decorator) => decorator.name === 'Lazy');
}

function isLowered(input: PreserveInput, statement: ClassDeclaration): boolean {
    const generated = input.generatedMembers.get(statement)?.length ?? 0;
    const decorated = statement.decorators.length > 0 || generated > 0 || statement.members.some((member) => member.decorators.length > 0);

    if (decorated && !input.development) {
        return true;
    }

    return statement.members.some(
        (member) => member.kind === 'class-field' && member.value !== null && !isPreservableExpression(member.value, input.types),
    );
}

function decoratorCommentEdits(statement: ClassDeclaration): HybridSourceEdit[] {
    const firstByLine = new Map<number, number>();
    const note = (position: Decorator['position']): void => {
        const existing = firstByLine.get(position.line);

        if (existing === undefined || position.offset < existing) {
            firstByLine.set(position.line, position.offset);
        }
    };

    for (const decorator of statement.decorators) {
        note(decorator.position);
    }

    for (const member of statement.members) {
        if (!isKept(member)) {
            continue;
        }

        for (const decorator of member.decorators) {
            note(decorator.position);
        }
    }

    return [...firstByLine.values()].map((offset) => ({ start: offset, end: offset, replacement: '--' }));
}

export function classEdits(input: PreserveInput, statement: ClassDeclaration, spans: DeclarationSpans): HybridSourceEdit[] | null {
    const { source } = input;

    if (isLowered(input, statement)) {
        return null;
    }

    const header = classHeaderEdit(source, statement);

    if (header === null) {
        return null;
    }

    const injected = input.development ? injectedMembersText(input, statement) : null;
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
            const text = source.slice(span.start, end);

            edits.push({ start: span.start, end, replacement: isLazyField(member) ? longComment(text) : blankSpan(text) });

            continue;
        }

        if (member.kind === 'class-method') {
            const self = selfEdit(source, member, span);

            if (self === null) {
                return null;
            }

            edits.push(self);
        }

        if (separator === null && (member !== kept[kept.length - 1] || injected !== null)) {
            edits.push({ start: span.end, end: span.end, replacement: ',' });
        }
    }

    edits.push(...decoratorCommentEdits(statement));

    if (injected !== null) {
        const brace = source.lastIndexOf('}', limit);

        if (brace <= spans.span.start) {
            return null;
        }

        edits.push({ start: brace, end: brace, replacement: `${injected} ` });
    }

    const builder = input.development ? builderClassText(input, statement) : null;

    if (builder !== null) {
        edits.push({ start: limit, end: limit, replacement: ` ${builder}` });
    }

    return edits;
}
