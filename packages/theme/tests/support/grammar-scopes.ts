import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { scopesFor, TEXTMATE_MAP, UNPAINTED_SCOPES } from '@theme/targets/textmate';
import { ROLES } from '@theme/roles';

const GRAMMARS: readonly string[] = ['luam.tmLanguage.json', 'luam-manifest.tmLanguage.json'];

function walk(value: unknown, found: Set<string>): void {
    if (Array.isArray(value)) {
        for (const entry of value) {
            walk(entry, found);
        }

        return;
    }

    if (value === null || typeof value !== 'object') {
        return;
    }

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        if (key === 'name' && typeof entry === 'string' && entry.includes('.')) {
            found.add(entry);

            continue;
        }

        if (key !== 'scopeName') {
            walk(entry, found);
        }
    }
}

export function grammarScopes(): string[] {
    const found = new Set<string>();

    for (const grammar of GRAMMARS) {
        walk(JSON.parse(readFileSync(fileURLToPath(new URL(`../../../vscode/syntaxes/${grammar}`, import.meta.url)), 'utf8')), found);
    }

    return [...found].sort();
}

export function paintedScopes(): string[] {
    return grammarScopes().filter((scope) => !UNPAINTED_SCOPES.includes(scope));
}

export function themeRules(): { scope: string; role: string }[] {
    return ROLES.flatMap((role) => scopesFor(role.id).map((scope) => ({ scope, role: role.id })));
}

export function winningRole(scope: string): string | null {
    const segments = scope.split('.');

    for (let length = segments.length; length > 0; length -= 1) {
        const selector = segments.slice(0, length).join('.');
        const found = themeRules().find((rule) => rule.scope === selector);

        if (found !== undefined) {
            return found.role;
        }
    }

    return null;
}

export function luamScopeSet(): Set<string> {
    return new Set(Object.values(TEXTMATE_MAP).flatMap((scopes) => [...scopes]));
}
