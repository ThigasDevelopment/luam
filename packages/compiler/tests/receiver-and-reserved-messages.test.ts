import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

const ADAPTER = 'class RedisAdapter {\n    connect = function (): boolean\n        return true\n    end\n}\n\n';

const MARKERS =
    'class MarkersService {\n    markers: table<Marker, string> = {}\n\n    isMarkerType = function (marker: Marker, type: string): boolean\n        return self.markers[marker] == type\n    end\n}\n';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('a class used as a receiver', () => {
    it('does not prescribe the dotted call for an instance member', () => {
        const source = `${ADAPTER}RedisAdapter:connect()\n`;

        expect(codes(source)).toEqual(['check-class-receiver']);
        expect(messages(source)[0]).not.toContain('RedisAdapter.connect(...)');
    });

    it('names instantiating and reading from a value as the two ways out', () => {
        const source = `${ADAPTER}RedisAdapter:connect()\n`;

        expect(messages(source)[0]).toContain('new RedisAdapter()');
        expect(messages(source)[0]).toContain('value:connect(...)');
    });

    it('names the singleton case', () => {
        const source = `${ADAPTER}RedisAdapter:connect()\n`;

        expect(messages(source)[0]).toContain('class and its single instance share one name');
    });

    it('compiles the form the message prints', () => {
        expect(codes(`${ADAPTER}local adapter = new RedisAdapter()\n\nprint(adapter:connect())\n`)).toEqual([]);
    });

    it('keeps the static message and code for a static member', () => {
        const source = 'class Counter {\n    static bump = function (): number\n        return 1\n    end\n}\n\nCounter:bump()\n';

        expect(codes(source)).toEqual(['check-static-receiver']);
        expect(messages(source)[0]).toContain('Counter.bump(...)');
    });
});

describe('a reserved word in a name position', () => {
    it('names the rule and the word', () => {
        expect(messages(MARKERS)[0]).toContain('is a reserved word and cannot name a parameter');
        expect(messages(MARKERS)[0]).toContain('a property of the same name is still legal');
    });

    it('reports the parameter and the read, and nothing else', () => {
        expect(codes(MARKERS)).toEqual(['parse-reserved-name', 'parse-reserved-name']);
    });

    it('still registers the member for other files', () => {
        const owner: ProjectFile = { path: 'src/shared/markers.luam', source: MARKERS };
        const reader: ProjectFile = {
            path: 'src/server/main.luam',
            source: "local service = new MarkersService()\n\nprint(service:isMarkerType(nil, 'a'))\n",
        };
        const found = compileProject([owner, reader]).diagnostics.map((entry) => entry.diagnostic.code);

        expect(found).not.toContain('check-unknown-member');
    });

    it('names the rule for a local too', () => {
        expect(codes('local enum = 3\n')).toEqual(['parse-reserved-name']);
        expect(messages('local class = 1\n')[0]).toContain('cannot name a local');
    });

    it('keeps a reserved word usable as a property', () => {
        expect(codes('local pool: table = { new = 1, type = 2, class = 3 }\n\nprint(pool.new, pool.type, pool.class)\n')).toEqual([]);
    });

    it('keeps type callable', () => {
        expect(codes("local kind = type('a')\n\nprint(kind)\n")).toEqual([]);
    });
});
