export interface ParameterDocumentation {
    name: string;
    isOptional: boolean;
    isVariadic: boolean;
    summary: string;
}

export interface ApiDocumentation {
    summary: string;
    parameters: readonly ParameterDocumentation[];
    returns: string;
    wiki: string;
}

export type ApiDocumentationCatalog = Readonly<Record<string, ApiDocumentation>>;

export const EMPTY_DOCUMENTATION: ApiDocumentation = { summary: '', parameters: [], returns: '', wiki: '' };

export function hasDocumentation(documentation: ApiDocumentation): boolean {
    return documentation.summary.length > 0 || documentation.returns.length > 0 || documentation.parameters.length > 0;
}

export function parameterNames(documentation: ApiDocumentation): string[] {
    return documentation.parameters.map((parameter) => (parameter.isVariadic ? `...${parameter.name}` : parameter.name));
}
