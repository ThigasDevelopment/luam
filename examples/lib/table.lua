function table.size (t)
	local size = 0;

	local tType = type (t);
	if (tType ~= 'table') then
		return size;
	end

	for _ in pairs (t) do
		size = (size + 1);
	end
	return size;
end