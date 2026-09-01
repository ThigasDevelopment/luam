import type { Environment } from '@compiler/environment/environment';
import type { ApiEnvironment } from '@mta-types/api-declaration';
import type { CompletionItem } from 'vscode-languageserver';

const SIDE_RANK = '~';

export function isSideRestricted(declared: ApiEnvironment | undefined, environment: Environment): boolean {
    return environment === 'shared' && declared !== undefined && declared !== 'shared';
}

export function sideNote(declared: ApiEnvironment): string {
    return `${declared}-only — a \`shared\` file runs on both sides. Decide the side at runtime before using it.`;
}

export function withSideOrder(item: CompletionItem, declared: ApiEnvironment, environment: Environment): CompletionItem {
    if (!isSideRestricted(declared, environment)) {
        return item;
    }

    return { ...item, sortText: `${SIDE_RANK}${item.label}` };
}

export function withSideRank(item: CompletionItem, declared: ApiEnvironment, environment: Environment): CompletionItem {
    if (!isSideRestricted(declared, environment)) {
        return item;
    }

    const detail = item.detail === undefined ? declared : `${item.detail} (${declared})`;

    return withSideOrder({ ...item, detail }, declared, environment);
}
