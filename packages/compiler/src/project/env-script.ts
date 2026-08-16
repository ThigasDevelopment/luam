import { isSensitiveKey, type EnvEntry, type EnvFile, type EnvValueKind } from './env-file';

const HEADER = [
    '-- Deployment values for this resource.',
    '-- Generated once by "luam build" and owned by the server administrator.',
    '-- The compiler never overwrites this file, and it is never sent to clients.',
    '--',
    '-- Edit the values below. Text values must stay quoted; numbers and booleans must not.',
    '',
];

const FOOTER = [
    '',
    'env = setmetatable({}, {',
    '    __index = function(_, key)',
    '        local value = values[key]',
    '',
    '        if value == nil then',
    "            error('\"' .. tostring(key) .. '\" is not declared in \"env.lua\".', 2)",
    '        end',
    '',
    '        return value',
    '    end,',
    '    __newindex = function(_, key)',
    "        error('The environment is read-only and \"' .. tostring(key) .. '\" cannot be assigned.', 2)",
    '    end,',
    '    __metatable = false,',
    '})',
    '',
    "if type(process) ~= 'table' then",
    '    process = {}',
    'end',
    '',
    'process.env = env',
    '',
];

const BLANK: Readonly<Record<EnvValueKind, string>> = { boolean: 'false', number: '0', string: "''" };

function quote(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

function literal(entry: EnvEntry): string {
    if (isSensitiveKey(entry.key)) {
        return BLANK[entry.kind];
    }

    return entry.kind === 'string' ? quote(entry.value) : entry.value;
}

function line(entry: EnvEntry): string {
    return `    ${entry.key} = ${literal(entry)},`;
}

export function renderEnvironmentScript(file: EnvFile): string {
    const entries = [...file.entries].sort((left, right) => left.key.localeCompare(right.key));

    return [...HEADER, 'local values = {', ...entries.map(line), '}', ...FOOTER].join('\n');
}
