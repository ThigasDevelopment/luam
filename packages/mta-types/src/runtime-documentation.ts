import type { ApiDocumentationCatalog } from './api-documentation';
import { doc, valueDoc } from './documentation-builder';

const NATIVE = 'Ships with the Luam runtime, injected into the resource only when the code references it.';

export const RUNTIME_DOCS: ApiDocumentationCatalog = {
    bind: doc(
        `Ties a function to a receiver so it can be passed around and still find its "self". ${NATIVE}`,
        [
            ['target', false, 'The function or method to bind.'],
            ['receiver', false, 'The value that becomes self inside the call.'],
        ],
        'returns a function that calls the target with the receiver already applied.',
    ),
    getClass: doc(
        `Looks up a Luam class by name at runtime. ${NATIVE}`,
        [['name', false, 'The class name as it was declared.']],
        'returns the class table, or nil when no class carries that name.',
    ),
    getClasses: doc(`Lists every Luam class the resource declared. ${NATIVE}`, [], 'returns a table of class tables keyed by name.'),
    sleep: doc(
        `Suspends the running thread for a number of milliseconds and resumes it afterwards. Only valid inside a Thread; elsewhere there is nothing to suspend. ${NATIVE}`,
        [['milliseconds', false, 'How long to wait before resuming.']],
        'returns once the wait is over.',
    ),
    Thread: valueDoc(
        `The thread currently running. Use it from inside a threaded function to read or change its own scheduling — \`Thread.pause()\`, \`Thread.resume()\`, \`Thread.set(interval)\`. ${NATIVE}`,
    ),
    Threads: valueDoc(
        `The thread class. \`new Threads(name, type)\` creates a scheduler you add functions to, then start — work is spread across frames so a long loop never freezes the server. ${NATIVE}`,
    ),
    Async: valueDoc(
        `The async class. \`new Async(interval)\` creates a runner that walks a table or a numeric range a slice at a time — \`map\`, \`foreach\`, \`iterate\` — so heavy iteration never blocks a frame. ${NATIVE}`,
    ),
    Dotenv: valueDoc(
        `The environment class. \`new Dotenv(path)\` reads a \`.env\` file and answers \`get\`, \`has\` and \`all\`; \`apply\` publishes its keys as \`env\`. Server-only, and the project's own \`.env\` is already loaded as \`env\`. ${NATIVE}`,
    ),
};

export const THREAD_DOCS: ApiDocumentationCatalog = {
    get: doc('Reads the interval, in milliseconds, between two runs of this thread.', [], 'returns the current interval.'),
    set: doc('Changes the interval between two runs of this thread.', [['interval', false, 'The new interval in milliseconds.']], 'returns true when the interval was applied.'),
    pause: doc('Stops this thread from running further, keeping its state so it can resume where it left off.', [], 'returns true when the thread was paused.'),
    resume: doc('Restarts a paused thread from the point it stopped at.', [], 'returns true when the thread was resumed.'),
    isPaused: doc('Tests whether this thread is currently paused.', [], 'returns true when the thread is paused.'),
    isStarted: doc('Tests whether this thread has been started.', [], 'returns true when the thread is running.'),
};

export const THREADS_DOCS: ApiDocumentationCatalog = {
    add: doc(
        'Registers a function to run on this scheduler.',
        [
            ['target', false, 'The function to run.'],
            ['arguments', true, 'A table of arguments forwarded to the function on every run.'],
        ],
        'returns the id of the registered function.',
    ),
    remove: doc('Unregisters a function from this scheduler.', [['id', false, 'The id returned when the function was added.']], 'returns true when the function was removed.'),
    clear: doc('Unregisters every function from this scheduler.', [], 'returns true when the scheduler was cleared.'),
    start: doc('Starts running the registered functions across frames.', [], 'returns true when the scheduler started.'),
    stop: doc('Stops the scheduler, leaving the registered functions in place.', [], 'returns true when the scheduler stopped.'),
    getType: doc('Reads the scheduling type this instance was created with.', [], 'returns the type name.'),
};

export const ASYNC_DOCS: ApiDocumentationCatalog = {
    map: doc(
        'Walks a table a slice at a time, building a new table from what the callback returns.',
        [
            ['source', false, 'The table to walk.'],
            ['callback', false, 'Called with each value and key; its result becomes the entry in the new table.'],
            ['done', true, 'Called with the finished table once every entry has been visited.'],
        ],
        'returns the id of the async run.',
    ),
    foreach: doc(
        'Walks a table a slice at a time without building a result, for side effects only.',
        [
            ['source', false, 'The table to walk.'],
            ['callback', false, 'Called with each value and key.'],
            ['done', true, 'Called once every entry has been visited.'],
        ],
        'returns the id of the async run.',
    ),
    iterate: doc(
        'Counts from one number to another a slice at a time, so a long numeric loop never blocks a frame.',
        [
            ['from', false, 'The first number to visit.'],
            ['to', false, 'The last number to visit.'],
            ['step', false, 'How much to advance on each iteration.'],
            ['callback', false, 'Called with the current number.'],
            ['done', true, 'Called once the range has been walked.'],
        ],
        'returns the id of the async run.',
    ),
    getInterval: doc('Reads how long the runner waits between two slices.', [], 'returns the interval in milliseconds.'),
    setInterval: doc('Changes how long the runner waits between two slices.', [['interval', false, 'The new interval in milliseconds.']], 'returns true when the interval was applied.'),
};

export const DOTENV_DOCS: ApiDocumentationCatalog = {
    path: valueDoc('The path this instance was loaded from.'),
    get: doc(
        'Reads one key from the loaded file.',
        [
            ['key', false, 'The key to read.'],
            ['fallback', true, 'Returned when the file does not declare the key.'],
        ],
        'returns the declared value, or the fallback.',
    ),
    has: doc('Tests whether the loaded file declares a key.', [['key', false, 'The key to test.']], 'returns true when the key is declared.'),
    all: doc('Copies every loaded key into a fresh table.', [], 'returns a table of the declared keys.'),
    apply: doc('Publishes the loaded keys as the global environment, replacing "env" and "process.env".', [], 'returns the published table.'),
};
