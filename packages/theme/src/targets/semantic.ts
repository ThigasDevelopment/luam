export const TOKEN_TYPES: readonly string[] = [
    'class',
    'interface',
    'enum',
    'enumMember',
    'type',
    'parameter',
    'variable',
    'property',
    'function',
    'method',
    'decorator',
    'event',
];

export const TOKEN_MODIFIERS: readonly string[] = ['declaration', 'defaultLibrary', 'mtaNative', 'serverOnly', 'clientOnly', 'erased', 'generated'];

export const CUSTOM_MODIFIERS: readonly string[] = ['mtaNative', 'erased', 'generated'];

export interface SemanticSelector {
    selector: string;
    role: string;
}

export const SEMANTIC_SELECTORS: readonly SemanticSelector[] = [
    { selector: '*.generated', role: 'identifier.generated' },
    { selector: 'function.defaultLibrary.mtaNative.serverOnly', role: 'call.native' },
    { selector: 'function.defaultLibrary.mtaNative.clientOnly', role: 'call.native' },
    { selector: 'function.defaultLibrary.mtaNative', role: 'call.native' },
    { selector: 'variable.defaultLibrary.mtaNative.serverOnly', role: 'call.native' },
    { selector: 'variable.defaultLibrary.mtaNative.clientOnly', role: 'call.native' },
    { selector: 'variable.defaultLibrary.mtaNative', role: 'call.native' },
    { selector: 'type.defaultLibrary.erased', role: 'type.primitive' },
    { selector: 'function.defaultLibrary', role: 'call.library' },
    { selector: 'variable.defaultLibrary', role: 'call.library' },
    { selector: 'class.declaration', role: 'name.type' },
    { selector: 'interface.declaration', role: 'name.type' },
    { selector: 'enum.declaration', role: 'name.type' },
    { selector: 'type.declaration', role: 'name.type' },
    { selector: 'enumMember.declaration', role: 'identifier.member' },
    { selector: 'class.erased', role: 'type.name' },
    { selector: 'enum.erased', role: 'type.name' },
    { selector: 'decorator', role: 'call.decorator' },
    { selector: 'event', role: 'literal.string' },
    { selector: 'class', role: 'call.constructor' },
    { selector: 'interface', role: 'type.name' },
    { selector: 'enum', role: 'identifier.local' },
    { selector: 'type', role: 'type.name' },
    { selector: 'function', role: 'call.function' },
    { selector: 'method', role: 'call.method' },
    { selector: 'parameter', role: 'identifier.parameter' },
    { selector: 'variable', role: 'identifier.local' },
    { selector: 'property', role: 'identifier.member' },
    { selector: 'enumMember', role: 'identifier.member' },
];

function parts(selector: string): { type: string; modifiers: readonly string[] } {
    const [type, ...modifiers] = selector.split('.');

    return { type: type ?? '', modifiers };
}

export function selectorMatches(selector: string, type: string, modifiers: readonly string[]): boolean {
    const wanted = parts(selector);

    if (wanted.type !== '*' && wanted.type !== type) {
        return false;
    }

    return wanted.modifiers.every((modifier) => modifiers.includes(modifier));
}

export function roleForToken(type: string, modifiers: readonly string[]): string | null {
    const found = SEMANTIC_SELECTORS.find((entry) => selectorMatches(entry.selector, type, modifiers));

    return found?.role ?? null;
}
