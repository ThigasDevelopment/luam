import { COMPILE_BUDGET_MS, type CompileRequest, type CompileResponse, isCompileResponse } from './protocol';

interface Pending {
    id: number;
    resolve: (response: CompileResponse | null) => void;
    timer: ReturnType<typeof setTimeout>;
}

export class PlaygroundCompiler {
    private worker: Worker | null = null;

    private pending: Pending | null = null;

    private nextId = 1;

    private start(): Worker {
        if (this.worker !== null) {
            return this.worker;
        }

        const worker = new Worker(new URL('./compile-worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (event: MessageEvent<unknown>): void => this.settle(event.data);
        worker.onerror = (): void => this.fail('The compiler worker failed to start.');

        this.worker = worker;

        return worker;
    }

    private settle(data: unknown): void {
        const pending = this.pending;

        if (pending === null || !isCompileResponse(data) || data.id !== pending.id) {
            return;
        }

        clearTimeout(pending.timer);

        this.pending = null;

        pending.resolve(data);
    }

    private fail(failure: string): void {
        const pending = this.pending;

        this.restart();

        if (pending === null) {
            return;
        }

        clearTimeout(pending.timer);

        this.pending = null;

        pending.resolve({ id: pending.id, code: null, diagnostics: [], helpers: [], environment: 'shared', failure });
    }

    restart(): void {
        this.worker?.terminate();
        this.worker = null;
    }

    compile(request: Omit<CompileRequest, 'id'>): Promise<CompileResponse | null> {
        const previous = this.pending;

        if (previous !== null) {
            clearTimeout(previous.timer);

            this.pending = null;

            previous.resolve(null);
        }

        const id = this.nextId++;
        const worker = this.start();

        return new Promise<CompileResponse | null>((resolve) => {
            const timer = setTimeout(() => this.fail('The compiler took too long and was restarted.'), COMPILE_BUDGET_MS);

            this.pending = { id, resolve, timer };

            worker.postMessage({ ...request, id } satisfies CompileRequest);
        });
    }
}
