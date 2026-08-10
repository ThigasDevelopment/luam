---@class Process
---@field env table<string, string|number|boolean> Read-only view of the loaded environment

---@class Dotenv
---@field path string Path of the loaded file
---@field values table<string, string|number|boolean> Parsed key/value pairs
---@field get fun(self: Dotenv, key: string, default?: any): any
---@field has fun(self: Dotenv, key: string): boolean
---@field all fun(self: Dotenv): table<string, string|number|boolean>
---@field apply fun(self: Dotenv): table<string, string|number|boolean>

local IS_CLIENT_SIDE = localPlayer;
if (IS_CLIENT_SIDE) then return end;

---@type table<string, boolean>
local KEYWORDS = {
	['true'] = true,
	['false'] = false,
};

---@type table<string, string>
local ESCAPES = {
	['n'] = '\n',
	['r'] = '\r',
	['t'] = '\t',
	['"'] = '"',
	['\''] = '\'',
	['\\'] = '\\',
};

---@param path string
---@return string|nil
local function load (path)
	local pathType = type (path);
	if (pathType ~= 'string') or (not string.find (path, '%.env')) then return end;

	local file = fileOpen (path, true);
	if (not file) then return end;

	local content = fileRead (file, fileGetSize (file));
	fileClose (file);

	return content;
end

---@param s string
---@return string
local function trim (s)
	return s:match ('^%s*(.-)%s*$') or '';
end

---@param raw string
---@return string|number|boolean
local function cast (raw)
	local quote = raw:sub (1, 1);
	if (quote == '"') or (quote == '\'') then
		local quoted = raw:match ('^' .. quote .. '(.*)' .. quote);
		if (quoted) then
			return (quoted:gsub ('\\(.)',
				---@param character string
				---@return string
				function (character)
					return ESCAPES[character] or ('\\' .. character);
				end
			));
		end
	end

	local value = trim ((raw:gsub ('%s+#.*$', '')));

	local keyword = KEYWORDS[value];
	if (keyword ~= nil) then
		return keyword;
	end

	local number = tonumber (value);
	if (number) then
		return number;
	end

	return value;
end

---@param path string
---@param content string
---@return table<string, string|number|boolean>
local function process (path, content)
	local values = { };
	local number = 0;

	for line in (content .. '\n'):gmatch ('(.-)\r?\n') do
		number = (number + 1);

		local trimmed = trim (line);
		local comment = (trimmed:sub (1, 1) == '#');

		if (trimmed ~= '') and (not comment) then
			local key, raw = trimmed:match ('^([%a_][%w_]*)%s*=%s*(.*)$');
			if (not key) then
				error ('Malformed entry at \'' .. path .. '\' line ' .. number .. '. Expected \'KEY=value\'.');
			end

			values[key] = cast (raw);
		end
	end

	return values;
end

Dotenv = { };
Dotenv.__index = Dotenv;

---@param path? string
---@return Dotenv
function Dotenv.new (path)
	path = (path or '.env');

	local content = load (path);
	if (not content) then
		error ('Failed to load environments from \'' .. tostring (path) .. '\'.');
	end

	---@type Dotenv
	local self = setmetatable ({ }, Dotenv);
	self.path = path;
	self.values = process (path, content);

	return self;
end

---@param key string
---@param default? any
---@return any
function Dotenv:get (key, default)
	local value = self.values[key];
	if (value == nil) then
		return default;
	end
	return value;
end

---@param key string
---@return boolean
function Dotenv:has (key)
	return (self.values[key] ~= nil);
end

---@return table<string, string|number|boolean>
function Dotenv:all ()
	local copy = { };

	for key, value in pairs (self.values) do
		copy[key] = value;
	end
	return copy;
end

---@return table<string, string|number|boolean>
function Dotenv:apply ()
	local path = self.path;
	local values = self:all ();

	if (process == nil) then
		---@type Process
		process = { };
	end

	process.env = setmetatable ({ }, {
		---@param key string
		---@return string|number|boolean
		__index = function (_, key)
			local value = values[key];
			if (value == nil) then
				error ('\'' .. tostring (key) .. '\' is not declared in \'' .. path .. '\'.', 2);
			end
			return value;
		end,

		---@param key string
		__newindex = function (_, key)
			error ('\'process.env\' is read-only and \'' .. tostring (key) .. '\' cannot be assigned.', 2);
		end,

		__metatable = false,
	});

	return process.env;
end
