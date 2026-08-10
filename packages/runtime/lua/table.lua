function table.size(value)
    local size = 0

    if type(value) ~= 'table' then
        return size
    end

    for _ in pairs(value) do
        size = size + 1
    end

    return size
end

function table.isEmpty(value)
    if type(value) ~= 'table' then
        return true
    end

    return next(value) == nil
end

function table.keys(value)
    local keys = {}

    if type(value) ~= 'table' then
        return keys
    end

    for key in pairs(value) do
        keys[#keys + 1] = key
    end

    return keys
end

function table.values(value)
    local values = {}

    if type(value) ~= 'table' then
        return values
    end

    for _, item in pairs(value) do
        values[#values + 1] = item
    end

    return values
end

function table.includes(value, item)
    if type(value) ~= 'table' then
        return false
    end

    for _, current in pairs(value) do
        if current == item then
            return true
        end
    end

    return false
end
