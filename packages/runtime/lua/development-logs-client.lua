local luamOriginalOutputDebugString = outputDebugString;
local luamDevelopmentEvent = 'luam:development-log';
local luamMaximumMessageLength = __LUAM_MAX_MESSAGE_LENGTH__; -- Replaced at build time with the limit the manifest sets.

---@param message string
---@param level? number
---@param red? number
---@param green? number
---@param blue? number
---@return boolean
function outputDebugString (message, level, red, green, blue)
	local result = luamOriginalOutputDebugString (message, level, red, green, blue);

	if (type (message) == 'string') and (#message <= luamMaximumMessageLength) and (level == nil or type (level) == 'number') then
		triggerServerEvent (luamDevelopmentEvent, resourceRoot, message, level or 3);
	end

	return result;
end
