export interface MockTerminal {
    name: string;
    cwd: string;
    shown: boolean;
    sent: string[];
    show: (preserveFocus?: boolean) => void;
    sendText: (text: string) => void;
}

export interface MockState {
    settings: Map<string, unknown>;
    folders: Array<{ uri: { fsPath: string } }> | undefined;
    terminals: MockTerminal[];
    registered: Map<string, (...args: unknown[]) => unknown>;
    errors: string[];
    watchers: string[];
    disposed: number;
}

export const state: MockState = {
    settings: new Map(),
    folders: [{ uri: { fsPath: '/project' } }],
    terminals: [],
    registered: new Map(),
    errors: [],
    watchers: [],
    disposed: 0,
};

export function resetMock(): void {
    state.settings = new Map();
    state.folders = [{ uri: { fsPath: '/project' } }];
    state.terminals = [];
    state.registered = new Map();
    state.errors = [];
    state.watchers = [];
    state.disposed = 0;
}

function createTerminal(options: { name: string; cwd: string }): MockTerminal {
    const terminal: MockTerminal = {
        name: options.name,
        cwd: options.cwd,
        shown: false,
        sent: [],
        show: (): void => {
            terminal.shown = true;
        },
        sendText: (text: string): void => {
            terminal.sent.push(text);
        },
    };

    state.terminals.push(terminal);

    return terminal;
}

export const workspace = {
    get workspaceFolders(): Array<{ uri: { fsPath: string } }> | undefined {
        return state.folders;
    },
    getConfiguration: (section: string) => ({
        get: <T>(key: string): T | undefined => state.settings.get(`${section}.${key}`) as T | undefined,
    }),
    createFileSystemWatcher: (pattern: string): { pattern: string; dispose: () => void } => {
        state.watchers.push(pattern);

        return { pattern, dispose: (): void => undefined };
    },
};

export const window = {
    get terminals(): MockTerminal[] {
        return state.terminals;
    },
    createTerminal,
    showErrorMessage: (message: string): Promise<undefined> => {
        state.errors.push(message);

        return Promise.resolve(undefined);
    },
};

export const commands = {
    registerCommand: (command: string, handler: (...args: unknown[]) => unknown): { dispose: () => void } => {
        state.registered.set(command, handler);

        return {
            dispose: (): void => {
                state.disposed += 1;
            },
        };
    },
};
