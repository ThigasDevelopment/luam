local classes = {}

local constructors = {}

local BLOCKED_METAMETHODS = {
    ['__call'] = true,
    ['__index'] = true,
    ['__newindex'] = true,
}

local function bindSuper(value, inherited)
    return function(self, ...)
        local previous = rawget(self, 'super')

        self.super = function(_, ...)
            return inherited(self, ...)
        end

        local result = value(self, ...)

        self.super = previous

        return result
    end
end

local function create(name, struct, options)
    if classes[name] then
        error('Class ' .. tostring(name) .. ' already exists.')
    end

    local definition = {
        __name = name,
        __super = options.super,
        __metamethods = options.metamethods,
    }

    for key, value in pairs(struct) do
        local inherited = definition.__super and definition.__super[key]

        if type(value) == 'function' and type(inherited) == 'function' then
            definition[key] = bindSuper(value, inherited)
        else
            definition[key] = value
        end
    end

    if definition.__super then
        setmetatable(definition, { __index = definition.__super })
    end

    classes[name] = definition

    return definition
end

function class(name)
    local options = { super = nil, metamethods = nil }

    local modifiers = {
        extends = function(self, super)
            options.super = classes[super]

            if not options.super then
                error('Class ' .. tostring(name) .. ' extends ' .. tostring(super) .. ', which is not defined.')
            end

            return self
        end,

        metamethods = function(self, metamethods)
            options.metamethods = metamethods

            return self
        end,
    }

    return setmetatable({}, {
        __index = function(_, key)
            if modifiers[key] then
                return modifiers[key]
            end

            local definition = classes[name]

            if not definition then
                return nil
            end

            return definition[key]
        end,

        __call = function(_, struct)
            return create(name, struct, options)
        end,
    })
end

local function instanceMetatable(definition)
    local meta = { __index = definition }

    if not definition.__metamethods then
        return meta
    end

    for key, value in pairs(definition.__metamethods) do
        if BLOCKED_METAMETHODS[key] then
            error('Cannot override metamethod ' .. tostring(key) .. '.')
        end

        meta[key] = value
    end

    return meta
end

local function createConstructor(definition)
    local meta = instanceMetatable(definition)

    return function(...)
        local instance = setmetatable({}, meta)

        if type(instance.constructor) == 'function' then
            instance:constructor(...)
        end

        return instance
    end
end

function new(name)
    local definition = classes[name]

    if not definition then
        error('Class ' .. tostring(name) .. ' is not defined.')
    end

    local constructor = constructors[definition]

    if not constructor then
        constructor = createConstructor(definition)
        constructors[definition] = constructor
    end

    return constructor
end

function bind(func, self)
    if type(func) ~= 'function' then
        error('Cannot bind a value of type ' .. type(func) .. '.')
    end

    return function(...)
        return func(self, ...)
    end
end

function enum(names)
    local values = {}

    if type(names) ~= 'table' then
        return values
    end

    for index = 1, #names do
        values[names[index]] = index - 1
    end

    return values
end

function getClasses()
    return classes
end

function getClass(name)
    return classes[name]
end
