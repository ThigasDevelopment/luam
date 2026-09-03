local PENDING, FULFILLED, REJECTED = 'pending', 'fulfilled', 'rejected';
local MINIMUM_DELAY = 50; -- MTA never fires a timer sooner than this, so a shorter wait resumes on the next tick.
local AWAITING = { }; -- Yielded by a task waiting on a promise, so a thread pool leaves it to the scheduler.

local tasks = setmetatable ({ }, { __mode = 'k' });
local jobs = setmetatable ({ }, { __mode = 'k' });
local awaiting = setmetatable ({ }, { __mode = 'k' });

local queue, draining = { }, false;
local pulses, pulseTimer = { }, nil;

---@param ... any
---@return table
local function pack (...)
	return { n = select ('#', ...), ... };
end

---@param values table
---@return ...
local function spread (values)
	return unpack (values, 1, values.n);
end

---@param message any
local function report (message)
	if (type (outputDebugString) == 'function') then
		outputDebugString ('[Promise] ' .. tostring (message), 1);
		return;
	end

	print ('[Promise] ' .. tostring (message));
end

---@param value any
---@return boolean
local function isPromise (value)
	return (type (value) == 'table') and (getmetatable (value) == Promise);
end

---@return Promise
local function create ()
	---@type Promise
	return setmetatable ({ state = PENDING, values = { n = 0 }, handlers = { } }, Promise);
end

---@param promise Promise
---@param state string
---@param ... any
---@return boolean
local function settle (promise, state, ...)
	if (promise.state ~= PENDING) then return false end

	promise.state = state;
	promise.values = pack (...);

	local handlers = promise.handlers;
	promise.handlers = { };

	for index = 1, #handlers do
		handlers[index] (promise);
	end

	return true;
end

