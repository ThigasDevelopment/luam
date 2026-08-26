import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

import { MTA_EVENT_DOCS_1 } from './mta-event-docs-1';
import { MTA_EVENT_DOCS_2 } from './mta-event-docs-2';
import { MTA_EVENT_DOCS_3 } from './mta-event-docs-3';
import { MTA_EVENT_DOCS_4 } from './mta-event-docs-4';
import { MTA_EVENT_DOCS_5 } from './mta-event-docs-5';
import { MTA_EVENT_DOCS_6 } from './mta-event-docs-6';
import { MTA_EVENT_DOCS_7 } from './mta-event-docs-7';
import { MTA_EVENT_DOCS_8 } from './mta-event-docs-8';
import { MTA_EVENT_DOCS_9 } from './mta-event-docs-9';

export const MTA_EVENT_DOCS: EventDocumentationCatalog = {
    ...MTA_EVENT_DOCS_1,
    ...MTA_EVENT_DOCS_2,
    ...MTA_EVENT_DOCS_3,
    ...MTA_EVENT_DOCS_4,
    ...MTA_EVENT_DOCS_5,
    ...MTA_EVENT_DOCS_6,
    ...MTA_EVENT_DOCS_7,
    ...MTA_EVENT_DOCS_8,
    ...MTA_EVENT_DOCS_9,
};
