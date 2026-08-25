import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CLOTHES_SHARED: ApiCatalog = {
    addClothingModel: fn([STRING, STRING, NUMBER], BOOLEAN, 3),
    getBodyPartName: fn([NUMBER], STRING, 1),
    getClothesByTypeIndex: fn([NUMBER, NUMBER], tupleOf([STRING, STRING]), 2),
    getClothesTypeName: fn([NUMBER], STRING, 1),
    getTypeIndexFromClothes: fn([STRING, STRING], tupleOf([NUMBER, NUMBER]), 2),
};
