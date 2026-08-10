import type { ApiCatalog } from './api-declaration';
import { ANY, BOOLEAN, fn, NUMBER, optionalOf, record, STRING, TABLE } from './type-descriptor';

const THREAD = record('Thread', [
    { name: 'get', type: fn([], NUMBER, 0) },
    { name: 'set', type: fn([NUMBER], BOOLEAN, 1) },
    { name: 'pause', type: fn([], BOOLEAN, 0) },
    { name: 'resume', type: fn([], BOOLEAN, 0) },
    { name: 'isPaused', type: fn([], BOOLEAN, 0) },
    { name: 'isStarted', type: fn([], BOOLEAN, 0) },
]);

const THREADS = record('Threads', [
    { name: 'add', type: fn([ANY, TABLE], NUMBER, 1, true) },
    { name: 'remove', type: fn([NUMBER], BOOLEAN, 1) },
    { name: 'clear', type: fn([], BOOLEAN, 0) },
    { name: 'start', type: fn([], BOOLEAN, 0) },
    { name: 'stop', type: fn([], BOOLEAN, 0) },
    { name: 'getType', type: fn([], STRING, 0) },
]);

const ASYNC = record('Async', [
    { name: 'map', type: fn([TABLE, ANY, ANY], NUMBER, 2) },
    { name: 'iterate', type: fn([NUMBER, NUMBER, NUMBER, ANY, ANY], NUMBER, 4) },
    { name: 'foreach', type: fn([TABLE, ANY, ANY], NUMBER, 2) },
    { name: 'getInterval', type: fn([], NUMBER, 0) },
    { name: 'setInterval', type: fn([NUMBER], BOOLEAN, 1) },
]);

const DOTENV = record('Dotenv', [
    { name: 'path', type: STRING },
    { name: 'get', type: fn([STRING, ANY], ANY, 1) },
    { name: 'has', type: fn([STRING], BOOLEAN, 1) },
    { name: 'all', type: fn([], TABLE, 0) },
    { name: 'apply', type: fn([], TABLE, 0) },
]);

export const LUAM_RUNTIME_SERVER_GLOBALS: ApiCatalog = {
    Dotenv: record('DotenvLibrary', [{ name: 'new', type: fn([STRING], DOTENV, 0) }]),
};

export const LUAM_RUNTIME_GLOBALS: ApiCatalog = {
    bind: fn([ANY, ANY], ANY, 2),
    getClass: fn([STRING], optionalOf(TABLE), 1),
    getClasses: fn([], TABLE, 0),
    sleep: fn([NUMBER], ANY, 1),
    Thread: THREAD,
    Threads: record('ThreadsLibrary', [{ name: 'new', type: fn([STRING, STRING], THREADS, 0) }]),
    Async: record('AsyncLibrary', [{ name: 'new', type: fn([NUMBER], ASYNC, 0) }]),
};
