local PRIORITIES = {
    low = { pulsing = 250, frame = 8 },
    normal = { pulsing = 100, frame = 15 },
    high = { pulsing = 50, frame = 25 },
    extreme = { pulsing = 0, frame = 50 },
}

local STYLES = {
    concurrent = true,
    priority = true,
    sequential = true,
}

function sleep(milliseconds)
    milliseconds = tonumber(milliseconds) or 0

    if milliseconds < 1 then
        coroutine.yield()
        return
    end

    local start = getTickCount()

    repeat
        coroutine.yield()
    until (getTickCount() - start) >= milliseconds
end

local Thread = {}
Thread.__index = Thread

function Thread:get()
    return self.priority
end

function Thread:set(priority)
    priority = tonumber(priority)
    if not priority or self.priority == priority then
        return false
    end

    self.priority = priority
    return true
end

function Thread:pause()
    if self.paused then
        return false
    end

    self.paused = true
    return true
end

function Thread:resume()
    if not self.paused then
        return false
    end

    self.paused = false
    return true
end

function Thread:isPaused()
    return self.paused
end

function Thread:isStarted()
    return self.started
end

Threads = {}
Threads.__index = Threads

local function resumeThread(self, id, thread)
    if coroutine.status(thread.routine) == 'dead' then
        self:remove(id)
        return false
    end

    if thread:isPaused() then
        return false
    end

    local success, message
    if thread:isStarted() then
        success, message = coroutine.resume(thread.routine, thread)
    else
        success, message = coroutine.resume(thread.routine, thread, unpack(thread.arguments))
        thread.started = true
    end

    if not success then
        self:remove(id)
        error('[Threads] Thread ' .. tostring(id) .. ' failed: ' .. tostring(message))
    end

    return true
end

function Threads.new(style, priority)
    local self = setmetatable({}, Threads)

    self.threads = {}
    self.nextId, self.currentId = 0, -1
    self.type, self.priority = 'concurrent', 'normal'
    self.timer = nil
    self:setType(style)
    self:setPriority(priority)

    return self
end

function Threads:add(func, options, ...)
    options = options or {}

    local thread = setmetatable({
        routine = coroutine.create(func),
        arguments = { ... },
        paused = false,
        started = false,
        priority = options.priority or -1,
    }, Thread)

    local id = self.nextId + 1
    self.nextId = id
    self.threads[id] = thread

    self:start()
    return id
end

function Threads:remove(id)
    if not self.threads[id] then
        return false
    end

    if self.currentId == id then
        self.currentId = -1
    end

    self.threads[id] = nil
    return true
end

function Threads:clear()
    if next(self.threads) == nil then
        return false
    end

    self.threads, self.currentId = {}, -1

    self:stop()
    return true
end

function Threads:start()
    if isTimer(self.timer) then
        return false
    end

    self.timer = setTimer(function()
        self:process()
    end, PRIORITIES[self.priority].pulsing, 0)
    return true
end

function Threads:stop()
    if isTimer(self.timer) then
        killTimer(self.timer)
    end
    self.timer = nil
end

function Threads:processQueue(sorted)
    local queue = {}

    for id, thread in pairs(self.threads) do
        queue[#queue + 1] = { id = id, thread = thread }
    end

    if sorted then
        table.sort(queue, function(left, right)
            return left.thread:get() > right.thread:get()
        end)
    end

    local frames = 0
    for _, item in ipairs(queue) do
        if frames >= PRIORITIES[self.priority].frame then
            return
        end

        if resumeThread(self, item.id, item.thread) then
            frames = frames + 1
        end
    end
end

function Threads:processSequential()
    if not self.threads[self.currentId] then
        self.currentId = -1

        for id in pairs(self.threads) do
            self.currentId = id
            break
        end
    end

    local thread = self.threads[self.currentId]
    if not thread then
        return
    end

    local frames = 0
    while frames < PRIORITIES[self.priority].frame do
        if not resumeThread(self, self.currentId, thread) then
            return
        end

        frames = frames + 1
    end
end

function Threads:process()
    if self.type == 'sequential' then
        self:processSequential()
    else
        self:processQueue(self.type == 'priority')
    end

    if next(self.threads) == nil then
        self:stop()
    end
end

function Threads:getType()
    return self.type
end

function Threads:setType(style)
    if type(style) ~= 'string' then
        return false
    end

    style = style:lower()
    if not STYLES[style] or self.type == style then
        return false
    end

    self.type = style
    return true
end

function Threads:getPriority()
    return self.priority
end

function Threads:setPriority(priority)
    if type(priority) ~= 'string' or not PRIORITIES[priority] or self.priority == priority then
        return false
    end

    self.priority = priority
    if isTimer(self.timer) then
        self:stop()
        self:start()
    end
    return true
end

function Threads:getThread(id)
    return self.threads[id]
end
