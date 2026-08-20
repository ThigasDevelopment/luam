import { type MarkdownRenderer } from 'vitepress';

export interface FenceOptions {
    environment: string;
    declaration: boolean;
    oop: boolean;
    expectError: boolean;
    live: boolean;
}

const ENVIRONMENTS = new Set(['server', 'client', 'shared']);

export function parseFenceInfo(info: string): FenceOptions {
    const parts = info.trim().split(/\s+/).slice(1);
    const options: FenceOptions = { environment: 'shared', declaration: false, oop: false, expectError: false, live: true };

    for (const part of parts) {
        const [key, value] = part.split('=');

        if (key === 'env' && value !== undefined && ENVIRONMENTS.has(value)) {
            options.environment = value;
        } else if (key === 'decl') {
            options.declaration = true;
        } else if (key === 'oop') {
            options.oop = true;
        } else if (key === 'expect-error') {
            options.expectError = true;
        } else if (key === 'static') {
            options.live = false;
        }
    }

    return options;
}

export function encodeSource(source: string): string {
    return Buffer.from(source, 'utf8').toString('base64');
}

export function liveExamples(md: MarkdownRenderer): void {
    const fence = md.renderer.rules.fence;

    if (fence === undefined) {
        return;
    }

    md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index];
        const rendered = fence(tokens, index, options, env, self);

        if (token === undefined || !token.info.trim().startsWith('luam')) {
            return rendered;
        }

        const parsed = parseFenceInfo(token.info);

        if (!parsed.live) {
            return rendered;
        }

        const attributes = [
            `source="${encodeSource(token.content)}"`,
            `environment="${parsed.environment}"`,
            parsed.oop ? ':oop="true"' : '',
            parsed.declaration ? ':declaration="true"' : '',
            parsed.expectError ? ':expect-error="true"' : '',
        ]
            .filter((attribute) => attribute !== '')
            .join(' ');

        return `<LiveExample ${attributes}>${rendered}</LiveExample>`;
    };
}
