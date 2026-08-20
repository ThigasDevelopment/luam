import { type MarkdownRenderer } from 'vitepress';

export function wrapTables(md: MarkdownRenderer): void {
    const open = md.renderer.rules.table_open;
    const close = md.renderer.rules.table_close;

    md.renderer.rules.table_open = (tokens, index, options, env, self): string => {
        const rendered = open === undefined
            ? self.renderToken(tokens, index, options)
            : open(tokens, index, options, env, self);

        return `<div class="table-wrapper">${rendered}`;
    };

    md.renderer.rules.table_close = (tokens, index, options, env, self): string => {
        const rendered = close === undefined
            ? self.renderToken(tokens, index, options)
            : close(tokens, index, options, env, self);

        return `${rendered}</div>`;
    };
}
