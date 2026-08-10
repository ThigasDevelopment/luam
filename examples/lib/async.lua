---@class Async
---@field tasks Threads
---@field interval number
---@field map fun(self: Async, array: table, func: fun(value: any, index: number): any, callback?: fun(elapsed: number): any): number
---@field iterate fun(self: Async, from: number, to: number, increment: number, func: fun(i: number): any, callback?: fun(elapsed: number): any): number
---@field foreach fun(self: Async, object: table<any, any>, func: fun(value: any, key: any): any, callback?: fun(elapsed: number): any): number
---@field getInterval fun(self: Async): number
---@field setInterval fun(self: Async, interval: number): boolean
Async = {
	---@param interval number
	---@return Async
	new = function (interval)
		---@type Async
		local self = setmetatable({ }, { __index = Async });
		self.tasks = Threads.new ('concurrent', 'normal');

		self.interval = 100;
		self:setInterval (interval);
		return self;
	end,

	---@param self Async
	---@param array table
	---@param func fun(value: any, index: number): any
	---@param callback? fun(elapsed: number): any
	---@return number
	map = function (self, array, func, callback)
		return self.tasks:add (
			function (self)
				local tick = getTickCount ();
				for index, value in ipairs (array) do
					func (value, index);

					sleep (self.interval);
				end

				local callbackType = type (callback);
				if (callbackType == 'function') then
					local elapsed = (getTickCount () - tick);
					callback (elapsed);
				end
			end
		);
	end,

	---@param self Async
	---@param from number
	---@param to number
	---@param increment number
	---@param func fun(i: number): any
	---@param callback? fun(elapsed: number): any
	---@return number
	iterate = function (self, from, to, increment, func, callback)
		return self.tasks:add (
			function (self)
				local tick = getTickCount ();
				for i = from, to, increment do
					func (i);

					sleep (self.interval);
				end

				local callbackType = type (callback);
				if (callbackType == 'function') then
					local elapsed = (getTickCount () - tick);
					callback (elapsed);
				end
				return true;
			end, { }, from, to, increment, func, callback
		);
	end,

	---@param self Async
	---@param object table<any, any>
	---@param func fun(value: any, key: any): any
	---@param callback? fun(elapsed: number): any
	---@return number
	foreach = function (self, object, func, callback)
		return self.tasks:add (
			function (self)
				local tick = getTickCount ();
				for key, value in pairs (object) do
					func (value, key);

					sleep (self.interval);
				end

				local callbackType = type (callback);
				if (callbackType == 'function') then
					local elapsed = (getTickCount () - tick);
					callback (elapsed);
				end
			end, { }, object, func, callback
		);
	end,

	---@param self Async
	---@return number
	getInterval = function (self)
		return self.interval;
	end,

	---@param self Async
	---@param interval number
	---@return boolean
	setInterval = function (self, interval)
		interval = tonumber (interval);
		if (not interval) then
			return false;
		end

		if (interval < 1) or (interval == self:getInterval ()) then
			return false;
		end

		self.interval = interval;
		return true;
	end,
};