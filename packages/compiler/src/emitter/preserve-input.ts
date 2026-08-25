import type { ExpressionTypes } from './preserve-guards';

import type { Comment } from '@compiler/lexer/comment-scanner';
import type { Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import type { ErasureSpan, SourceSpan, SpannedNode } from '@compiler/parser/source-metadata';

export interface PreserveInput {
    source: string;
    program: Program;
    erasures: readonly ErasureSpan[];
    comments: readonly Comment[];
    spans: ReadonlyMap<SpannedNode, SourceSpan>;
    types: ExpressionTypes;
    references: ReadonlySet<string>;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
    development: boolean;
}
