export function isDigit(character: string): boolean {
    return character >= '0' && character <= '9';
}

export function isHexDigit(character: string): boolean {
    return isDigit(character) || (character >= 'a' && character <= 'f') || (character >= 'A' && character <= 'F');
}

export function isAlpha(character: string): boolean {
    return (character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z');
}

export function isIdentifierStart(character: string): boolean {
    return isAlpha(character) || character === '_';
}

export function isIdentifierPart(character: string): boolean {
    return isIdentifierStart(character) || isDigit(character);
}

export function isLineBreak(character: string): boolean {
    return character === '\n' || character === '\r';
}

export function isWhitespace(character: string): boolean {
    return character === ' ' || character === '\t' || character === '\v' || character === '\f' || isLineBreak(character);
}
