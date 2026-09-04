export interface SessionCommand {
    verb: string;
    argument: 'none' | 'one' | 'optional';
    usage: string;
    summary: string;
}

export const LEADING_SPACE_ESCAPE = 'Begin a line with a space to send it to the MTA console even when its first word is one of these.';

export const SESSION_COMMANDS: readonly SessionCommand[] = [
    { verb: 'ensure', argument: 'one', usage: 'ensure <resource>', summary: 'Build it, sync it, start it on the server, and watch it for changes.' },
    { verb: 'drop', argument: 'one', usage: 'drop <resource>', summary: 'Stop watching and syncing it. What is on the server is left alone.' },
    { verb: 'rebuild', argument: 'optional', usage: 'rebuild [resource]', summary: 'Force a cycle for one attached resource, or for every attached resource.' },
    { verb: 'list', argument: 'none', usage: 'list', summary: 'Report every attached resource with the outcome and age of its last build.' },
    { verb: 'help', argument: 'none', usage: 'help', summary: 'Name the session verbs and the escape that reaches the MTA console.' },
];

export const SESSION_VERBS: readonly string[] = SESSION_COMMANDS.map((entry) => entry.verb);

export function findSessionCommand(verb: string): SessionCommand | null {
    return SESSION_COMMANDS.find((entry) => entry.verb === verb) ?? null;
}
