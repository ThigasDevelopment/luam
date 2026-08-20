import { emptyResponse, isLspResponse, type LspKind, type LspRequest, type LspResponse } from './lsp-protocol';
import { COMPILE_BUDGET_MS, type PlaygroundEnvironment } from './protocol';

export interface LspQuery {
    kind: LspKind;
    source: string;
    environment: PlaygroundEnvironment;
    oop: boolean;
    offset?: number;
    newName?: string;
}

interface Pending {
    kind: LspKind;
    resolve: (response: LspResponse) => void;
    timer: ReturnType<typeof setTimeout>;
}

export class LspSession {
    private worker: Worker | null = null;

    private pending = new Map<number, Pending>();

    private latest = new Map<LspKind, number>();

    private nextId = 1;

    private start(): Worker {
        if (this.worker !== null) {
            return this.worker;
        }

        const worker = new Worker(new URL('./lsp-worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (event: MessageEvent<unknown>): void => this.settle(event.data);
        worker.onerror = (): void => this.crash('The language server failed to start.');

        this.worker = worker;

        return worker;
    }

    private settle(data: unknown): void {
        if (!isLspResponse(data)) {
            return;
        }

        const pending = this.pending.get(data.id);

        if (pending === undefined) {
            return;
        }

        clearTimeout(pending.timer);
        this.pending.delete(data.id);

        if (this.latest.get(data.kind) !== data.id) {
            return;
        }

        pending.resolve(data);
    }

    private crash(failure: string): void {
        const entries = [...this.pending.entries()];

        this.pending.clear();
        this.restart();

        for (const [id, pending] of entries) {
            clearTimeout(pending.timer);
            pending.resolve(emptyResponse(id, pending.kind, failure));
        }
    }

    restart(): void {
        this.worker?.terminate();
        this.worker = null;
    }

    ask(query: LspQuery): Promise<LspResponse> {
        const id = this.nextId++;
        const worker = this.start();

        this.latest.set(query.kind, id);

        return new Promise<LspResponse>((resolve) => {
            const timer = setTimeout(() => this.crash('The language server took too long and was restarted.'), COMPILE_BUDGET_MS);

            this.pending.set(id, { kind: query.kind, resolve, timer });

            worker.postMessage({
                id,
                kind: query.kind,
                source: query.source,
                environment: query.environment,
                oop: query.oop,
                offset: query.offset ?? 0,
                newName: query.newName ?? '',
            } satisfies LspRequest);
        });
    }
}
