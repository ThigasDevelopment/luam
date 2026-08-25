const CODE_OPEN = /<syntaxhighlight\b[^>]*?(?:lang\s*=\s*["']?([A-Za-z]+)["']?)?[^>]*>/gi;

const CODE_CLOSE = /<\/syntaxhighlight\s*>/gi;

const LINE_BREAK = /<br\s*\/?>/gi;

const HTML_TAG = /<\/?[A-Za-z][^>]*>/g;

const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

const WIKI_BOLD = /'''([^']+)'''/g;

const WIKI_ITALIC = /''([^']+)''/g;

const TEMPLATE_EDGE = /\{\{|\}\}/g;

const BLANK_RUN = /\n{3,}/g;

const FENCE_LEAD = /```([A-Za-z]*)\n\s*\n/g;

const FENCE_TAIL = /\n\s*\n```/g;

const TRAILING_SPACE = /[ \t]+$/gm;

function codeFences(value: string): string {
    return value.replaceAll(CODE_OPEN, (_match, lang: string | undefined) => `\n\n\`\`\`${lang ?? 'lua'}\n`).replaceAll(CODE_CLOSE, '\n```\n\n');
}

function wikiMarkup(value: string): string {
    const linked = value.replaceAll(WIKI_LINK, (_match, page: string, label: string | undefined) => label ?? page);

    return linked.replaceAll(WIKI_BOLD, '**$1**').replaceAll(WIKI_ITALIC, '*$1*');
}

export function cleanMarkup(value: string): string {
    const stripped = codeFences(value).replaceAll(LINE_BREAK, '\n').replaceAll(HTML_TAG, '').replaceAll(TEMPLATE_EDGE, '');

    const text = wikiMarkup(stripped).replaceAll(TRAILING_SPACE, '').replaceAll(BLANK_RUN, '\n\n');

    return text.replaceAll(FENCE_LEAD, '```$1\n').replaceAll(FENCE_TAIL, '\n```').trim();
}

export function singleLine(value: string): string {
    return cleanMarkup(value).replaceAll(/\s+/g, ' ').trim();
}

export function quote(value: string): string {
    const escaped = value.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n').replaceAll('\r', '');

    return `'${escaped}'`;
}
