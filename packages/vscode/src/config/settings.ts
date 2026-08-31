import { workspace } from 'vscode';

export const CONFIGURATION_SECTION = 'luam';

export const INLAY_HINTS_SECTION = 'luam.inlayHints';

export interface InlayHintSettings {
    localTypes: boolean;
    returnTypes: boolean;
    callbackParameterTypes: boolean;
    parameterNames: boolean;
}

export interface LuamSettings {
    cliPath: string;
    ensureWatch: boolean;
    formatting: boolean;
    semanticHighlighting: boolean;
    inlayHints: InlayHintSettings;
}

export const DEFAULT_INLAY_HINTS: InlayHintSettings = {
    localTypes: true,
    returnTypes: true,
    callbackParameterTypes: true,
    parameterNames: false,
};

export const DEFAULT_SETTINGS: LuamSettings = {
    cliPath: 'luam',
    ensureWatch: true,
    formatting: true,
    semanticHighlighting: true,
    inlayHints: DEFAULT_INLAY_HINTS,
};

export function readInlayHints(): InlayHintSettings {
    const configuration = workspace.getConfiguration(INLAY_HINTS_SECTION);

    return {
        localTypes: configuration.get<boolean>('localTypes') ?? DEFAULT_INLAY_HINTS.localTypes,
        returnTypes: configuration.get<boolean>('returnTypes') ?? DEFAULT_INLAY_HINTS.returnTypes,
        callbackParameterTypes: configuration.get<boolean>('callbackParameterTypes') ?? DEFAULT_INLAY_HINTS.callbackParameterTypes,
        parameterNames: configuration.get<boolean>('parameterNames') ?? DEFAULT_INLAY_HINTS.parameterNames,
    };
}

export function readSettings(): LuamSettings {
    const configuration = workspace.getConfiguration(CONFIGURATION_SECTION);

    return {
        cliPath: configuration.get<string>('cliPath') ?? DEFAULT_SETTINGS.cliPath,
        ensureWatch: configuration.get<boolean>('ensureWatch') ?? DEFAULT_SETTINGS.ensureWatch,
        formatting: configuration.get<boolean>('formatting') ?? DEFAULT_SETTINGS.formatting,
        semanticHighlighting: configuration.get<boolean>('semanticHighlighting') ?? DEFAULT_SETTINGS.semanticHighlighting,
        inlayHints: readInlayHints(),
    };
}
