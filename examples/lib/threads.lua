---@param miliseconds number
---@return void
function sleep (miliseconds)
	miliseconds = tonumber (miliseconds) or 0;
	if (miliseconds < 1) then
		coroutine.yield ();
		return
	end

	local current = getTickCount ();
	repeat
		coroutine.yield ();
	until (getTickCount () - current) >= miliseconds;
end

---@type table<string, { pulsing: number, frame: number }>
local THREADS_PRIORITYS = {
	low = { pulsing = 250, frame = 8 },
	normal = { pulsing = 100, frame = 15 },
	high = { pulsing = 50, frame = 25 },
	extreme = { pulsing = 0, frame = 50 },
};

---@alias ThreadsType 'concurrent' | 'priority' | 'sequential'
---@alias ThreadsPriority 'low' | 'normal' | 'high' | 'extreme'

---@class ThreadOptions
---@field priority number

---@class Thread
---@field routine thread
---@field arguments table<any>
---@field paused boolean
---@field started boolean
---@field priority? number
---@field get fun(self: Thread): number
---@field set fun(self: Thread, priority: number): boolean
---@field pause fun(self: Thread): boolean
---@field resume fun(self: Thread): boolean
---@field isPaused fun(self: Thread): boolean
---@field isStarted fun(self: Thread): boolean

