local PRIORITIES = {
	low = { pulsing = 250, frame = 8 },
	normal = { pulsing = 100, frame = 15 },
	high = { pulsing = 50, frame = 25 },
	extreme = { pulsing = 0, frame = 50 }, -- Every pulse: the scheduler already runs on MTA's 50ms floor.
};

local STYLES = {
	concurrent = true,
	priority = true,
	sequential = true,
};

---@class Thread
---@field routine thread
---@field arguments table
---@field paused boolean
---@field started boolean
---@field priority number
---@field get fun(self: Thread): number
---@field set fun(self: Thread, priority: number): boolean
---@field pause fun(self: Thread): boolean
---@field resume fun(self: Thread): boolean
---@field isPaused fun(self: Thread): boolean
---@field isStarted fun(self: Thread): boolean
local Thread = {
	---@param self Thread
	---@return number
	get = function (self)
		return self.priority;
	end,

	---@param self Thread
	---@param priority number
	---@return boolean
	set = function (self, priority)
		priority = tonumber (priority);
		if (not priority) or (self.priority == priority) then
			return false;
		end

		self.priority = priority;
		return true;
	end,

	---@param self Thread
	---@return boolean
	pause = function (self)
		if (self.paused) then
			return false;
		end

		self.paused = true;
		return true;
	end,

	---@param self Thread
	---@return boolean
	resume = function (self)
		if (not self.paused) then
			return false;
		end

		self.paused = false;
		return true;
	end,

	---@param self Thread
	---@return boolean
	isPaused = function (self)
		return self.paused;
	end,

	---@param self Thread
	---@return boolean
	isStarted = function (self)
		return self.started;
	end,
};
Thread.__index = Thread;

---@param self Threads
---@param id number
---@param thread Thread
---@return boolean
local function resumeThread (self, id, thread)
	if (coroutine.status (thread.routine) == 'dead') then
		self:remove (id);
		return false;
	end

	if (thread:isPaused ()) or (Promise.isAwaiting (thread.routine)) then
		return false;
	end

	if (thread:isStarted ()) then
		return Promise.resume (thread.routine);
	end

	thread.started = true;
	return Promise.resume (thread.routine, thread, unpack (thread.arguments));
end

---@class Threads
---@field threads table<number, Thread>
---@field nextId number
---@field currentId number
---@field type string
---@field priority string
---@field pulse fun()?
---@field pulsedAt number
---@field add fun(self: Threads, func: fun(...): any, options?: table, ...): number, Promise
---@field remove fun(self: Threads, id: number): boolean
---@field clear fun(self: Threads): boolean
---@field start fun(self: Threads): boolean
---@field stop fun(self: Threads)
---@field getType fun(self: Threads): string
---@field setType fun(self: Threads, style: string): boolean
---@field getPriority fun(self: Threads): string
---@field setPriority fun(self: Threads, priority: string): boolean
---@field getThread fun(self: Threads, id: number): Thread?
Threads = {
	---@param style string
	---@param priority string
	---@return Threads
	new = function (style, priority)
		---@type Threads
		local self = setmetatable ({ }, Threads);

		self.threads = { };
		self.nextId, self.currentId = 0, -1;
		self.type, self.priority = 'concurrent', 'normal';
		self.pulse, self.pulsedAt = nil, 0;

		self:setType (style);
		self:setPriority (priority);

		return self;
	end,

	---@param self Threads
	---@param func fun(...): any
	---@param options? table
	---@param ... any
	---@return number, Promise
	add = function (self, func, options, ...)
		options = options or { };

		---@type Thread
		local thread = setmetatable ({
			routine = coroutine.create (func),
			arguments = { ... },
			paused = false,
			started = false,
			priority = options.priority or -1,
		}, Thread);

		local settled = Promise.adopt (thread.routine);

		local id = self.nextId + 1;
		self.nextId = id;
		self.threads[id] = thread;

		self:start ();
		return id, settled;
	end,

	---@param self Threads
	---@param id number
	---@return boolean
	remove = function (self, id)
		if (not self.threads[id]) then
			return false;
		end

		if (self.currentId == id) then
			self.currentId = -1;
		end

		self.threads[id] = nil;
		return true;
	end,

	---@param self Threads
	---@return boolean
	clear = function (self)
		if (next (self.threads) == nil) then
			return false;
		end

		self.threads, self.currentId = { }, -1;

		self:stop ();
		return true;
	end,

	---@param self Threads
	---@return boolean
	start = function (self)
		if (self.pulse) then
			return false;
		end

		self.pulse = Promise.pulse (function ()
			self:process ();
		end);
		return true;
	end,

	---@param self Threads
	stop = function (self)
		if (self.pulse) then
			Promise.unpulse (self.pulse);
		end
		self.pulse = nil;
	end,

	---@param self Threads
	---@param sorted boolean
	processQueue = function (self, sorted)
		local queue = { };

		for id, thread in pairs (self.threads) do
			queue[#queue + 1] = { id = id, thread = thread };
		end

		if (sorted) then
			table.sort (queue, function (left, right)
				return left.thread:get () > right.thread:get ();
			end);
		end

		local frames = 0;
		for _, item in ipairs (queue) do
			if (frames >= PRIORITIES[self.priority].frame) then return end

			if (resumeThread (self, item.id, item.thread)) then
				frames = frames + 1;
			end
		end
	end,

	---@param self Threads
	processSequential = function (self)
		if (not self.threads[self.currentId]) then
			self.currentId = -1;

			for id in pairs (self.threads) do
				self.currentId = id;
				break;
			end
		end

		local thread = self.threads[self.currentId];
		if (not thread) then return end

		local frames = 0;
		while (frames < PRIORITIES[self.priority].frame) do
			if (not resumeThread (self, self.currentId, thread)) then return end

			frames = frames + 1;
		end
	end,

	---@param self Threads
	process = function (self)
		local now = getTickCount ();
		if ((now - self.pulsedAt) < PRIORITIES[self.priority].pulsing) then return end

		self.pulsedAt = now;

		if (self.type == 'sequential') then
			self:processSequential ();
		else
			self:processQueue (self.type == 'priority');
		end

		if (next (self.threads) == nil) then
			self:stop ();
		end
	end,

	---@param self Threads
	---@return string
	getType = function (self)
		return self.type;
	end,

	---@param self Threads
	---@param style string
	---@return boolean
	setType = function (self, style)
		if (type (style) ~= 'string') then
			return false;
		end

		style = style:lower ();
		if (not STYLES[style]) or (self.type == style) then
			return false;
		end

		self.type = style;
		return true;
	end,

	---@param self Threads
	---@return string
	getPriority = function (self)
		return self.priority;
	end,

	---@param self Threads
	---@param priority string
	---@return boolean
	setPriority = function (self, priority)
		if (type (priority) ~= 'string') or (not PRIORITIES[priority]) or (self.priority == priority) then
			return false;
		end

		self.priority = priority;
		return true;
	end,

	---@param self Threads
	---@param id number
	---@return Thread?
	getThread = function (self, id)
		return self.threads[id];
	end,
};
Threads.__index = Threads;
