function math.clamp(value, minimum, maximum)
    value = tonumber(value)

    if not value then
        return 0
    end

    minimum = tonumber(minimum) or value
    maximum = tonumber(maximum) or value

    if minimum > maximum then
        minimum, maximum = maximum, minimum
    end

    if value < minimum then
        return minimum
    end

    if value > maximum then
        return maximum
    end

    return value
end
