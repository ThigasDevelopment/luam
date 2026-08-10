---@class ClassDefinition
---@field __name string Nome da classe
---@field __super ClassDefinition|nil Superclasse (se houver)
---@field __implements string[] Lista de interfaces implementadas
---@field __metamethods table|nil Metamétodos customizados
---@field constructor fun(self: table, ...): any
---@field super fun(self: table, ...): any|nil Chamada para métodos da superclasse
---@field [string] any Métodos ou propriedades dinâmicas

---@class ClassModifiers
---@field extends fun(self: ClassModifiers, super: string): ClassModifiers
---@field implements fun(self: ClassModifiers, interface: string): ClassModifiers
---@field metamethods fun(self: ClassModifiers, metamethods: table): ClassModifiers

---@type table<string, ClassDefinition>
local classes = { };

---@type table<string, table<string, string>>
local interfaces = { };

---@param name string
---@param struct table<string, any>
---@param options { super: ClassDefinition|nil, implements: string[], metamethods: table|nil }
---@return ClassDefinition
local function create (name, struct, options)
    if (classes[name]) then
        error ('Class ' .. name .. ' already exists.');
    end

    local newClass = {
        __name = name,
        __super = options.super,
        __implements = options.implements,
        __metamethods = options.metamethods,
    };

    for key, value in pairs (struct) do
        if (newClass.__super) and (type (newClass.__super[key]) == 'function') then
            local method = newClass.__super[key];
            newClass[key] = function (self, ...)
                local old = rawget (self, 'super');
                self.super = function (t, ...)
                    return method (self, ...);
                end

                local result = value (self, ...);
                self.super = old;

                return result;
            end
        else
            newClass[key] = value;
        end
    end

    if (newClass.__super) then
        setmetatable (newClass, { __index = newClass.__super });
    end

    local isLuaType = {
        ['nil'] = true,

        ['table'] = true,
        
        ['number'] = true,
        ['string'] = true,
        ['thread'] = true,

        ['boolean'] = true,
        
        ['function'] = true,
        ['userdata'] = true,
    };

    local function checkImplements (name, check, object)
        local class, interface = newClass, interfaces[name];
        if (not interface) then
            error ('Interface \'' .. name .. '\' does not exist.');
        end

        if (check) then
            local objectType = type (object);
            if (objectType ~= 'table') then
                error ('Class \'' .. newClass.__name .. '\' does not implement interface \'' .. name .. '\'. Expected \'table\', got \'' .. objectType .. '\'.');
            end

            class = object;
        end

        for method, value in pairs (interface) do
            local isLua = isLuaType[value];
            if (isLua) then
                local realType = type (class[method]);
                if (realType ~= value) then
                    error ('Class \'' .. newClass.__name .. '\' does not implement method \'' .. method .. '\' of interface \'' .. name .. '\'. Expected type \'' .. value .. '\', got \'' .. realType .. '\'.');
                end
            else
                checkImplements (value, true, newClass[method]);
            end
        end
        return true;
    end
    
    for _, interfaceName in pairs (newClass.__implements) do
        checkImplements (interfaceName);
    end

    classes[name] = newClass;
    return classes[name];
end

---@param name string
---@return ClassModifiers
function class (name)
    local options = {
        super = nil,
        implements = { },
        metamethods = nil,
    };

    local modifiers = {
        extends = function (self, super)
            options.super = classes[super];
            
            return self;
        end,

        implements = function (self, interface)
            options.implements[#options.implements + 1] = interface;

            return self;
        end,

        metamethods = function (self, metamethods)
            options.metamethods = metamethods;

            return self;
        end,
    };

    return setmetatable ({ }, {
        __index = function (self, key)
            if (modifiers[key]) then
                return modifiers[key];
            end

            if (classes[name]) then
                return classes[name][key];
            end
            return false;
        end,

        __call = function (self, methods)
            if (classes[name]) then
                return false;
            end
            return create (name, methods, options);
        end,
    });
end

---@param name string
---@return fun(struct: table<string, string>): table
function interface (name)
    local interface = interfaces[name];
    if (interface) then
        return function ()
            return interface;
        end
    end

    return function (struct)
        interfaces[name] = struct;
        return interfaces[name];
    end
end

---@generic T, P
---@param name string
---@return fun(props: P): T|false
function new (name)
    local class = classes[name];
    if (not class) then
        return function ()
            return false;
        end
    end

    return function (...)
        local meta = { __index = class };
        if (class.__metamethods) then
            local blockeds = {
                ['__call'] = true,
                ['__index'] = true,
                ['__newindex'] = true,
            };

            for key, value in pairs (class.__metamethods) do
                local blocked = blockeds[key];
                if (blocked) then
                    error ('Cannot override metamethod ' .. key .. '.');
                else
                    meta[key] = value;
                end
            end
        end

        local instance = setmetatable ({ }, meta);

        local consType = type (instance.constructor);
        if (consType == 'function') then
            instance:constructor (...);
        end

        return instance;
    end
end

---@generic F: function
---@param func F
---@param self any
---@return F|false
function bind (func, self)
    local funcType = type (func);
    if (funcType ~= 'function') then
        return function ()
            return false;
        end
    end

    return function (...)
        return func (self, ...);
    end
end

---@param names string[]
---@return table<string, number>
function enum (names)
    local t = { };
    if (type (names) ~= 'table') then
        return t;
    end

    for i = 0, (#names - 1) do
        local name = names[i + 1];
        t[name] = i;
    end
    return t;
end

---@return table<string, ClassDefinition>
function getClasses ()
    return classes;
end

---@param name string
---@return ClassDefinition | nil
function getClass (name)
    return classes[name];
end