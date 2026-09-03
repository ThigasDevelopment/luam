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
        `Suspends the running coroutine for a number of milliseconds and resumes it afterwards. Valid inside an async function and inside a thread pool job; elsewhere there is nothing to suspend. ${NATIVE}`,
        [['milliseconds', false, 'How long to wait before resuming.']],
        'returns once the wait is over.',
    ),
    delay: doc(
        `Creates a promise that resolves after a number of milliseconds. MTA never fires a timer sooner than 50ms, so a shorter wait resumes on the next tick. ${NATIVE}`,
        [['milliseconds', false, 'How long to wait before the promise resolves.']],
        'returns a promise that resolves when the wait is over.',
    ),
    Promise: valueDoc(
        `The promise class. \`new Promise(function (resolve, reject) ... end)\` creates a value that arrives later; an async function returns one, and \`await\` inside another async function reads it. ${NATIVE}`,
    ),
    Thread: valueDoc(
        `The thread currently running. Use it from inside a threaded function to read or change its own scheduling — \`Thread.pause()\`, \`Thread.resume()\`, \`Thread.set(interval)\`. ${NATIVE}`,
    ),
    Threads: valueDoc(
        `The thread class. \`new Threads(name, type)\` creates a scheduler you add functions to, then start — work is spread across frames so a long loop never freezes the server. Reach for it when the work is long; when the work waits, write an async function and await it. \`add\` hands back the job id and a promise that settles when the job finishes. ${NATIVE}`,
    ),
    Async: valueDoc(
        `The async class. \`new Async(interval)\` creates a runner that walks a table or a numeric range a slice at a time — \`map\`, \`foreach\`, \`iterate\` — so heavy iteration never blocks a frame. Every runner hands back the run id and a promise, so \`await\` can wait for the walk to finish. ${NATIVE}`,
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
        'returns the id of the registered function, and a promise that settles when it finishes.',
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
        'returns the id of the async run, and a promise that settles when the walk finishes.',
    ),
    foreach: doc(
        'Walks a table a slice at a time without building a result, for side effects only.',
        [
            ['source', false, 'The table to walk.'],
            ['callback', false, 'Called with each value and key.'],
            ['done', true, 'Called once every entry has been visited.'],
        ],
        'returns the id of the async run, and a promise that settles when the walk finishes.',
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
        'returns the id of the async run, and a promise that settles when the walk finishes.',
    ),
    getInterval: doc('Reads how long the runner waits between two slices.', [], 'returns the interval in milliseconds.'),
    setInterval: doc('Changes how long the runner waits between two slices.', [['interval', false, 'The new interval in milliseconds.']], 'returns true when the interval was applied.'),
};

export const PROMISE_DOCS: ApiDocumentationCatalog = {
    new: doc(
        'Creates a promise from an executor that receives resolve and reject. An error thrown inside the executor rejects the promise.',
        [['executor', false, 'Called immediately with a resolve and a reject function.']],
        'returns the pending promise.',
    ),
    spawn: doc(
        'Runs a function as a promise task, resuming it on the scheduler whenever what it awaits settles.',
        [
            ['target', false, 'The function to run as a task.'],
            ['arguments', true, 'Values forwarded to the function as its arguments.'],
        ],
        'returns a promise that settles with what the function returns, or rejects with the error it raises.',
    ),
    resolve: doc(
        'Wraps values in a promise that is already fulfilled. A promise passed in is returned unchanged.',
        [['values', true, 'The values the promise resolves with.']],
        'returns a fulfilled promise.',
    ),
    reject: doc('Creates a promise that is already rejected.', [['reason', true, 'The reason the promise rejects with.']], 'returns a rejected promise.'),
    all: doc(
        'Waits for every promise in a list and fails as soon as one of them rejects.',
        [['promises', false, 'The list of promises to wait for.']],
        'returns a promise that resolves with a table of the resolved values.',
    ),
    race: doc(
        'Settles with the first promise in a list that settles, whether it fulfils or rejects.',
        [['promises', false, 'The list of promises to race.']],
        'returns a promise that mirrors the first one to settle.',
    ),
    settle: doc(
        'Waits for a promise and reports the outcome instead of raising it. Only valid inside an async function.',
        [['promise', false, 'The promise to wait for.']],
        'returns true and the resolved values, or false and the rejection reason.',
    ),
    await: doc(
        'Waits for a promise and returns its resolved values, raising the reason when it rejects. This is what "await" lowers to.',
        [['promise', false, 'The promise to wait for.']],
        'returns the resolved values.',
    ),
    delay: doc(
        'Creates a promise that resolves after a number of milliseconds, clamped to the 50ms floor MTA enforces on timers.',
        [['milliseconds', false, 'How long to wait before the promise resolves.']],
        'returns a promise that resolves when the wait is over.',
    ),
    next: doc(
        'Runs a callback once the promise resolves, without suspending the caller.',
        [
            ['onFulfilled', false, 'Called with the resolved values.'],
            ['onRejected', true, 'Called with the rejection reason.'],
        ],
        'returns a promise for the value the callback returns, so calls chain.',
    ),
    catch: doc(
        'Runs a callback when the promise rejects, without suspending the caller.',
        [['onRejected', false, 'Called with the rejection reason.']],
        'returns a promise for the value the callback returns, so calls chain.',
    ),
};
