---@param s string
---@param t table
---@return string
function string.template (s, t)
    local sType = type (s);
    if (sType ~= 'string') then
        return tostring (s);
    end

    local tType = type (t);
    if (tType ~= 'table') or (next (t) == nil) then
        return s;
    end
    
    ---@param s string
    ---@return string
    local function trim (s)
        local sType = type (s);
        if (sType ~= 'string') then
            return tostring (s);
        end
        return s:match ('^%s*(.-)%s*$') or '';
    end

    ---@param t table
    ---@param p string
    ---@return any
    local function nested (t, p)
        local current = t;

        ---@param key string
        for key in p:gmatch ('[^%.]+') do
            local cType = type (current);
            if (cType ~= 'table') then
                return nil;
            end

            current = current[key];
            if (current == nil) then
                return nil;
            end
        end
        return current;
    end

    ---@param raw string
    ---@return string
    local function parse (raw)
        local key, rest = raw:match ('^(.-):(.+)$');
        if (not key) then
            return raw, nil;
        end

        local default = rest:match ('^([^:]+)');
        default = trim (default);

        return key, default;
    end
    
    return (
        s:gsub ('%${(.-)}',
            ---@param raw string
            ---@return string
            function (raw)
                raw = trim (raw);

                local key, default = parse (raw);
                key = trim (key);

                local value = nested (t, key);
                if (value == nil) then
                    return (default ~= nil and trim (default) or '');
                end
                return tostring (value);
            end
        )
    );
end