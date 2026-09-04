import type { CompletionItem } from 'vscode-languageserver';

export const RESOLVE_KEY = 'luamResolve';

export interface DeferredCompletion {
    items: CompletionItem[];
    resolve(item: CompletionItem): CompletionItem;
}

function deferredKey(item: CompletionItem): unknown {
    return (item.data as Record<string, unknown> | undefined)?.[RESOLVE_KEY];
}

export function deferDocumentation(items: readonly CompletionItem[]): DeferredCompletion {
    const held = new Map<number, CompletionItem['documentation']>();
    const sent = items.map((item, index) => {
        if (item.documentation === undefined) {
            return item;
        }

        held.set(index, item.documentation);

        const { documentation, ...rest } = item;
        const data = { ...(typeof item.data === 'object' && item.data !== null ? item.data : {}), [RESOLVE_KEY]: index };

        return { ...rest, data };
    });

    return {
        items: sent,
        resolve: (item: CompletionItem): CompletionItem => {
            const key = deferredKey(item);
            const documentation = typeof key === 'number' ? held.get(key) : undefined;

            return documentation === undefined ? item : { ...item, documentation };
        },
    };
}
