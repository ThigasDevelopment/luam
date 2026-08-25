import { REPORTING_HUES, SYNTAX_HUES as PALETTE_SYNTAX_HUES, type Hue } from '@theme/palette';
import type { ConfusionSet, Role } from '@theme/role-types';
import { ROLES } from '@theme/roles';

export const CONFUSION_SET_IDS: readonly ConfusionSet[] = [
    'callable',
    'declaration-name',
    'identifier',
    'keyword',
    'literal',
    'type',
    'punctuation',
    'comment',
];

export const CONTRAST_FLOORS = {
    body: 4.5,
    ambient: 3,
    step: 1.35,
} as const;

export const SYNTAX_HUES: readonly Hue[] = PALETTE_SYNTAX_HUES;

export const ERASED_HUE: Hue = 'cyan';

export const NEUTRAL_ROLES: readonly string[] = [
    'keyword',
    'keyword.modifier',
    'directive.environment',
    'name.type',
    'name.inherited',
    'punctuation',
    'comment',
];

export const REPORTING_ONLY_HUES: readonly Hue[] = REPORTING_HUES;

export const ERASED_STYLE: Role['style'] = 'italic';

export const INTRODUCER_PAIRS: readonly (readonly [string, string])[] = [
    ['keyword', 'name.type'],
    ['keyword', 'identifier.local'],
    ['keyword', 'call.function'],
    ['keyword', 'call.constructor'],
    ['keyword.modifier', 'name.inherited'],
    ['keyword.modifier', 'name.type'],
];

function membersOf(set: ConfusionSet): readonly Role[] {
    return ROLES.filter((role) => role.set === set);
}

export const CONFUSION_SETS: Readonly<Record<ConfusionSet, readonly Role[]>> = Object.fromEntries(
    CONFUSION_SET_IDS.map((set) => [set, membersOf(set)]),
) as Readonly<Record<ConfusionSet, readonly Role[]>>;

export function floorFor(role: Role): number {
    return role.ambient ? CONTRAST_FLOORS.ambient : CONTRAST_FLOORS.body;
}

export function differsOnlyByStep(first: Role, second: Role): boolean {
    return first.hue === second.hue && first.style === second.style && first.step !== second.step;
}

export function pairsIn(set: ConfusionSet): (readonly [Role, Role])[] {
    const members = CONFUSION_SETS[set];
    const pairs: (readonly [Role, Role])[] = [];

    for (let outer = 0; outer < members.length; outer += 1) {
        for (let inner = outer + 1; inner < members.length; inner += 1) {
            pairs.push([members[outer] as Role, members[inner] as Role] as const);
        }
    }

    return pairs;
}
