import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { findPortHolder, type PortHolder } from '@cli/server/port-holder';

export interface BusyPort {
    port: number;
    name: string;
    holder: PortHolder | null;
}

export const SERVER_CONFIG_PATH = 'mods/deathmatch/mtaserver.conf';

const CONFIGURED_PORTS: readonly { element: string; name: string; fallback: number }[] = [
    { element: 'serverport', name: 'game', fallback: 22003 },
    { element: 'httpport', name: 'HTTP', fallback: 22005 },
];

function readElement(source: string, element: string): number | null {
    const found = new RegExp(`<${element}>\\s*(\\d{1,5})\\s*</${element}>`, 'i').exec(source);

    return found?.[1] === undefined ? null : Number(found[1]);
}

export function readServerPorts(serverRoot: string): { port: number; name: string }[] {
    let source = '';

    try {
        source = readFileSync(resolve(serverRoot, SERVER_CONFIG_PATH), 'utf8');
    } catch {
        source = '';
    }

    return CONFIGURED_PORTS.map((entry) => ({ port: readElement(source, entry.element) ?? entry.fallback, name: entry.name }));
}

export function busyServerPorts(serverRoot: string, lookup: (port: number) => PortHolder | null = findPortHolder): BusyPort[] {
    return readServerPorts(serverRoot)
        .map((entry) => ({ ...entry, holder: lookup(entry.port) }))
        .filter((entry) => entry.holder !== null);
}

export function busyPortMessage(busy: readonly BusyPort[]): string {
    const [first] = busy;

    if (first === undefined) {
        return '';
    }

    const holder = first.holder;
    const taken = busy.map((entry) => `${entry.port} (${entry.name})`).join(' and ');
    const subject = busy.length === 1 ? 'port' : 'ports';
    const verb = busy.length === 1 ? 'is' : 'are';
    const leftover = holder !== null && /mta/i.test(holder.command) ? ', probably a server left behind by an earlier run' : '';
    const who = holder === null ? 'another process' : `"${holder.command}" (pid ${holder.pid})${leftover}`;
    const stop = holder === null ? 'Stop it' : `Stop it with "kill ${holder.pid}"`;

    return `The MTA server cannot start: ${subject} ${taken} ${verb} already held by ${who}. ${stop} and run the command again.`;
}
