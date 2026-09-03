local classes = { };
local constructors = { };

local ALLOWED_METAMETHODS = {
	['__tostring'] = true,
	['__eq'] = true,
	['__lt'] = true,
	['__le'] = true,
	['__len'] = true,
	['__concat'] = true,
	['__unm'] = true,
	['__add'] = true,
	['__sub'] = true,
	['__mul'] = true,
	['__div'] = true,
	['__mod'] = true,
	['__pow'] = true,
};

local BLOCKED_METAMETHODS = {
	['__call'] = true,
	['__index'] = true,
	['__newindex'] = true,
};

---@param value fun(self: table, ...): any
---@param inherited fun(self: table, ...): any
---@return fun(self: table, ...): any
local function bindSuper (value, inherited)
	return function (self, ...)
		local previous = rawget (self, 'super');

		self.super = function (_, ...)
			return inherited (self, ...);
		end

		local result = value (self, ...);
		self.super = previous;

		return result;
	end
end

---@param definition table
---@param key string
---@param value fun(self: table, ...): any
---@return fun(self: table, ...): any
local function bindLateSuper (definition, key, value)
	return function (self, ...)
		local inherited = definition.__super and definition.__super[key];

		if (type (inherited) ~= 'function') then
			return value (self, ...);
		end

		return bindSuper (value, inherited) (self, ...);
	end
end

---@param name string
---@return table
local function declare (name)
	local existing = classes[name];
	if (existing) then
		return existing;
	end

	local definition = { __name = name, __pending = true };
	classes[name] = definition;

	return definition;
end

---@param definition table
---@return string?
local function pendingAncestor (definition)
	local current = definition.__super;

	while (current) do
		if (current.__pending) then
			return current.__name;
		end

		current = current.__super;
	end

	return nil;
end

---@param name string
---@param struct table
---@param options table
---@return table
local function create (name, struct, options)
	local definition = classes[name];

	if (definition) and (not definition.__pending) then
		error ('Class ' .. tostring (name) .. ' already exists.');
	end

	definition = definition or { __name = name };
	definition.__pending = false;
	definition.__super = options.super;
	definition.__metamethods = options.metamethods;

	local pending = definition.__super and definition.__super.__pending;

	for key, value in pairs (struct) do
		local inherited = definition.__super and definition.__super[key];

		if (type (value) ~= 'function') then
			definition[key] = value;
		elseif (pending) then
			definition[key] = bindLateSuper (definition, key, value);
		elseif (type (inherited) == 'function') then
			definition[key] = bindSuper (value, inherited);
		else
			definition[key] = value;
		end
	end

	if (definition.__super) then
		setmetatable (definition, { __index = definition.__super });
	end

	classes[name] = definition;

	return definition;
end

---@param name string
---@return table
function class (name)
	local options = { super = nil, metamethods = nil };

	local modifiers = {
		extends = function (self, super)
			options.super = declare (super);

			return self;
		end,

		metamethods = function (self, metamethods)
			options.metamethods = metamethods;

			return self;
		end,
	};

	return setmetatable ({ }, {
		__index = function (_, key)
			if (modifiers[key]) then
				return modifiers[key];
			end

			local definition = classes[name];
			if (not definition) then
				return nil;
			end

			return definition[key];
		end,

		__call = function (_, struct)
			return create (name, struct, options);
		end,
	});
end

---@param meta table
---@param source table
local function installMetamethods (meta, source)
	for key, value in pairs (source) do
		if (BLOCKED_METAMETHODS[key]) then
			error ('Cannot override metamethod ' .. tostring (key) .. '.');
		end

		if (ALLOWED_METAMETHODS[key]) then
			meta[key] = value;
		end
	end
end

---@param meta table
---@param definition table
local function inheritedMetamethods (meta, definition)
	local chain = { };
	local current = definition.__super;

	while (type (current) == 'table') do
		table.insert (chain, current);

		current = current.__super;
	end

	for index = #chain, 1, -1 do
		installMetamethods (meta, chain[index]);
	end
end

---@param definition table
---@return table
local function instanceMetatable (definition)
	local meta = { __index = definition };

	inheritedMetamethods (meta, definition);
	installMetamethods (meta, definition);

	if (definition.__metamethods) then
		installMetamethods (meta, definition.__metamethods);
	end

	return meta;
end

---@param definition table
---@return fun(...): table
local function createConstructor (definition)
	local meta = instanceMetatable (definition);

	return function (...)
		local instance = setmetatable ({ }, meta);

		if (type (instance.constructor) == 'function') then
			instance:constructor (...);
		end

		return instance;
	end
end

---@param name string
---@return fun(...): table
function new (name)
	local definition = classes[name];

	if (not definition) or (definition.__pending) then
		error ('Class ' .. tostring (name) .. ' is not defined.');
	end

	local constructor = constructors[definition];
	if (not constructor) then
		local missing = pendingAncestor (definition);

		if (missing) then
			error ('Class ' .. tostring (name) .. ' extends ' .. tostring (missing) .. ', which is not defined.');
		end

		constructor = createConstructor (definition);
		constructors[definition] = constructor;
	end

	return constructor;
end

---@param func fun(...): any
---@param self table
---@return fun(...): any
function bind (func, self)
	if (type (func) ~= 'function') then
		error ('Cannot bind a value of type ' .. type (func) .. '.');
	end

	return function (...)
		return func (self, ...);
	end
end

---@param names table
---@return table<string, number>
function enum (names)
	local values = { };

	if (type (names) ~= 'table') then
		return values;
	end

	for index = 1, #names do
		values[names[index]] = index - 1;
	end

	return values;
end

---@return table<string, table>
function getClasses ()
	local defined = { };

	for name, definition in pairs (classes) do
		if (not definition.__pending) then
			defined[name] = definition;
		end
	end

	return defined;
end

---@param name string
---@return table?
function getClass (name)
	local definition = classes[name];

	if (not definition) or (definition.__pending) then
		return nil;
	end

	return definition;
end
