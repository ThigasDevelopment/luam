import { firstValueOf, valuesOf, type Type } from './types';

export function distributeValueTypes(types: readonly Type[]): Type[] {
    const distributed: Type[] = [];

    types.forEach((type, index) => {
        if (index === types.length - 1) {
            distributed.push(...valuesOf(type));

            return;
        }

        distributed.push(firstValueOf(type));
    });

    return distributed;
}
