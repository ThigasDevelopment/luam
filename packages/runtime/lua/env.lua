local ENVIRONMENT_FILE = '__LUAM_ENV_FILE__'; -- Replaced at build time with the file the manifest selects. (.env, .env.development, ...)

---@param str string
---@return string
local function trim (str)
	return str:match ('^%s*(.-)%s*$');
end

---@param path string
---@return string
local function load (path)
	local pathType = type (path);
	if (pathType ~= 'string') then
		error ('bad argument #1 to \'load\' (\'string\' expected got \'' .. pathType .. '\').', 2);
	end

	if (not fileExists (path)) then return end

	local file = fileOpen (path, true);
	if (not file) then
		error ('Failed to open environment file.', 2);
	end

	local content = fileRead (file, fileGetSize (file));
	fileClose (file);

	return content;
end

---@param value string
---@return boolean | number | string
local function normalize (value)
	local number = tonumber (value);
	if (number) then
		value = number;
	elseif (value:lower () == 'true') then
		value = true;
	elseif (value:lower () == 'false') then
		value = false;
	end
	return value;
end

---@param content string
---@return table<string, any>
local function parse (content)
	local result = { };

	local lines = content:gmatch ('[^\r\n]+');
	for line in lines do
		line = trim (line);
		if (line ~= '') and (not line:find ('^#')) then
			local key, value = line:match ('^([%w_]+)%s*=%s*(.*)$');
			if (key and value) then
				if (value:sub (1, 1) == '"' and value:sub (-1) == '"') or (value:sub (1, 1) == "'" and value:sub (-1) == "'") then
					value = value:sub (2, -2);
				end

				local value = normalize (value);
				result[key] = value;
			end
		end
	end

	return result;
end

local content = load (ENVIRONMENT_FILE);
if (not content) then return end
content = parse (content);

env = setmetatable ({ }, {
	---@param _ string | number
	---@param key string
	---@return boolean | number | string
	__index = function (_, key)
		local value = content[key];
		if (value == nil) then
			error ('"' .. tostring(key) .. '" is not declared in "' .. ENVIRONMENT_FILE .. '".', 2);
		end
		return value;
	end,

	---@param _ string | number
	---@param key string
	__newindex = function (_, key)
		error ('The environment is read-only and "' .. tostring(key) .. '" cannot be assigned.', 2);
	end,

	__metatable = false,
});
