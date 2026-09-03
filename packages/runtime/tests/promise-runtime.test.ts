import { describe, expect, it } from 'vitest';

import { runWithHelpers } from './support/lua-vm';
import { MTA_TIMERS } from './support/mta-stubs';

import type { RuntimeHelperName } from '@runtime/helpers';

function run(source: string, helpers: readonly RuntimeHelperName[] = ['promise']): string | null {
    const outcome = runWithHelpers(helpers, `${MTA_TIMERS}\n${source}`);

    if (outcome.error !== null) {
        throw new Error(outcome.error);
    }

    return outcome.result;
}

function failure(source: string, helpers: readonly RuntimeHelperName[] = ['promise']): string {
    return runWithHelpers(helpers, `${MTA_TIMERS}\n${source}`).error ?? '';
}

describe('the promise state machine', () => {
    it('fires handlers once and ignores a second settle', () => {
        expect(
            run(`
                local calls = 0
                local pending = Promise.new(function(resolve, reject)
                    resolve(1, nil)
                    resolve(2)
                    reject('no')
                end)

                pending:next(function(...) calls = calls + select('#', ...) end)

                local task = Promise.spawn(function()
                    local first, second = Promise.await(pending)

                    return tostring(first) .. ',' .. tostring(second) .. ',' .. tostring(calls)
                end)

                result = tostring(task.state) .. '|' .. tostring(task.values[1])
            `),
        ).toBe('fulfilled|1,nil,2');
    });

    it('keeps the arity of a resolve that ends in nil through a suspended await', () => {
        expect(
            run(`
                local later
                local pending = Promise.new(function(resolve) later = resolve end)
                local task = Promise.spawn(function()
                    return select('#', Promise.await(pending))
                end)

                later(1, nil)
                result = tostring(task.values[1])
            `),
        ).toBe('2');
    });

    it('rejects when the executor throws', () => {
        expect(
            run(`
                local bad = Promise.new(function() error('boom', 0) end)

                result = tostring(bad.state) .. ':' .. tostring(bad.values[1])
            `),
        ).toBe('rejected:boom');
    });

    it('rejects the task when its body raises and reports the reason', () => {
        expect(
            run(`
                local task = Promise.spawn(function() error('failed', 0) end)

                result = tostring(task.state) .. ':' .. tostring(task.values[1])
            `),
        ).toBe('rejected:failed');
    });

    it('raises a rejection at the await site and rejects the enclosing task', () => {
        expect(
            run(`
                local task = Promise.spawn(function()
                    Promise.await(Promise.reject('why'))

                    return 'unreachable'
                end)

                result = tostring(task.state) .. ':' .. tostring(task.values[1])
            `),
        ).toBe('rejected:why');
    });

    it('reports the outcome through settle where await raises', () => {
        expect(
            run(`
                local task = Promise.spawn(function()
                    local ok, reason = Promise.settle(Promise.reject('why'))

                    return tostring(ok) .. ':' .. tostring(reason)
                end)

                result = tostring(task.values[1])
            `),
        ).toBe('false:why');
    });

    it('errors when await runs outside a task', () => {
        expect(failure('Promise.await(Promise.new(function() end))')).toContain('"await" is only valid');
    });

    it('waits on a timer inside a task and consumes nothing while suspended', () => {
        expect(
            run(`
                local task = Promise.spawn(function()
                    sleep(0)

                    return 'woke'
                end)

                local before = tostring(task.state)

                advance(50)
                result = before .. '->' .. tostring(task.state) .. ':' .. tostring(task.values[1])
            `),
        ).toBe('pending->fulfilled:woke');
    });

    it('errors when sleep runs outside a task and outside a job', () => {
        expect(failure('sleep(10)')).toContain('"sleep" is only valid');
    });

    it('holds no strong reference to the coroutine of a promise that never settles', () => {
        expect(
            run(`
                local pending = Promise.new(function() end)
                local task = Promise.spawn(function() Promise.await(pending) end)
                local held = 'none'

                for key, value in pairs(task) do
                    if type(value) == 'thread' then
                        held = tostring(key)
                    end
                end

                result = tostring(task.state) .. ':' .. held
            `),
        ).toBe('pending:none');
    });

    it('runs catch on a rejection and never on a value', () => {
        expect(
            run(`
                local seen = { }

                Promise.resolve('value'):catch(function () seen[#seen + 1] = 'catch' end)
                Promise.reject('reason'):catch(function (reason) seen[#seen + 1] = reason end)
                Promise.resolve('value'):next(function (value) seen[#seen + 1] = value end)

                result = table.concat(seen, ',')
            `),
        ).toBe('reason,value');
    });

    it('reports a rejection nobody waits on and stays quiet when someone does', () => {
        expect(
            run(`
                local logged = 0
                local original = print
                local later
                local pending = Promise.new(function (_, reject) later = reject end)

                print = function (message) logged = logged + 1 end

                Promise.spawn(function() error('nobody waits', 0) end)

                local loud = logged
                local inner = Promise.spawn(function() Promise.await(pending) end)
                local outcome = 'none'

                Promise.spawn(function()
                    local ok, reason = Promise.settle(inner)

                    outcome = tostring(ok) .. ':' .. tostring(reason)
                end)

                later('handled')

                print = original
                result = tostring(loud) .. ':' .. tostring(logged) .. ':' .. outcome
            `),
        ).toBe('1:1:false:handled');
    });

    it('settles every promise in all and mirrors the first in race', () => {
        expect(
            run(`
                local task = Promise.spawn(function()
                    local values = Promise.await(Promise.all({ Promise.resolve(1), Promise.resolve(2) }))
                    local first = Promise.await(Promise.race({ Promise.resolve('a'), Promise.reject('b') }))

                    return tostring(values[1] + values[2]) .. ':' .. tostring(first)
                end)

                result = tostring(task.values[1])
            `),
        ).toBe('3:a');
    });
});

