import type { ApiEnvironment } from '#mta-types/api-declaration';

const SYNTAX_HEADING = /^=+\s*Syntax\b[^\n]*$/gim;

const LUA_BLOCK = /<syntaxhighlight lang="lua">([\s\S]*?)<\/syntaxhighlight>/g;

const SECTION_OPEN = /<section\b([^>]*)>/gi;

const SECTION_SIDE = /(?:name|class)\s*=\s*"([^"]*)"/gi;

export interface SyntaxBlock {
    environment: ApiEnvironment | null;
    source: string;
}

export function syntaxRegion(text: string): string | null {
    SYNTAX_HEADING.lastIndex = 0;

    const heading = SYNTAX_HEADING.exec(text);

    return heading === null ? null : text.slice(heading.index);
}

function sideOf(attributes: string): ApiEnvironment | null {
    SECTION_SIDE.lastIndex = 0;

    for (let match = SECTION_SIDE.exec(attributes); match !== null; match = SECTION_SIDE.exec(attributes)) {
        const value = (match[1] ?? '').toLowerCase();

        if (value === 'server' || value === 'client') {
            return value;
        }
    }

    return null;
}

function environmentAt(region: string, offset: number): ApiEnvironment | null {
    let environment: ApiEnvironment | null = null;

    SECTION_OPEN.lastIndex = 0;

    for (let match = SECTION_OPEN.exec(region); match !== null && match.index < offset; match = SECTION_OPEN.exec(region)) {
        environment = sideOf(match[1] ?? '') ?? environment;
    }

    return environment;
}

export function joinWrappedSignature(source: string): string {
    return source
        .split('\n')
        .map((line) => line.replace(/--.*$/, '').trim())
        .filter((line) => line.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function syntaxBlocks(text: string, name: string): SyntaxBlock[] {
    const region = syntaxRegion(text);

    if (region === null) {
        return [];
    }

    const blocks: SyntaxBlock[] = [];
    const anchor = new RegExp(`(?:^|[^\\w.:])${name}\\s*\\(`);

    LUA_BLOCK.lastIndex = 0;

    for (let match = LUA_BLOCK.exec(region); match !== null; match = LUA_BLOCK.exec(region)) {
        const source = joinWrappedSignature(match[1] ?? '');

        if (anchor.test(source)) {
            blocks.push({ environment: environmentAt(region, match.index), source });
        }
    }

    return blocks;
}