---@class Threads
---@field threads table<number, Thread>
---@field nextId number
---@field currentId number
---@field type ThreadsType
---@field priority ThreadsPriority
---@field timer userdata | nil
---@field add fun(self: Threads, func: fun(self: Thread, ...: any): any, options: ThreadOptions, ...: any): number
---@field remove fun(self: Threads, id: number): boolean
---@field clear fun(self: Threads): boolean
---@field start fun(self: Threads): boolean
---@field process fun(self: Threads): void
---@field getType fun(self: Threads): ThreadsType
---@field setType fun(self: Threads, style: ThreadsType): boolean
---@field getPriority fun(self: Threads): ThreadsPriority
---@field setPriority fun(self: Threads, priority: ThreadsPriority): boolean
---@field getThread fun(self: Threads, id: number): Thread | nil
Threads = {
	---@param self Threads
	---@param type? ThreadsType
	---@param priority? ThreadsPriority
	---@return Threads
	new = function (type, priority)
		local self = setmetatable ({ }, { __index = Threads });
		self.threads = { };

		self.nextId, self.currentId = 0, -1;
		self.type, self.priority = 'concurrent', 'normal';

		self:setType (type);
		self:setPriority (priority);

		self.timer = nil;
		return self;
	end,

	---@param self Threads
	---@param func fun(self: Thread, ...: any): any
	---@param options ThreadOptions
	---@param ... any
	---@return number
	add = function (self, func, options, ...)
		options = (options or { });
		---@type Thread
		local thread = {
			routine = coroutine.create (func),
			arguments = { ... },

			paused = false,
			started = false,

			priority = options.priority or -1,

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
				if (not priority) then
					return false;
				end

				local current = self:get ();
				if (current == priority) then
					return false;
				end

				self.priority = priority;
				return true;
			end,

			---@param self Thread
			---@return boolean
			pause = function (self)
				local isPaused = self:isPaused ();
				if (isPaused) then
					return false;
				end

				self.paused = true;
				return true;
			end,

			---@param self Thread
			---@return boolean
			resume = function (self)
				local isPaused = self:isPaused ();
				if (not isPaused) then
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

		local newId = (self.nextId + 1);
		self.nextId = newId;

		self.threads[newId] = thread;

		self:start ();
		return newId;
	end,

	---@param self Threads
	---@param id number
	---@return boolean
	remove = function (self, id)
		---@type Thread
		local thread = self.threads[id];
		if (not thread) then
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
		local hasNext = (next (self.threads) ~= nil);
		if (not hasNext) then
			return false;
		end

		self.threads, self.currentId = { }, -1;
		if (isTimer (self.timer)) then
			killTimer (self.timer);
		end
		self.timer = nil;

		return true;
	end,

	---@param self Threads
	---@return boolean
	start = function (self)
		if (isTimer (self.timer)) then
			return false;
		end

		self.timer = setTimer (
			function ()
				self:process ();
			end, THREADS_PRIORITYS[self.priority].pulsing, 0
		);
		return true;
	end,

	---@param self Threads
	---@return void
	process = function (self)
		local frames = 0;

		local theType = self.type;
		if (theType == 'concurrent') then
			local activeThread = false;
			for id, thread in pairs (self.threads) do
				if (frames >= THREADS_PRIORITYS[self.priority].frame) then
					activeThread = true;
					break
				end

				local status = coroutine.status (thread.routine);
				if (status == 'dead') then
					self:remove (id);
				elseif (not thread:isPaused ()) then
					activeThread = true;

					local success, message;
					if (not thread:isStarted ()) then
						success, message = coroutine.resume (thread.routine, thread, unpack (thread.arguments));
						thread.started = true;
					else
						success, message = coroutine.resume (thread.routine, thread);
					end

					if (not success) then
						error ('[Threads] Thread ID ' .. id .. ' error: ' .. tostring (message));
						self:remove (id);
					else
						frames = (frames + 1);
					end
				else
					activeThread = true;
				end
			end

			if (not activeThread) and (isTimer (self.timer)) then
				killTimer (self.timer);
				self.timer = nil;
			end
		elseif (theType == 'priority') then
			local activeThreads = { };

			---@param id number
			---@param thread Thread
			for id, thread in pairs (self.threads) do
				local isPaused = self:isPaused (id);
				if (not isPaused) then
					activeThreads[#activeThreads + 1] = { id = id, thread = thread };
				end
			end

			table.sort (activeThreads,
				---@param a { id: number, thread: Thread }
				---@param b { id: number, thread: Thread }
				function (a, b)
					return (a.thread:get () > b.thread:get ());
				end
			);

			local activeThread = false;

			---@param item { id: number, thread: Thread }
			for _, item in pairs (activeThreads) do
				if (frames >= THREADS_PRIORITYS[self.priority].frame) then
					activeThread = true;
					break
				end

				local id, thread = item.id, item.thread;

				local status = coroutine.status (thread.routine);
				if (status == 'dead') then
					self:remove (id);
				else
					activeThread = true;

					local success, message;
					if (not thread:isStarted ()) then
						success, message = coroutine.resume (thread.routine, thread, unpack (thread.arguments));
						thread.started = true;
					else
						success, message = coroutine.resume (thread.routine, thread);
					end

					if (not success) then
						error ('[Threads] Thread ID ' .. id .. ' error: ' .. tostring (message));
						self:remove (id);
					else
						frames = (frames + 1);
					end
				end
			end

			if (not activeThread) and (isTimer (self.timer)) then
				killTimer (self.timer);
				self.timer = nil;
			end
		elseif (theType == 'sequential') then
			if (not self.threads[self.currentId]) then
				self.currentId = -1;
				
				for id, _ in pairs (self.threads) do
					self.currentId = id;
					break
				end
				
				if (self.currentId < 1) and (isTimer (self.timer)) then
					killTimer (self.timer);
					self.timer = nil;
					return
				end
			end

			---@type Thread
			local thread = self.threads[self.currentId];
			if (not thread) then
				self.currentId = -1;
				return
			end

			local isPaused = thread:isPaused ();
			if (isPaused) then
				return
			end

			while (frames < THREADS_PRIORITYS[self.priority].frame) do
				local status = coroutine.status (thread.routine);
				if (status == 'dead') then
					self:remove (self.currentId);
					break
				end

				local success, message;
				if (not thread:isStarted ()) then
					success, message = coroutine.resume (thread.routine, thread, unpack (thread.arguments));
					thread.started = true;
				else
					success, message = coroutine.resume (thread.routine, thread);
				end

				if (not success) then
					error ('[Threads] Thread ID ' .. self.currentId .. ' error: ' .. tostring (message));
					self:remove (self.currentId);
					break
				end

				frames = (frames + 1);
				if (coroutine.status (thread.routine) == 'dead') then
					self:remove (self.currentId);
					break
				end
			end
		end
	end,

	---@param self Threads
	---@return ThreadsType
	getType = function (self)
		return self.type;
	end,

	---@param self Threads
	---@param style ThreadsType
	---@return boolean
	setType = function (self, style)
		local theType = type (style);
		if (theType ~= 'string') then
			return false;
		end

		local AVAILABLE_TYPES = {
			['concurrent'] = true,
			['priority'] = true,
			['sequential'] = true,
		};

		style = style:lower ();
		if (not AVAILABLE_TYPES[style]) or (self.type == style) then
			return false;
		end

		self.type = style;
		return true;
	end,

	---@param self Threads
	---@return ThreadsPriority
	getPriority = function (self)
		return self.priority;
	end,

	---@param self Threads
	---@param priority ThreadsPriority
	---@return boolean
	setPriority = function (self, priority)
		local priorityType = type (priority);
		if (priorityType ~= 'string') then
			return false;
		end

		if (not THREADS_PRIORITYS[priority]) or (self.priority == priority) then
			return false;
		end

		self.priority = priority;
		if (isTimer (self.timer)) then
			killTimer (self.timer);
		end

		self:start ();
		return true;
	end,

	---@param self Threads
	---@param id number
	---@return Thread
	getThread = function (self, id)
		---@type Thread
		local thread = self.threads[id];
		if (not thread) then
			return nil;
		end
		return thread;
	end,
};