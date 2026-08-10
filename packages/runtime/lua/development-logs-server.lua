local luamDevelopmentEvent = "luam:development-log"
local luamDevelopmentMarker = "__LUAM_DEV_LOG__"
local luamMaximumMessageLength = __LUAM_MAX_MESSAGE_LENGTH__
local luamRateLimit = __LUAM_RATE_LIMIT__
local luamRateWindow = __LUAM_RATE_WINDOW_MS__
local luamRateBuckets = {}

addEvent(luamDevelopmentEvent, true)
addEventHandler(luamDevelopmentEvent, resourceRoot, function(message, level)
    if client == nil or source ~= resourceRoot or type(message) ~= "string" or #message > luamMaximumMessageLength then
        return
    end

    if type(level) ~= "number" or level < 0 or level > 4 or level ~= math.floor(level) then
        return
    end

    local now = getTickCount()
    local bucket = luamRateBuckets[client]

    if bucket == nil or now < bucket.started or now - bucket.started >= luamRateWindow then
        bucket = { started = now, count = 0 }
        luamRateBuckets[client] = bucket
    end

    if bucket.count >= luamRateLimit then
        return
    end

    bucket.count = bucket.count + 1

    local record = {
        environment = "client",
        level = level,
        message = message,
        resource = getResourceName(getThisResource())
    }

    outputDebugString(luamDevelopmentMarker .. toJSON(record, true), 4)
end)

addEventHandler("onPlayerQuit", root, function()
    luamRateBuckets[source] = nil
end)
