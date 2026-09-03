import { EMPTY_DOCUMENTATION, type ApiDocumentation, type ApiDocumentationCatalog } from '@mta-types/api-documentation';
import { MTA_API_DOCS } from '@mta-types/generated/docs/mta-docs';
import { ASYNC_DOCS, PROMISE_DOCS, RUNTIME_DOCS, THREAD_DOCS, THREADS_DOCS } from '@mta-types/runtime-documentation';
import { MATH_DOCS, STRING_DOCS, TABLE_DOCS } from '@mta-types/library-documentation';
import { LUA_DOCS } from '@mta-types/lua-documentation';

const GLOBAL_DOCS: ApiDocumentationCatalog = { ...MTA_API_DOCS, ...LUA_DOCS, ...RUNTIME_DOCS };

const MEMBER_DOCS: Readonly<Record<string, ApiDocumentationCatalog>> = {
    math: MATH_DOCS,
    string: STRING_DOCS,
    table: TABLE_DOCS,
    Thread: THREAD_DOCS,
    Threads: THREADS_DOCS,
    Async: ASYNC_DOCS,
    Promise: PROMISE_DOCS,
    ThreadsLibrary: THREADS_DOCS,
    AsyncLibrary: ASYNC_DOCS,
    PromiseLibrary: PROMISE_DOCS,
};

export function findApiDocumentation(name: string): ApiDocumentation | null {
    return GLOBAL_DOCS[name] ?? null;
}

export function apiDocumentation(name: string): ApiDocumentation {
    return GLOBAL_DOCS[name] ?? EMPTY_DOCUMENTATION;
}

export function findMemberDocumentation(owner: string, member: string): ApiDocumentation | null {
    return MEMBER_DOCS[owner]?.[member] ?? null;
}

export function memberDocumentation(owner: string, member: string): ApiDocumentation {
    return findMemberDocumentation(owner, member) ?? EMPTY_DOCUMENTATION;
}
