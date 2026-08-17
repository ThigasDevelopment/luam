import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, TABLE, tupleOf } from '@mta-types/type-descriptor';

export const MTA_COLLISION_SHARED: ApiCatalog = {
    addColPolygonPoint: fn([named('ColShape'), NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    createColCircle: fn([NUMBER, NUMBER, NUMBER], named('ColShape'), 3),
    createColCuboid: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('ColShape'), 6),
    createColPolygon: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('ColShape'), 8, true, undefined),
    createColRectangle: fn([NUMBER, NUMBER, NUMBER, NUMBER], named('ColShape'), 4),
    createColSphere: fn([NUMBER, NUMBER, NUMBER, NUMBER], named('ColShape'), 4),
    createColTube: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('ColShape'), 5),
    getColPolygonHeight: fn([named('ColShape')], tupleOf([NUMBER, NUMBER]), 1),
    getColPolygonPointPosition: fn([named('ColShape'), NUMBER], tupleOf([NUMBER, NUMBER]), 2),
    getColPolygonPoints: fn([named('ColShape')], TABLE, 1),
    getColShapeRadius: fn([named('ColShape')], NUMBER, 1),
    getColShapeSize: fn([named('ColShape')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getColShapeType: fn([named('ColShape')], NUMBER, 1),
    isInsideColShape: fn([named('ColShape'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    removeColPolygonPoint: fn([named('ColShape'), NUMBER], BOOLEAN, 2),
    setColPolygonHeight: fn([named('ColShape'), NUMBER, NUMBER], BOOLEAN, 3),
    setColPolygonPointPosition: fn([named('ColShape'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setColShapeRadius: fn([named('ColShape'), NUMBER], BOOLEAN, 2),
    setColShapeSize: fn([named('ColShape'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
};
