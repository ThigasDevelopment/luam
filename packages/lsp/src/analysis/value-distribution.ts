import { firstValueOf, valuesOf, type Type } from '@compiler/checker/types';
import type { Expression } from '@compiler/parser/ast';

export interface DistributedValue {
    value: Expression;
    type: Type | null;
    isFirst: boolean;
}

export function distributeValues(types: ReadonlyMap<Expression, Type>, values: readonly Expression[]): DistributedValue[] {
    const distributed: DistributedValue[] = [];

    values.forEach((value, index) => {
        const type = types.get(value) ?? null;

        if (index < values.length - 1) {
            distributed.push({ value, type: type === null ? null : firstValueOf(type), isFirst: true });

            return;
        }

        if (type === null) {
            distributed.push({ value, type: null, isFirst: true });

            return;
        }

        valuesOf(type).forEach((element, elementIndex) => {
            distributed.push({ value, type: element, isFirst: elementIndex === 0 });
        });
    });

    return distributed;
}
