import { EMPTY_EVENT_DOCUMENTATION, type EventDocumentation } from './event-documentation';

import { MTA_EVENT_DOCS } from '@mta-types/generated/docs/mta-event-docs';

export function findEventDocumentation(name: string): EventDocumentation | null {
    return MTA_EVENT_DOCS[name] ?? null;
}

export function eventDocumentation(name: string): EventDocumentation {
    return MTA_EVENT_DOCS[name] ?? EMPTY_EVENT_DOCUMENTATION;
}
