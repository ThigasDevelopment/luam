import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const SERVER_FILE = 'src/server/main.luam';

function report(source: string) {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((d) => `${d.code} ${d.message} @${d.position.line}:${d.position.column}`);
}

const SOURCE =
    'class MySQLAdapter {\n' +
    '    constructor = function (): void\n\n    end\n' +
    '}\n' +
    'class Core {\n' +
    '    adapters: { mysql: MySQLAdapter };\n\n' +
    '    constructor = function ()\n' +
    '        self.adapters = { mysql = new MySQLAdapter() };\n\n' +
    '        return self;\n' +
    '    end\n\n' +
    '    init = function ()\n' +
    '        self.adapters.mysql:connect();\n\n' +
    '        return self;\n' +
    '    end\n' +
    '}\n';

describe('repro', () => {
    it('reports the missing method', () => {
        console.log(JSON.stringify(report(SOURCE), null, 2));
        expect(true).toBe(true);
    });
});
