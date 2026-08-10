import type { ApiEnvironment } from './api-declaration';
import { ANY, BOOLEAN, fn, named, STRING, type TypeDescriptor } from './type-descriptor';

export interface CatalogOverride {
    environment?: ApiEnvironment;
    type?: TypeDescriptor;
}

export const ELEMENT_TYPE_ALIASES: Readonly<Record<string, string>> = {
    MTASAObject: 'Object',
};

export const ELEMENT_TYPE_PARENTS: Readonly<Record<string, string>> = {
    Object: 'Element',
    Pickup: 'Element',
    Projectile: 'Element',
    Sound3D: 'Sound',
};

export const EXCLUDED_ELEMENT_TYPES: readonly string[] = ['connection', 'QueryHandle'];

export const EXCLUDED_APIS: readonly string[] = ['exports'];

export const CATALOG_OVERRIDES: Readonly<Record<string, CatalogOverride>> = {
    addEventHandler: { type: fn([STRING, named('Element'), ANY, BOOLEAN, STRING], BOOLEAN, 3) },
    removeEventHandler: { type: fn([STRING, named('Element'), ANY], BOOLEAN, 3) },
    triggerEvent: { type: fn([STRING, named('Element')], BOOLEAN, 2, true) },
    triggerServerEvent: { type: fn([STRING, named('Element')], BOOLEAN, 2, true) },
    unbindKey: { type: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1) },
};

export const OOP_CONSTRUCTOR_OVERRIDES: Readonly<Record<string, TypeDescriptor>> = {
    File: fn([STRING], named('File'), 1),
};
