export const MTA_TIMERS = `
local now, timers = 0, {}

function getTickCount()
    return now
end

function setTimer(callback, interval, times)
    local timer = { callback = callback, interval = interval, times = times, at = now + interval }

    timers[#timers + 1] = timer

    return timer
end

function killTimer(timer)
    for index = #timers, 1, -1 do
        if timers[index] == timer then
            table.remove(timers, index)
        end
    end
end

function isTimer(timer)
    for index = 1, #timers do
        if timers[index] == timer then
            return true
        end
    end

    return false
end

function timerCount()
    return #timers
end

function advance(milliseconds)
    now = now + milliseconds

    local due = {}

    for index = 1, #timers do
        local timer = timers[index]

        if now >= timer.at then
            due[#due + 1] = timer
        end
    end

    for index = 1, #due do
        local timer = due[index]

        if timer.times == 1 then
            killTimer(timer)
        else
            timer.at = now + timer.interval
        end

        timer.callback()
    end
end
`;
