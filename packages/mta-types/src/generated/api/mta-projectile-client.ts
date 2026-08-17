import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PROJECTILE_CLIENT: ApiCatalog = {
    createProjectile: fn(
        [named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER],
        named('Projectile'),
        2,
    ),
    detonateSatchels: fn([], BOOLEAN, 0),
    getProjectileCounter: fn([named('Projectile')], NUMBER, 1),
    getProjectileCreator: fn([named('Projectile')], named('Element'), 1),
    getProjectileForce: fn([named('Projectile')], NUMBER, 1),
    getProjectileTarget: fn([named('Projectile')], named('Element'), 1),
    getProjectileType: fn([named('Projectile')], NUMBER, 1),
    setProjectileCounter: fn([named('Projectile'), NUMBER], BOOLEAN, 2),
};
