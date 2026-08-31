import type { Expression, Statement } from './ast';
import type { ClassMember } from './declaration-nodes';

export interface SourceSpan {
    start: number;
    end: number;
}

export type SpannedNode = Statement | ClassMember | Expression;

export type ErasureKind = 'annotation' | 'declaration';

export interface ErasureSpan extends SourceSpan {
    kind: ErasureKind;
}
