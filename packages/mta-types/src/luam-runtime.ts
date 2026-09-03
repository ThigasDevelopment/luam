import type { ApiCatalog } from './api-declaration';
import { ANY, arrayOf, BOOLEAN, fn, named, NUMBER, optionalOf, record, STRING, TABLE, tupleOf, VOID } from './type-descriptor';

const PROMISE_VALUE = named('Promise');

const RESOLVE = fn([ANY], VOID, 0, true, ['values']);

const REJECT = fn([ANY], VOID, 0, true, ['reason']);

const EXECUTOR = fn([RESOLVE, REJECT], ANY, 2, false, ['resolve', 'reject']);

const ON_FULFILLED = fn([ANY], ANY, 0, true, ['value']);

const ON_REJECTED = fn([ANY], ANY, 1, false, ['reason']);

const PROMISE = record('Promise', [
    { name: 'next', type: fn([ON_FULFILLED, optionalOf(ON_REJECTED)], PROMISE_VALUE, 1, false, ['onFulfilled', 'onRejected']) },
    { name: 'catch', type: fn([ON_REJECTED], PROMISE_VALUE, 1, false, ['onRejected']) },
]);

const JOB = tupleOf([NUMBER, PROMISE]);

const THREAD = record('Thread', [
    { name: 'get', type: fn([], NUMBER, 0) },
    { name: 'set', type: fn([NUMBER], BOOLEAN, 1) },
    { name: 'pause', type: fn([], BOOLEAN, 0) },
    { name: 'resume', type: fn([], BOOLEAN, 0) },
    { name: 'isPaused', type: fn([], BOOLEAN, 0) },
    { name: 'isStarted', type: fn([], BOOLEAN, 0) },
]);

const JOB_BODY = fn([THREAD], ANY, 0, true, ['thread']);

const TASK_BODY = fn([ANY], ANY, 0, true, ['values']);

const THREADS = record('Threads', [
    { name: 'add', type: fn([JOB_BODY, TABLE], JOB, 1, true, ['target', 'options']) },
    { name: 'remove', type: fn([NUMBER], BOOLEAN, 1) },
    { name: 'clear', type: fn([], BOOLEAN, 0) },
    { name: 'start', type: fn([], BOOLEAN, 0) },
    { name: 'stop', type: fn([], BOOLEAN, 0) },
    { name: 'getType', type: fn([], STRING, 0) },
]);

const ASYNC = record('Async', [
    { name: 'map', type: fn([TABLE, ANY, ANY], JOB, 2) },
    { name: 'iterate', type: fn([NUMBER, NUMBER, NUMBER, ANY, ANY], JOB, 4) },
    { name: 'foreach', type: fn([TABLE, ANY, ANY], JOB, 2) },
    { name: 'getInterval', type: fn([], NUMBER, 0) },
    { name: 'setInterval', type: fn([NUMBER], BOOLEAN, 1) },
]);

const PROMISE_LIBRARY = record('PromiseLibrary', [
    { name: 'new', type: fn([EXECUTOR], PROMISE, 1, false, ['executor']) },
    { name: 'spawn', type: fn([TASK_BODY], PROMISE, 1, true, ['target']) },
    { name: 'resolve', type: fn([ANY], PROMISE, 0, true) },
    { name: 'reject', type: fn([ANY], PROMISE, 0, true) },
    { name: 'all', type: fn([arrayOf(ANY)], PROMISE, 1) },
    { name: 'race', type: fn([arrayOf(ANY)], PROMISE, 1) },
    { name: 'settle', type: fn([PROMISE], tupleOf([BOOLEAN, ANY]), 1) },
    { name: 'await', type: fn([PROMISE], ANY, 1) },
    { name: 'delay', type: fn([NUMBER], PROMISE, 1) },
]);

export const LUAM_RUNTIME_SERVER_GLOBALS: ApiCatalog = {};

export const LUAM_RUNTIME_GLOBALS: ApiCatalog = {
    bind: fn([ANY, ANY], ANY, 2),
    getClass: fn([STRING], optionalOf(TABLE), 1),
    getClasses: fn([], TABLE, 0),
    sleep: fn([NUMBER], ANY, 1),
    delay: fn([NUMBER], PROMISE, 1),
    Promise: PROMISE_LIBRARY,
    Thread: THREAD,
    Threads: record('ThreadsLibrary', [{ name: 'new', type: fn([STRING, STRING], THREADS, 0) }]),
    Async: record('AsyncLibrary', [{ name: 'new', type: fn([NUMBER], ASYNC, 0) }]),
};
