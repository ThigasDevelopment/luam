local ENVIRONMENT_FILE = '.env'

if localPlayer ~= nil then
    return
end

if not fileExists(ENVIRONMENT_FILE) then
    if type(process) ~= 'table' then
        process = {}
    end

    process.env = {}
    env = process.env

    return
end

Dotenv.new(ENVIRONMENT_FILE):apply()
