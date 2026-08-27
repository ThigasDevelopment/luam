export const TransportKind = { stdio: 0, ipc: 1, pipe: 2, socket: 3 } as const;

export interface ClientRecord {
    id: string;
    name: string;
    serverOptions: unknown;
    clientOptions: unknown;
}

export const clients: LanguageClient[] = [];

export function resetClients(): void {
    clients.splice(0);
}

export class LanguageClient {
    readonly record: ClientRecord;

    started = 0;

    stopped = 0;

    restarted = 0;

    readonly requests: Array<{ method: string; params: unknown }> = [];

    constructor(id: string, name: string, serverOptions: unknown, clientOptions: unknown) {
        this.record = { id, name, serverOptions, clientOptions };
        clients.push(this);
    }

    start(): Promise<void> {
        this.started += 1;

        return Promise.resolve();
    }

    stop(): Promise<void> {
        this.stopped += 1;

        return Promise.resolve();
    }

    restart(): Promise<void> {
        this.restarted += 1;

        return Promise.resolve();
    }

    sendRequest(method: string, params: unknown): Promise<null> {
        this.requests.push({ method, params });

        return Promise.resolve(null);
    }
}
