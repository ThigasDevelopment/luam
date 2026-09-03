local MAX_DEPTH = 16;
local MAX_ENTRIES = 4096;
local MAX_STRING = 65536;

local describe, check;

---@param path string
---@param segment string
---@return string
local function joinPath (path, segment)
	if (path == '') then
		return segment;
	end

	return path .. '.' .. segment;
end

---@param descriptor table
---@return string
local function describeUnion (descriptor)
	local parts = { };

	for index = 1, #descriptor.options do
		parts[index] = describe (descriptor.options[index]);
	end

	return table.concat (parts, ' | ');
end

---@param descriptor table
---@return string
describe = function (descriptor)
	local kind = descriptor.kind;

	if (kind == 'literal') then
		if (type (descriptor.value) == 'string') then
			return '\'' .. descriptor.value .. '\'';
		end

		return tostring (descriptor.value);
	end

	if (kind == 'optional') then
		return describe (descriptor.element) .. '?';
	end

	if (kind == 'array') then
		return describe (descriptor.element) .. '[]';
	end

	if (kind == 'map') then
		return 'table<' .. describe (descriptor.key) .. ', ' .. describe (descriptor.value) .. '>';
	end

	if (kind == 'union') then
		return describeUnion (descriptor);
	end

	if (kind == 'record') or (kind == 'instance') then
		return descriptor.name;
	end

	return kind;
end

---@param path string
---@param descriptor table
---@param reason? string
local function fail (path, descriptor, reason)
	local place = (path == '') and 'value' or ('"' .. path .. '"');

	if (reason ~= nil) then
		error ('luam-validate: ' .. place .. ' ' .. reason, 0);
	end

	error ('luam-validate: ' .. place .. ' expected "' .. describe (descriptor) .. '"', 0);
end

---@param value table
---@param path string
---@param descriptor table
---@return number
local function countEntries (value, path, descriptor)
	local total = 0;

	for _ in pairs (value) do
		total = total + 1;

		if (total > MAX_ENTRIES) then
			fail (path, descriptor, 'has more than ' .. MAX_ENTRIES .. ' entries');
		end
	end

	return total;
end

---@param value table
---@param name string
---@return boolean
local function isInstanceOf (value, name)
	local meta = getmetatable (value);
	local definition = meta and meta.__index;
	local depth = 0;

	while (type (definition) == 'table') and (depth <= MAX_DEPTH) do
		if (definition.__name == name) then
			return true;
		end

		definition = definition.__super;
		depth = depth + 1;
	end

	return false;
end

---@param value table
---@param descriptor table
---@param path string
---@param depth number
---@return table
local function checkRecord (value, descriptor, path, depth)
	countEntries (value, path, descriptor);

	for index = 1, #descriptor.members do
		local member = descriptor.members[index];

		check (value[member.key], member.value, joinPath (path, member.key), depth + 1);
	end

	return value;
end

---@param value table
---@param descriptor table
---@param path string
---@param depth number
---@return table
local function checkArray (value, descriptor, path, depth)
	local total = countEntries (value, path, descriptor);

	for index = 1, total do
		check (value[index], descriptor.element, path .. '[' .. index .. ']', depth + 1);
	end

	return value;
end

---@param value table
---@param descriptor table
---@param path string
---@param depth number
---@return table
local function checkMap (value, descriptor, path, depth)
	countEntries (value, path, descriptor);

	for key, entry in pairs (value) do
		check (key, descriptor.key, joinPath (path, tostring (key)) .. ' (key)', depth + 1);
		check (entry, descriptor.value, joinPath (path, tostring (key)), depth + 1);
	end

	return value;
end

---@param value any
---@param descriptor table
---@param depth number
---@return boolean
local function matches (value, descriptor, depth)
	local ok = pcall (check, value, descriptor, '', depth);

	return ok;
end

---@param value any
---@param descriptor table
---@param path string
---@param depth number
---@return any
check = function (value, descriptor, path, depth)
	if (depth > MAX_DEPTH) then
		fail (path, descriptor, 'is nested deeper than ' .. MAX_DEPTH .. ' levels');
	end

	local kind = descriptor.kind;

	if (kind == 'any') then
		return value;
	end

	if (kind == 'optional') then
		if (value == nil) then
			return value;
		end

		return check (value, descriptor.element, path, depth);
	end

	if (kind == 'nil') then
		if (value ~= nil) then
			fail (path, descriptor);
		end

		return value;
	end

	if (kind == 'literal') then
		if (value ~= descriptor.value) then
			fail (path, descriptor);
		end

		return value;
	end

	if (kind == 'string') or (kind == 'number') or (kind == 'boolean') or (kind == 'userdata') or (kind == 'thread') or (kind == 'function') then
		if (type (value) ~= kind) then
			fail (path, descriptor);
		end

		if (kind == 'string') and (#value > MAX_STRING) then
			fail (path, descriptor, 'is longer than ' .. MAX_STRING .. ' characters');
		end

		return value;
	end

	if (kind == 'table') then
		if (type (value) ~= 'table') then
			fail (path, descriptor);
		end

		return value;
	end

	if (kind == 'union') then
		for index = 1, #descriptor.options do
			if (matches (value, descriptor.options[index], depth)) then
				return value;
			end
		end

		fail (path, descriptor);
	end

	if (type (value) ~= 'table') then
		fail (path, descriptor);
	end

	if (kind == 'record') then
		return checkRecord (value, descriptor, path, depth);
	end

	if (kind == 'array') then
		return checkArray (value, descriptor, path, depth);
	end

	if (kind == 'map') then
		return checkMap (value, descriptor, path, depth);
	end

	if (kind == 'instance') then
		if (not isInstanceOf (value, descriptor.name)) then
			fail (path, descriptor);
		end

		return value;
	end

	return value;
end

---@param value any
---@param descriptor table
---@return any
function __luam_validate (value, descriptor)
	return check (value, descriptor, '', 1);
end

---@param value any
---@param descriptor table
---@return boolean
function __luam_matches (value, descriptor)
	return matches (value, descriptor, 1);
end
