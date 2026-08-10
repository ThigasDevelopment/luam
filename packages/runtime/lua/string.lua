local function trim(value)
    if type(value) ~= 'string' then
        return tostring(value)
    end

    return value:match('^%s*(.-)%s*$') or ''
end

local function resolve(context, path)
    local current = context

    for key in path:gmatch('[^%.]+') do
        if type(current) ~= 'table' then
            return nil
        end

        current = current[key]

        if current == nil then
            return nil
        end
    end

    return current
end

local function parse(raw)
    local key, rest = raw:match('^(.-):(.+)$')

    if not key then
        return raw, nil
    end

    return key, trim(rest:match('^([^:]+)'))
end

function string.trim(value)
    return trim(value)
end

function string.startsWith(value, prefix)
    if type(value) ~= 'string' or type(prefix) ~= 'string' then
        return false
    end

    return value:sub(1, prefix:len()) == prefix
end

function string.endsWith(value, suffix)
    if type(value) ~= 'string' or type(suffix) ~= 'string' then
        return false
    end

    if suffix == '' then
        return true
    end

    return value:sub(-suffix:len()) == suffix
end

function string.template(text, context)
    if type(text) ~= 'string' then
        return tostring(text)
    end

    if type(context) ~= 'table' or next(context) == nil then
        return text
    end

    return (
        text:gsub('%${(.-)}', function(raw)
            local key, default = parse(trim(raw))
            local value = resolve(context, trim(key))

            if value == nil then
                return default ~= nil and default or ''
            end

            return tostring(value)
        end)
    )
end
