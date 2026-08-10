import type { ApiDocumentation, ParameterDocumentation } from './api-documentation';

export type ParameterSpec = readonly [name: string, isOptional: boolean, summary: string];

const LUA_MANUAL = 'https://www.lua.org/manual/5.1/manual.html';

function parameter(spec: ParameterSpec): ParameterDocumentation {
    const [name, isOptional, summary] = spec;

    return { name: name.startsWith('...') ? name.slice(3) : name, isOptional, isVariadic: name.startsWith('...'), summary };
}

export function doc(summary: string, parameters: readonly ParameterSpec[], returns: string, wiki = ''): ApiDocumentation {
    return { summary, parameters: parameters.map(parameter), returns, wiki };
}

export function luaDoc(anchor: string, summary: string, parameters: readonly ParameterSpec[], returns: string): ApiDocumentation {
    return doc(summary, parameters, returns, `${LUA_MANUAL}#pdf-${anchor}`);
}

export function valueDoc(summary: string, wiki = ''): ApiDocumentation {
    return doc(summary, [], '', wiki);
}
