import { type MarkdownRenderer } from 'vitepress';

export const VERSION_TOKEN = '%LUAM_VERSION%';

export function replaceVersionToken(md: MarkdownRenderer, version: string): void {
    md.core.ruler.before('normalize', 'luam-version', (state: { src: string }): void => {
        if (!state.src.includes(VERSION_TOKEN)) {
            return;
        }

        state.src = state.src.split(VERSION_TOKEN).join(version);
    });
}