describe('the merged scheduler', () => {
    const POOL = ['promise', 'threads'] as const;

    it('returns the job id first and a promise second', () => {
        expect(
            run(
                `
                local pool = Threads.new('concurrent', 'normal')
                local id, done = pool:add(function() return 'finished' end)

                advance(100)
                result = tostring(id) .. ':' .. tostring(done.state) .. ':' .. tostring(done.values[1])
            `,
                POOL,
            ),
        ).toBe('1:fulfilled:finished');
    });

    it('keeps remove, pause and resume working on the id', () => {
        expect(
            run(
                `
                local pool = Threads.new('concurrent', 'normal')
                local id = pool:add(function() sleep(0) end)
                local paused = pool:getThread(id):pause()
                local resumed = pool:getThread(id):resume()

                result = tostring(paused) .. ':' .. tostring(resumed) .. ':' .. tostring(pool:remove(id))
            `,
                POOL,
            ),
        ).toBe('true:true:true');
    });

    it('rejects the job promise when the body fails and never raises out of the pulse', () => {
        expect(
            run(
                `
                local pool = Threads.new('concurrent', 'normal')
                local id, done = pool:add(function() error('job failed', 0) end)

                advance(50)
                advance(50)
                result = tostring(done.state) .. ':' .. tostring(done.values[1])
            `,
                POOL,
            ),
        ).toBe('rejected:job failed');
    });

    it('awaits inside a pool job and resumes it from the promise scheduler', () => {
        expect(
            run(
                `
                local later
                local pending = Promise.new(function(resolve) later = resolve end)
                local pool = Threads.new('concurrent', 'normal')
                local id, done = pool:add(function()
                    return 'got ' .. tostring(Promise.await(pending))
                end)

                advance(100)

                local suspended = tostring(done.state)

                later('it')
                result = suspended .. '->' .. tostring(done.state) .. ':' .. tostring(done.values[1])
            `,
                POOL,
            ),
        ).toBe('pending->fulfilled:got it');
    });

    it('slices a job across pulses when it sleeps', () => {
        expect(
            run(
                `
                local steps = 0
                local pool = Threads.new('concurrent', 'normal')

                pool:add(function()
                    for index = 1, 3 do
                        steps = steps + 1
                        sleep(0)
                    end
                end)

                advance(100)

                local first = steps

                advance(100)
                result = tostring(first) .. ':' .. tostring(steps)
            `,
                POOL,
            ),
        ).toBe('1:2');
    });

    it('runs one timer for the runtime no matter how many pools exist', () => {
        expect(
            run(
                `
                local first = Threads.new('concurrent', 'normal')
                local second = Threads.new('priority', 'high')

                first:add(function() sleep(0) end)
                second:add(function() sleep(0) end)

                result = tostring(timerCount())
            `,
                POOL,
            ),
        ).toBe('1');
    });

    it('stops the shared timer once every pool drains', () => {
        expect(
            run(
                `
                local pool = Threads.new('concurrent', 'normal')

                pool:add(function() return true end)

                advance(100)
                advance(100)
                result = tostring(timerCount())
            `,
                POOL,
            ),
        ).toBe('0');
    });
});
