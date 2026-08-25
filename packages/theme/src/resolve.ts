import { CHROME, type Chrome } from '@theme/chrome';
import { tone, type Mode } from '@theme/palette';
import type { ResolvedRole, Role } from '@theme/role-types';
import { roleOf, ROLES } from '@theme/roles';

export function resolve(role: Role | string, mode: Mode): ResolvedRole {
    const entry = typeof role === 'string' ? roleOf(role) : role;

    return { foreground: tone(mode, entry.hue, entry.step), fontStyle: entry.style };
}

export function resolveAll(mode: Mode): ReadonlyMap<string, ResolvedRole> {
    return new Map(ROLES.map((entry) => [entry.id, resolve(entry, mode)]));
}

export function chrome(mode: Mode): Chrome {
    return CHROME[mode];
}

export function fontStyleText(resolved: ResolvedRole): string {
    return resolved.fontStyle === 'none' ? '' : resolved.fontStyle;
}
