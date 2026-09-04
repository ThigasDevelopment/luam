import { findPortHolder, type PortHolder } from '@cli/server/port-holder';

const BOUND_PORT = /port\s*'?(\d{2,5})'?/i;

const PORT_FAILURE = /could not (?:start|bind|open)/i;

export const KEPT_OUTPUT_LINES = 8;

export function exitReason(code: number | null, signal: string | null): string {
    return code === null ? `signal ${signal ?? 'unknown'}` : `code ${code}`;
}

export function conflictingPort(output: readonly string[]): number | null {
    for (const line of [...output].reverse()) {
        if (!PORT_FAILURE.test(line)) {
            continue;
        }

        const found = BOUND_PORT.exec(line);

        if (found?.[1] !== undefined) {
            return Number(found[1]);
        }
    }

    return null;
}

export function describeHolder(port: number, holder: PortHolder | null): string {
    if (holder === null) {
        return `Port ${port} is already in use. Stop whatever holds it and start the session again.`;
    }

    const leftover = /mta/i.test(holder.command) ? ', probably a server left behind by an earlier run' : '';

    return `Port ${port} is held by "${holder.command}" (pid ${holder.pid})${leftover}. Stop it with "kill ${holder.pid}" and start the session again.`;
}

export function startupFailureMessage(
    reason: string,
    output: readonly string[],
    lookup: (port: number) => PortHolder | null = findPortHolder,
): string {
    const port = conflictingPort(output);
    const tail = output.filter((line) => line.trim().length > 0).slice(-KEPT_OUTPUT_LINES);
    const lines = [`MTA server exited before readiness with ${reason}.`];

    if (port !== null) {
        lines.push(describeHolder(port, lookup(port)));
    } else if (tail.length > 0) {
        lines.push(`The server said: ${tail[tail.length - 1] ?? ''}`);
    }

    return lines.join(' ');
}
