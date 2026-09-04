import { readdirSync, readFileSync, readlinkSync } from 'node:fs';

export interface PortHolder {
    pid: number;
    command: string;
}

const NETWORK_TABLES: readonly string[] = ['/proc/net/tcp', '/proc/net/tcp6', '/proc/net/udp', '/proc/net/udp6'];

const SOCKET_LINK = /^socket:\[(\d+)\]$/;

function listeningInodes(port: number): Set<string> {
    const wanted = port.toString(16).toUpperCase().padStart(4, '0');
    const inodes = new Set<string>();

    for (const table of NETWORK_TABLES) {
        let contents: string;

        try {
            contents = readFileSync(table, 'utf8');
        } catch {
            continue;
        }

        for (const line of contents.split('\n').slice(1)) {
            const columns = line.trim().split(/\s+/);
            const local = columns[1];
            const inode = columns[9];

            if (local !== undefined && inode !== undefined && local.endsWith(`:${wanted}`)) {
                inodes.add(inode);
            }
        }
    }

    return inodes;
}

function commandOf(pid: string): string {
    try {
        return readFileSync(`/proc/${pid}/comm`, 'utf8').trim();
    } catch {
        return 'unknown';
    }
}

function holdsInode(pid: string, inodes: ReadonlySet<string>): boolean {
    let handles: string[];

    try {
        handles = readdirSync(`/proc/${pid}/fd`);
    } catch {
        return false;
    }

    for (const handle of handles) {
        try {
            const found = SOCKET_LINK.exec(readlinkSync(`/proc/${pid}/fd/${handle}`));

            if (found?.[1] !== undefined && inodes.has(found[1])) {
                return true;
            }
        } catch {
            continue;
        }
    }

    return false;
}

export function findPortHolder(port: number, platform: NodeJS.Platform = process.platform): PortHolder | null {
    if (platform !== 'linux') {
        return null;
    }

    const inodes = listeningInodes(port);

    if (inodes.size === 0) {
        return null;
    }

    let entries: string[];

    try {
        entries = readdirSync('/proc').filter((entry) => /^\d+$/.test(entry));
    } catch {
        return null;
    }

    for (const pid of entries) {
        if (holdsInode(pid, inodes)) {
            return { pid: Number(pid), command: commandOf(pid) };
        }
    }

    return null;
}
