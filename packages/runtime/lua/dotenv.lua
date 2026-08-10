local DEFAULT_FILE = '.env'

local KEYWORDS = {
    ['true'] = true,
    ['false'] = false,
}

local ESCAPES = {
    ['n'] = '\n',
    ['r'] = '\r',
    ['t'] = '\t',
    ['"'] = '"',
    ["'"] = "'",
    ['\\'] = '\\',
}

local function trim(value)
    return value:match('^%s*(.-)%s*$') or ''
end

local function unescape(character)
    return ESCAPES[character] or ('\\' .. character)
end

local function cast(raw)
    local quote = raw:sub(1, 1)

    if quote == '"' or quote == "'" then
        local quoted = raw:match('^' .. quote .. '(.*)' .. quote)

        if quoted then
            return (quoted:gsub('\\(.)', unescape))
        end
    end

    local value = trim((raw:gsub('%s+#.*$', '')))
    local keyword = KEYWORDS[value]

    if keyword ~= nil then
        return keyword
    end

    return tonumber(value) or value
end

local function read(path)
    local file = fileOpen(path, true)

    if not file then
        return nil
    end

    local content = fileRead(file, fileGetSize(file))

    fileClose(file)

    return content
end

local function parse(path, content)
    local values = {}
    local number = 0

    for line in (content .. '\n'):gmatch('(.-)\r?\n') do
        number = number + 1

        local trimmed = trim(line)

        if trimmed ~= '' and trimmed:sub(1, 1) ~= '#' then
            local key, raw = trimmed:match('^([%a_][%w_]*)%s*=%s*(.*)$')

            if not key then
                error('Malformed entry in "' .. path .. '" on line ' .. number .. '. Expected "KEY=value".')
            end

            values[key] = cast(raw)
        end
    end

    return values
end

local function seal(path, values)
    return setmetatable({}, {
        __index = function(_, key)
            local value = values[key]

            if value == nil then
                error('"' .. tostring(key) .. '" is not declared in "' .. path .. '".', 2)
            end

            return value
        end,

        __newindex = function(_, key)
            error('The environment is read-only and "' .. tostring(key) .. '" cannot be assigned.', 2)
        end,

        __metatable = false,
    })
end

if localPlayer ~= nil then
    return
end

Dotenv = {}
Dotenv.__index = Dotenv

function Dotenv.new(path)
    path = path or DEFAULT_FILE

    local content = read(path)

    if not content then
        error('Failed to read the environment file "' .. tostring(path) .. '".', 2)
    end

    local self = setmetatable({}, Dotenv)

    self.path = path
    self.values = parse(path, content)

    return self
end

function Dotenv:get(key, default)
    local value = self.values[key]

    if value == nil then
        return default
    end

    return value
end

function Dotenv:has(key)
    return self.values[key] ~= nil
end

function Dotenv:all()
    local copy = {}

    for key, value in pairs(self.values) do
        copy[key] = value
    end

    return copy
end

function Dotenv:apply()
    if type(process) ~= 'table' then
        process = {}
    end

    process.env = seal(self.path, self.values)
    env = process.env

    return process.env
end
