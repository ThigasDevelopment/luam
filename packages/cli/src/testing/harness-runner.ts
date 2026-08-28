export const RUNNER_SOURCE = String.raw`local function fullName(name)
    if #groups == 0 then
        return name
    end
    return table.concat(groups, ' > ') .. ' > ' .. name
end

local function snapshot(list)
    local copy = {}
    for index = 1, #list do
        copy[index] = list[index]
    end
    return copy
end

local function describe(name, body)
    groups[#groups + 1] = name
    local beforeDepth = #beforeHooks
    local afterDepth = #afterHooks
    body()
    for index = #beforeHooks, beforeDepth + 1, -1 do
        beforeHooks[index] = nil
    end
    for index = #afterHooks, afterDepth + 1, -1 do
        afterHooks[index] = nil
    end
    groups[#groups] = nil
end

local function test(name, body)
    tests[#tests + 1] = { name = fullName(name), body = body, before = snapshot(beforeHooks), after = snapshot(afterHooks) }
end

local function beforeEach(body)
    beforeHooks[#beforeHooks + 1] = body
end

local function afterEach(body)
    afterHooks[#afterHooks + 1] = body
end

local function resetStubs()
    callLog = {}
    behaviour = {}
end

local function record(name, ...)
    local entries = callLog[name]
    if entries == nil then
        entries = {}
        callLog[name] = entries
    end
    entries[#entries + 1] = { n = select('#', ...), ... }
end

local function makeStub(name)
    return function(...)
        record(name, ...)
        local configured = behaviour[name]
        if configured == nil then
            return nil
        end
        if configured.kind == 'function' then
            return configured.body(...)
        end
        return configured.value
    end
end

local mta = {}

function mta.stub(name, implementation)
    behaviour[name] = { kind = 'function', body = implementation }
end

function mta.returns(name, value)
    behaviour[name] = { kind = 'value', value = value }
end

function mta.calls(name)
    return callLog[name] or {}
end

function mta.reset()
    resetStubs()
end

local function runAll()
    local passed = 0
    local failed = 0
    for _, entry in ipairs(tests) do
        resetStubs()
        local result = nil
        for _, hook in ipairs(entry.before) do
            if result == nil then
                result = attempt(hook)
            end
        end
        if result == nil then
            result = attempt(entry.body)
        end
        for _, hook in ipairs(entry.after) do
            local hookResult = attempt(hook)
            if result == nil then
                result = hookResult
            end
        end
        if result == nil then
            passed = passed + 1
            emit('pass', entry.name)
        else
            failed = failed + 1
            emit('fail', entry.name, result.file, result.line, result.message)
        end
    end
    emit('done', passed, failed)
    return failed
end

rawset(_G, 'describe', describe)
rawset(_G, 'test', test)
rawset(_G, 'beforeEach', beforeEach)
rawset(_G, 'afterEach', afterEach)
rawset(_G, 'expect', expect)
rawset(_G, 'mta', mta)

setmetatable(_G, {
    __index = function(_, key)
        if stubNames[key] == nil then
            return nil
        end
        local stub = makeStub(key)
        rawset(_G, key, stub)
        return stub
    end,
})

rawset(_G, '__luamTest', {
    discard = function()
        tests = {}
        groups = {}
        beforeHooks = {}
        afterHooks = {}
    end,
    run = runAll,
})
`;
