import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function inFunction(body: string): string {
    return `function take(value?: string): void\n${body}end\n`;
}

const ADAPTER = `class Adapter {
    connection?: userdata

    use = function (): void
`;

function inMethod(body: string): string {
    return `${ADAPTER}${body}    end\n}\n`;
}

describe('branch joins', () => {
    it('carries a fact refined in every branch past the join', () => {
        expect(codes(inFunction("    if value == nil then\n        value = 'fallback'\n    end\n\n    local text: string = value\n"))).toEqual([]);
    });

    it('carries a fact refined in both arms of an if and else', () => {
        const body = "    if value == nil then\n        value = 'left'\n    else\n        value = 'right'\n    end\n\n    local text: string = value\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('drops a fact refined in only one arm', () => {
        const header = 'function take(value: string | number, flag: boolean): void\n';
        const source = `${header}    if flag then\n        value = 'text'\n    end\n\n    local text: string = value\nend\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('keeps the fact of the reachable arm when the other returns', () => {
        expect(codes(inFunction('    if value == nil then\n        return\n    end\n\n    local text: string = value\n'))).toEqual([]);
    });

    it('keeps the fact of the reachable arm through an elseif chain', () => {
        const body = "    if value == nil then\n        return\n    elseif value == 'skip' then\n        return\n    end\n\n    local text: string = value\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('joins a field refined in both arms of a method', () => {
        const body = `        if self.connection == nil then
            return
        end

        local handle: userdata = self.connection

        outputDebugString(tostring(handle))
`;

        expect(codes(inMethod(body))).toEqual([]);
    });
});

describe('assignment facts', () => {
    it('refines a union to the assigned member', () => {
        expect(codes("function take(value: string | number): void\n    value = 'text'\n\n    local text: string = value\nend\n")).toEqual([]);
    });

    it('refines an optional field the method assigns', () => {
        const source = `class Adapter {
    connection?: userdata

    open = function (handle: userdata): void
        self.connection = handle

        local current: userdata = self.connection
    end
}
`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a later write that widens the path again', () => {
        expect(codes(inFunction("    if value ~= nil then\n        value = nil\n\n        local text: string = value\n    end\n"))).toEqual([
            'check-type-mismatch',
        ]);
    });

    it('records nothing for a value the checker cannot place in the union', () => {
        expect(codes('local ages: table<string, number> = {}\nlocal age: string = ages.thigas\n')).toEqual(['check-type-mismatch']);
    });
});

describe('loops', () => {
    it('carries the negated loop condition past the loop', () => {
        expect(codes(inFunction("    while value == nil do\n        value = 'filled'\n    end\n\n    local text: string = value\n"))).toEqual([]);
    });

    it('does not carry a fact established inside a loop body', () => {
        expect(codes(inFunction("    while value ~= nil do\n        value = 'kept'\n    end\n\n    local text: string = value\n"))).toEqual([
            'check-type-mismatch',
        ]);
    });

    it('drops a fact a loop body can overwrite', () => {
        const body = "    if value ~= nil then\n        for index = 1, 3 do\n            value = nil\n        end\n\n        local text: string = value\n    end\n";

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('drops a fact a repeat body can overwrite', () => {
        const body = '    if value ~= nil then\n        repeat\n            value = nil\n        until value == nil\n\n        local text: string = value\n    end\n';

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });
});

describe('flow boundaries', () => {
    it('does not carry a condition stored in a variable', () => {
        const body = '        local ready = self.connection ~= nil\n\n        if ready then\n            local handle: userdata = self.connection\n        end\n';

        expect(codes(inMethod(body))).toEqual(['check-type-mismatch']);
    });

    it('drops a fact a nested function can overwrite', () => {
        const body = `        if self.connection ~= nil then
            local reset = function (): void
                self.connection = nil
            end

            local handle: userdata = self.connection

            reset()
        end
`;

        expect(codes(inMethod(body))).toEqual(['check-type-mismatch']);
    });

    it('does not leak a fact out of a nested function', () => {
        const body = "    local fill = function (): void\n        value = 'inner'\n    end\n\n    fill()\n\n    local text: string = value\n";

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('does not leak a fact out of the block that declared its root', () => {
        const source = "function take(): void\n    do\n        local value: string = 'text'\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });
});
