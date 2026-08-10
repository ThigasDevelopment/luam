const ESCAPES: Readonly<Record<string, string>> = {
    '\\': '\\\\',
    "'": "\\'",
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
};

const UNSAFE = new RegExp("[\\\\'\\u0000-\\u001f\\u007f]", 'g');

function escapeCharacter(character: string): string {
    return ESCAPES[character] ?? `\\${character.charCodeAt(0).toString().padStart(3, '0')}`;
}

export function escapeStringLiteral(value: string): string {
    return value.replace(UNSAFE, escapeCharacter);
}
