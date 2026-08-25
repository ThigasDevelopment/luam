import type { ParameterDocumentation } from './api-documentation';

export interface EventDocumentation {
    summary: string;
    parameters: readonly ParameterDocumentation[];
    source: string;
    cancel: string;
    wiki: string;
}

export type EventDocumentationCatalog = Readonly<Record<string, EventDocumentation>>;

export const EMPTY_EVENT_DOCUMENTATION: EventDocumentation = { summary: '', parameters: [], source: '', cancel: '', wiki: '' };

export function hasEventDocumentation(documentation: EventDocumentation): boolean {
    return documentation.summary.length > 0 || documentation.source.length > 0 || documentation.cancel.length > 0 || documentation.parameters.length > 0;
}
