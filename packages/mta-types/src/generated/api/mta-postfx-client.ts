import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, literal, NUMBER, unionOf } from '@mta-types/type-descriptor';

export const MTA_POSTFX_CLIENT: ApiCatalog = {
    getPostFXMode: fn([], NUMBER, 0),
    getPostFXValue: fn([unionOf([literal('Gamma'), literal('Brightness'), literal('Contrast'), literal('Saturation')])], NUMBER, 1),
    isPostFXEnabled: fn([unionOf([literal('Gamma'), literal('Brightness'), literal('Contrast'), literal('Saturation')])], BOOLEAN, 1),
};