local function drain ()
	if (draining) then return end

	draining = true;
	while (#queue > 0) do
		table.remove (queue, 1) ();
	end
	draining = false;
end

---@param job fun()
local function schedule (job)
	queue[#queue + 1] = job;
	drain ();
end

---@param routine thread
---@param ... any
---@return boolean
local function resumeTask (routine, ...)
	if (coroutine.status (routine) ~= 'suspended') then return false end

	local promise = tasks[routine];
	local outcome = pack (coroutine.resume (routine, ...));

	if (not outcome[1]) then
		if (not promise) or (#promise.handlers == 0) then -- Nobody is waiting on it, so the reason would vanish.
			report (outcome[2]);
		end

		if (promise) then
			settle (promise, REJECTED, outcome[2]);
		end
		return false;
	end

	if (promise) and (coroutine.status (routine) == 'dead') then
		settle (promise, FULFILLED, unpack (outcome, 2, outcome.n));
	end

	return true;
end

---@param routine thread
---@param ... any
---@return ...
local function clearAwait (routine, ...)
	awaiting[routine] = nil;
	return ...;
end

---@param promise Promise
---@return boolean, ...
local function wait (promise)
	local routine = coroutine.running ();
	if (not routine) then
		error ('"await" is only valid inside an async function, and this call is not running inside one.', 0);
	end

	if (not tasks[routine]) then
		error ('"await" is only valid inside a coroutine the promise scheduler drives.', 0);
	end

	if (promise.state ~= PENDING) then
		return (promise.state == FULFILLED), spread (promise.values);
	end

	local handlers = promise.handlers;
	handlers[#handlers + 1] = function (source)
		schedule (function ()
			resumeTask (routine, (source.state == FULFILLED), spread (source.values));
		end);
	end

	awaiting[routine] = true;
	return clearAwait (routine, coroutine.yield (AWAITING));
end

---@param ok boolean
---@param ... any
---@return ...
local function unwrap (ok, ...)
	if (not ok) then
		error ((...), 0);
	end
	return ...;
end

local function tick ()
	for index = 1, #pulses do
		local job = pulses[index];
		if (job ~= nil) then
			job ();
		end
	end
end

---@class Promise
---@field state string
---@field values table
---@field handlers table
---@field new fun(executor: fun(resolve: fun(...): any, reject: fun(...): any): any): Promise
---@field spawn fun(func: fun(...): any, ...): Promise
---@field resolve fun(...): Promise
---@field reject fun(...): Promise
---@field all fun(list: table): Promise
---@field race fun(list: table): Promise
---@field await fun(promise: Promise): any
---@field settle fun(promise: Promise): boolean, any
---@field delay fun(milliseconds: number): Promise
---@field next fun(self: Promise, onFulfilled: fun(...): any, onRejected?: fun(reason: any): any): Promise
---@field catch fun(self: Promise, onRejected: fun(reason: any): any): Promise
Promise = {
	---@param executor fun(resolve: fun(...): any, reject: fun(...): any): any
	---@return Promise
	new = function (executor)
		local promise = create ();
		local executorType = type (executor);
		if (executorType ~= 'function') then
			error ('bad argument #1 to \'new\' (\'function\' expected got \'' .. executorType .. '\').', 2);
		end

		local ok, reason = pcall (executor, function (...)
			settle (promise, FULFILLED, ...);
		end, function (...)
			settle (promise, REJECTED, ...);
		end);

		if (not ok) then
			settle (promise, REJECTED, reason);
		end

		return promise;
	end,

	---@param func fun(...): any
	---@param ... any
	---@return Promise
	spawn = function (func, ...)
		local promise = create ();

		if (type (func) ~= 'function') then
			settle (promise, REJECTED, 'Promise.spawn expects a function.');
			return promise;
		end

		local routine = coroutine.create (func);
		tasks[routine] = promise;

		resumeTask (routine, ...);
		return promise;
	end,

	---@param ... any
	---@return Promise
	resolve = function (...)
		local value = ...;
		if (select ('#', ...) == 1) and (isPromise (value)) then
			return value;
		end

		local promise = create ();
		settle (promise, FULFILLED, ...);
		return promise;
	end,

	---@param ... any
	---@return Promise
	reject = function (...)
		local promise = create ();
		settle (promise, REJECTED, ...);
		return promise;
	end,

	---@param list table
	---@return Promise
	all = function (list)
		local result = create ();
		local values, remaining = { }, #list;

		if (remaining == 0) then
			settle (result, FULFILLED, values);
			return result;
		end

		for index = 1, #list do
			Promise.resolve (list[index]):next (function (value)
				values[index] = value;
				remaining = remaining - 1;

				if (remaining == 0) then
					settle (result, FULFILLED, values);
				end
			end, function (...)
				settle (result, REJECTED, ...);
			end);
		end

		return result;
	end,

	---@param list table
	---@return Promise
	race = function (list)
		local result = create ();
		for index = 1, #list do
			Promise.resolve (list[index]):next (function (...)
				settle (result, FULFILLED, ...);
			end, function (...)
				settle (result, REJECTED, ...);
			end);
		end

		return result;
	end,

	---@param promise Promise
	---@return ...
	await = function (promise)
		if (not isPromise (promise)) then
			return promise;
		end
		return unwrap (wait (promise));
	end,

	---@param promise Promise
	---@return boolean, ...
	settle = function (promise)
		if (not isPromise (promise)) then
			return true, promise;
		end
		return wait (promise);
	end,

	---@param milliseconds number
	---@return Promise
	delay = function (milliseconds)
		milliseconds = tonumber (milliseconds) or 0;
		if (milliseconds < MINIMUM_DELAY) then
			milliseconds = MINIMUM_DELAY;
		end

		return Promise.new (function (resolve)
			setTimer (resolve, milliseconds, 1);
		end);
	end,

	---@param routine thread
	---@return Promise
	adopt = function (routine)
		local promise = create ();
		tasks[routine] = promise;
		jobs[routine] = true;

		return promise;
	end,

	---@param routine thread
	---@param ... any
	---@return boolean
	resume = function (routine, ...)
		return resumeTask (routine, ...);
	end,

	---@param routine thread
	---@return boolean
	isAwaiting = function (routine)
		return (routine ~= nil) and (awaiting[routine] == true);
	end,

	---@param callback fun()
	---@return fun()
	pulse = function (callback)
		pulses[#pulses + 1] = callback;
		if (pulseTimer == nil) then
			pulseTimer = setTimer (tick, MINIMUM_DELAY, 0);
		end

		return callback;
	end,

	---@param callback fun()
	unpulse = function (callback)
		for index = #pulses, 1, -1 do
			if (pulses[index] == callback) then
				table.remove (pulses, index);
			end
		end

		if (#pulses == 0) and (pulseTimer ~= nil) then
			killTimer (pulseTimer);
			pulseTimer = nil;
		end
	end,

	---@param self Promise
	---@param onFulfilled fun(...): any
	---@param onRejected? fun(reason: any): any
	---@return Promise
	next = function (self, onFulfilled, onRejected)
		local chained = create ();

		local function forward (source)
			local handler = onRejected;
			if (source.state == FULFILLED) then
				handler = onFulfilled;
			end

			if (type (handler) ~= 'function') then
				settle (chained, source.state, spread (source.values));
				return;
			end

			local outcome = pack (pcall (handler, spread (source.values)));
			if (not outcome[1]) then
				settle (chained, REJECTED, outcome[2]);
				return;
			end

			local value = outcome[2];
			if (isPromise (value)) then
				value:next (function (...)
					settle (chained, FULFILLED, ...);
				end, function (...)
					settle (chained, REJECTED, ...);
				end);
				return;
			end

			settle (chained, FULFILLED, unpack (outcome, 2, outcome.n));
		end

		if (self.state == PENDING) then
			self.handlers[#self.handlers + 1] = forward;
		else
			forward (self);
		end

		return chained;
	end,

	---@param self Promise
	---@param onRejected fun(reason: any): any
	---@return Promise
	catch = function (self, onRejected)
		return self:next (nil, onRejected);
	end,
};
Promise.__index = Promise;

---@param milliseconds number
---@return Promise
function delay (milliseconds)
	return Promise.delay (milliseconds);
end

---@param milliseconds number
function sleep (milliseconds)
	milliseconds = tonumber (milliseconds) or 0;

	local routine = coroutine.running ();
	if (routine) and (jobs[routine]) then
		if (milliseconds < 1) then
			coroutine.yield ();
			return;
		end

		local start = getTickCount ();
		repeat
			coroutine.yield ();
		until (getTickCount () - start) >= milliseconds

		return;
	end

	if (not routine) or (not tasks[routine]) then
		error ('"sleep" is only valid inside an async function or a thread pool job.', 0);
	end

	return Promise.await (Promise.delay (milliseconds));
end
