export const ASSERTIONS_SOURCE = String.raw`local SENTINEL = '##luam:test'
local HARNESS = debug.getinfo(1, 'S').short_src

local tests = {}
local groups = {}
local beforeHooks = {}
local afterHooks = {}
local callLog = {}
local behaviour = {}
local stubNames = rawget(_G, '__luamTestNames') or {}

local function escape(value)
    local text = tostring(value)
    text = text:gsub('\\', '\\\\')
    text = text:gsub('\t', '\\t')
    text = text:gsub('\r', '\\r')
    text = text:gsub('\n', '\\n')
    return text
end

local function emit(kind, ...)
    local parts = { SENTINEL, kind }
    for index = 1, select('#', ...) do
        parts[#parts + 1] = escape(select(index, ...))
    end
    io.write(table.concat(parts, '\t'))
    io.write('\n')
    io.stdout:flush()
end

local function origin()
    local index = 1
    while true do
        local info = debug.getinfo(index, 'Sl')
        if info == nil then
            return '', ''
        end
        if info.what ~= 'C' and info.short_src ~= HARNESS then
            return info.short_src, info.currentline
        end
        index = index + 1
    end
end

local function failure(message)
    local file, line = origin()
    return { luamTestFailure = true, message = message, file = file, line = line }
end

local function fail(message)
    error(failure(message), 0)
end

local function handler(err)
    if type(err) == 'table' and err.luamTestFailure then
        return err
    end
    return failure(tostring(err))
end

local function attempt(body)
    local ok, err = xpcall(body, handler)
    if ok then
        return nil
    end
    return err
end

local function describeValue(value)
    if type(value) == 'string' then
        return string.format('%q', value)
    end
    return tostring(value)
end

local function deepEqual(left, right)
    if left == right then
        return true
    end
    if type(left) ~= 'table' or type(right) ~= 'table' then
        return false
    end
    for key, value in pairs(left) do
        if not deepEqual(value, right[key]) then
            return false
        end
    end
    for key in pairs(right) do
        if left[key] == nil then
            return false
        end
    end
    return true
end

local function expect(value)
    local matchers = {}

    function matchers.toBe(expected)
        if value ~= expected then
            fail('expected ' .. describeValue(expected) .. ', got ' .. describeValue(value))
        end
    end

    function matchers.toNotBe(expected)
        if value == expected then
            fail('expected a value other than ' .. describeValue(expected))
        end
    end

    function matchers.toEqual(expected)
        if not deepEqual(value, expected) then
            fail('expected ' .. describeValue(expected) .. ', got ' .. describeValue(value))
        end
    end

    function matchers.toNotEqual(expected)
        if deepEqual(value, expected) then
            fail('expected a value other than ' .. describeValue(expected))
        end
    end

    function matchers.toBeNil()
        if value ~= nil then
            fail('expected nil, got ' .. describeValue(value))
        end
    end

    function matchers.toBeTruthy()
        if not value then
            fail('expected a truthy value, got ' .. describeValue(value))
        end
    end

    function matchers.toBeFalsy()
        if value then
            fail('expected a falsy value, got ' .. describeValue(value))
        end
    end

    function matchers.toContain(entry)
        if type(value) == 'string' then
            if string.find(value, tostring(entry), 1, true) == nil then
                fail('expected ' .. describeValue(value) .. ' to contain ' .. describeValue(entry))
            end
            return
        end
        if type(value) ~= 'table' then
            fail('expected a string or a table, got ' .. type(value))
            return
        end
        for _, candidate in pairs(value) do
            if deepEqual(candidate, entry) then
                return
            end
        end
        fail('expected the table to contain ' .. describeValue(entry))
    end

    function matchers.toThrow(message)
        if type(value) ~= 'function' then
            fail('expected a function, got ' .. type(value))
            return
        end
        local ok, err = pcall(value)
        if ok then
            fail('expected the function to throw')
            return
        end
        if message ~= nil and string.find(tostring(err), message, 1, true) == nil then
            fail('expected the error to contain ' .. describeValue(message) .. ', got ' .. describeValue(tostring(err)))
        end
    end

    return matchers
end
`;
