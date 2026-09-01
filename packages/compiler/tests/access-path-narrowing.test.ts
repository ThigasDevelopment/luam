import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

const TYPES =
    "type Socket = {\n    handle?: string\n}\n\ntype Ready = {\n    kind: 'ready',\n    port: number\n}\n\ntype Idle = {\n    kind: 'idle'\n}\n\ntype State = Ready | Idle\n\ntype Session = {\n    connection?: string,\n    socket: Socket,\n    state: State,\n    slots: table<string, string?>\n}\n\n";

const PROPS =
    "type NetworkProps = {\n    password?: string\n}\n\nclass Network {\n    password: string = ''\n\n    constructor = function (props: NetworkProps)\n";

function inFunction(body: string): string {
    return `${TYPES}function take(session: Session, other: Session, key: string): void\n${body}end\n`;
}

describe('access path narrowing', () => {
    it('narrows a guarded field', () => {
        expect(codes(inFunction('    if session.connection ~= nil then\n        local text: string = session.connection\n    end\n'))).toEqual([]);
    });

    it('narrows a nested path', () => {
        expect(codes(inFunction('    if session.socket.handle ~= nil then\n        local text: string = session.socket.handle\n    end\n'))).toEqual([]);
    });

    it('narrows a field tested for truthiness', () => {
        expect(codes(inFunction('    if session.connection then\n        local text: string = session.connection\n    end\n'))).toEqual([]);
    });

    it('narrows a field behind a guard clause that exits', () => {
        const body = '    if session.connection == nil then\n        return\n    end\n\n    local text: string = session.connection\n';

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('narrows a field tested with type()', () => {
        const body = "    if type(session.connection) == 'string' then\n        local text: string = session.connection\n    end\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('discriminates a union behind a path', () => {
        const body = "    if session.state.kind == 'ready' then\n        local port: number = session.state.port\n    end\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('leaves an untested field alone', () => {
        expect(codes(inFunction('    local text: string = session.connection\n'))).toEqual(['check-type-mismatch']);
    });
});

describe('access path invalidation', () => {
    it('drops the fact after a write to the path', () => {
        const body = '    if session.connection ~= nil then\n        session.connection = nil\n\n        local text: string = session.connection\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('drops the fact after a write to a prefix of the path', () => {
        const body = '    if session.socket.handle ~= nil then\n        session.socket = other.socket\n\n        local text: string = session.socket.handle\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('drops the fact after a write to the root', () => {
        const body = '    if session.connection ~= nil then\n        session = other\n\n        local text: string = session.connection\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('drops the fact when a loop body writes the path', () => {
        const body =
            '    if session.connection ~= nil then\n        for index = 1, 3 do\n            session.connection = nil\n        end\n\n        local text: string = session.connection\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('drops the fact when a closure captures and writes the path', () => {
        const body =
            '    if session.connection ~= nil then\n        local clear = function (): void\n            session.connection = nil\n        end\n\n        local text: string = session.connection\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('produces no fact for a dynamic index', () => {
        const body = '    if session.slots[key] ~= nil then\n        local text: string = session.slots[key]\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('narrows an optional property assigned to a class field behind a guard', () => {
        const guard = "        if props.password and type(props.password) == 'string' then\n            self.password = props.password\n        end\n";

        expect(codes(`${PROPS}${guard}    end\n}\n`)).toEqual([]);
    });

    it('reports the same assignment without the guard', () => {
        expect(codes(`${PROPS}        self.password = props.password\n    end\n}\n`)).toEqual(['check-type-mismatch']);
    });

    it('produces no fact for a call in the path', () => {
        const source = `${TYPES}function open(): Socket\n    return { handle = 'a' }\nend\n\nfunction take(): void\n    if open().handle ~= nil then\n        local text: string = open().handle\n    end\nend\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});
