export type ExtensionReceiver = 'table' | 'string' | 'number';

export type ExtensionHelper = 'table' | 'string' | 'math';

export type ExtensionStyle = 'property' | 'call';

export type ExtensionResult = 'number' | 'boolean' | 'string' | 'table';

export interface NativeExtension {
    receiver: ExtensionReceiver;
    property: string;
    target: string;
    style: ExtensionStyle;
    result: ExtensionResult;
    helper: ExtensionHelper | null;
}

export const NATIVE_EXTENSIONS: readonly NativeExtension[] = [
    { receiver: 'table', property: 'count', target: 'table.size', style: 'property', result: 'number', helper: 'table' },
    { receiver: 'table', property: 'isEmpty', target: 'table.isEmpty', style: 'property', result: 'boolean', helper: 'table' },
    { receiver: 'table', property: 'keys', target: 'table.keys', style: 'property', result: 'table', helper: 'table' },
    { receiver: 'table', property: 'values', target: 'table.values', style: 'property', result: 'table', helper: 'table' },
    { receiver: 'table', property: 'includes', target: 'table.includes', style: 'call', result: 'boolean', helper: 'table' },
    { receiver: 'string', property: 'trim', target: 'string.trim', style: 'property', result: 'string', helper: 'string' },
    { receiver: 'string', property: 'startsWith', target: 'string.startsWith', style: 'call', result: 'boolean', helper: 'string' },
    { receiver: 'string', property: 'endsWith', target: 'string.endsWith', style: 'call', result: 'boolean', helper: 'string' },
    { receiver: 'string', property: 'length', target: 'string.len', style: 'property', result: 'number', helper: null },
    { receiver: 'string', property: 'upper', target: 'string.upper', style: 'property', result: 'string', helper: null },
    { receiver: 'string', property: 'lower', target: 'string.lower', style: 'property', result: 'string', helper: null },
    { receiver: 'number', property: 'clamp', target: 'math.clamp', style: 'call', result: 'number', helper: 'math' },
    { receiver: 'number', property: 'abs', target: 'math.abs', style: 'property', result: 'number', helper: null },
    { receiver: 'number', property: 'ceil', target: 'math.ceil', style: 'property', result: 'number', helper: null },
    { receiver: 'number', property: 'floor', target: 'math.floor', style: 'property', result: 'number', helper: null },
    { receiver: 'number', property: 'max', target: 'math.max', style: 'call', result: 'number', helper: null },
    { receiver: 'number', property: 'min', target: 'math.min', style: 'call', result: 'number', helper: null },
];

export function findExtension(receiver: ExtensionReceiver, property: string): NativeExtension | null {
    return NATIVE_EXTENSIONS.find((extension) => extension.receiver === receiver && extension.property === property) ?? null;
}
