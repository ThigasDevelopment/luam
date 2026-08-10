export const BINARY_PRECEDENCE: Readonly<Record<string, number>> = {
    or: 1,
    and: 2,
    '<': 3,
    '>': 3,
    '<=': 3,
    '>=': 3,
    '~=': 3,
    '==': 3,
    '..': 4,
    '+': 5,
    '-': 5,
    '*': 6,
    '/': 6,
    '%': 6,
    '^': 8,
};

export const UNARY_PRECEDENCE = 7;

export const RIGHT_ASSOCIATIVE: ReadonlySet<string> = new Set(['..', '^']);

export const UNARY_OPERATORS: ReadonlySet<string> = new Set(['not', '-', '#']);

export const ASSIGNMENT_OPERATORS: ReadonlySet<string> = new Set(['=', '+=', '-=', '*=', '/=', '..=']);

export const INCREMENT_OPERATORS: ReadonlySet<string> = new Set(['++', '--']);

export const COMPOUND_OPERATORS: Readonly<Record<string, string>> = {
    '+=': '+',
    '-=': '-',
    '*=': '*',
    '/=': '/',
    '..=': '..',
    '++': '+',
    '--': '-',
};

export function binaryPrecedence(operator: string): number {
    return BINARY_PRECEDENCE[operator] ?? 0;
}

export function isRightAssociative(operator: string): boolean {
    return RIGHT_ASSOCIATIVE.has(operator);
}
