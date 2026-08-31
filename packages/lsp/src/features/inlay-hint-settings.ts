export interface InlayHintSettings {
    localTypes: boolean;
    returnTypes: boolean;
    callbackParameterTypes: boolean;
    parameterNames: boolean;
}

export const DEFAULT_INLAY_HINT_SETTINGS: InlayHintSettings = {
    localTypes: true,
    returnTypes: true,
    callbackParameterTypes: true,
    parameterNames: false,
};

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function flag(source: Record<string, unknown>, name: keyof InlayHintSettings): boolean {
    const value = source[name];

    return typeof value === 'boolean' ? value : DEFAULT_INLAY_HINT_SETTINGS[name];
}

export function readInlayHintSettings(options: unknown): InlayHintSettings {
    const source = record(record(options)?.inlayHints);

    if (source === null) {
        return DEFAULT_INLAY_HINT_SETTINGS;
    }

    return {
        localTypes: flag(source, 'localTypes'),
        returnTypes: flag(source, 'returnTypes'),
        callbackParameterTypes: flag(source, 'callbackParameterTypes'),
        parameterNames: flag(source, 'parameterNames'),
    };
}
