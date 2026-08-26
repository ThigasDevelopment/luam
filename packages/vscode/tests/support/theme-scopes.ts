import { ROLES } from '@theme/roles';
import { scopesFor } from '@theme/targets/textmate';

const RULES: readonly { scope: string; role: string }[] = ROLES.flatMap((role) => scopesFor(role.id).map((scope) => ({ scope, role: role.id })));

export function winningRole(scope: string): string | null {
    const segments = scope.split('.');

    for (let length = segments.length; length > 0; length -= 1) {
        const selector = segments.slice(0, length).join('.');
        const found = RULES.find((rule) => rule.scope === selector);

        if (found !== undefined) {
            return found.role;
        }
    }

    return null;
}
