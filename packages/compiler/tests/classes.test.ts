import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const PLAYER = 'class Player {\n    health: number = 100\n\n    constructor = function (name: string)\n        self.name = name\n    end\n}\n';

const COMMAND = 'interface Command {\n    name: string\n    execute(): void\n}\n';

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function helpers(source: string): string[] {
    return compile(source).requiredHelpers;
}

describe('classes', () => {
    it('emits fields with defaults and methods as a class runtime call', () => {
        expect(emit(PLAYER)).toBe(
            "class 'Player' {\n    health = 100,\n\n    constructor = function(self, name)\n        self.name = name\n    end\n}\n",
        );
    });

    it('rejects consecutive class member names without a separator', () => {
        const source = 'class Name { constructor = function () end random name = function () end }';

        expect(codes(source)).toContain('parse-unexpected-token');
    });

    it('injects self into assignment-style class methods', () => {
        const source = 'class Player {\n    describe = function (): string\n        return self.name\n    end\n}\n';

        expect(emit(source)).toContain('describe = function(self)');
    });

    it('rejects an explicit self parameter in class methods', () => {
        const source = 'class Player {\n    describe = function (self: Player): string\n        return self.name\n    end\n}\n';

        expect(codes(source)).toEqual(['check-explicit-self-parameter']);
    });

    it('emits a field without a default as nothing', () => {
        expect(emit('class Player {\n    name: string\n}\n')).toBe("class 'Player' {}\n");
    });

    it('emits inheritance as an extends modifier and lowers super calls', () => {
        const source = `${PLAYER}class VIPPlayer extends Player {\n    constructor = function (name: string)\n        super(name)\n    end\n}\n`;

        expect(emit(source)).toContain("class 'VIPPlayer' :extends 'Player' {");
        expect(emit(source)).toContain('self:super(name)');
    });

    it('emits instantiation as a new runtime call', () => {
        expect(emit(`${PLAYER}local player = new Player('Thigas')\n`)).toContain("local player = new 'Player' ('Thigas')");
    });

    it('erases interfaces from the generated Lua', () => {
        expect(emit(COMMAND)).toBe('');
        expect(helpers(COMMAND)).toEqual([]);
    });

    it('emits an enum that is used and erases one that is not', () => {
        expect(emit('enum State {\n    LOBBY,\n    PLAYING,\n}\nprint(State.LOBBY)\n')).toBe(
            "State = enum { 'LOBBY', 'PLAYING' }\n\n\n\nprint(State.LOBBY)\n",
        );
        expect(emit('enum State {\n    LOBBY,\n}\nprint(1)\n')).toBe('\n\n\nprint(1)\n');
    });

    it('leaves no blank lines behind a declaration erased at the end of the file', () => {
        expect(emit('print(1)\n\nenum State {\n    LOBBY,\n}\n')).toBe('print(1)\n');
        expect(emit(`print(1)\n\n${COMMAND}`)).toBe('print(1)\n');
    });

    it('requires the class helper only for emitted OOP and enum features', () => {
        expect(helpers(PLAYER)).toEqual(['class']);
        expect(helpers(`${PLAYER}local player = new Player('Thigas')\n`)).toEqual(['class']);
        expect(helpers('enum State {\n    LOBBY,\n}\nprint(State.LOBBY)\n')).toEqual(['class']);
        expect(helpers('enum State {\n    LOBBY,\n}\nprint(1)\n')).toEqual([]);
        expect(helpers("local name: string = 'Thigas'\nprint(name)\n")).toEqual([]);
    });

    it('resolves inherited members through the parent chain', () => {
        const source = `${PLAYER}class VIPPlayer extends Player {\n}\nlocal vip = new VIPPlayer('Thigas')\nlocal total: number = vip.health\n`;

        expect(codes(source)).toEqual([]);
    });

    it('checks constructor arguments at the instantiation site', () => {
        expect(codes(`${PLAYER}local player = new Player()\n`)).toEqual(['check-argument-count']);
        expect(codes(`${PLAYER}local player = new Player(1)\n`)).toEqual(['check-type-mismatch']);
        expect(codes(`${PLAYER}local player = new Player('Thigas')\n`)).toEqual([]);
    });

    it('reports an instantiation of a class that is not defined', () => {
        expect(codes("local player = new Player('Thigas')")).toEqual(['check-unknown-class']);
    });

    it('reports a parent class that is not defined', () => {
        expect(codes('class VIPPlayer extends Player {\n}\n')).toEqual(['check-unknown-class']);
    });

    it('reports a duplicate class definition', () => {
        expect(codes(`${PLAYER}${PLAYER}`)).toEqual(['check-duplicate-class']);
    });

    it('reports a field default that does not match its annotation', () => {
        expect(codes('class Player {\n    health: number = true\n}\n')).toEqual(['check-type-mismatch']);
    });

    it('reports an interface that is not defined', () => {
        expect(codes('class KickCommand implements Command {\n}\n')).toEqual(['check-unknown-interface']);
    });

    it('reports a class that does not satisfy its interface', () => {
        expect(codes(`${COMMAND}class KickCommand implements Command {\n    name: string = 'kick'\n}\n`)).toEqual([
            'check-unimplemented-interface',
        ]);
        expect(codes(`${COMMAND}class KickCommand implements Command {\n    name: number = 1\n\n    execute = function (): void\n    end\n}\n`)).toEqual([
            'check-unimplemented-interface',
        ]);
    });

    it('accepts a class that omits an optional interface member', () => {
        expect(codes('interface IExample {\n    name?: string,\n}\n\nclass Example implements IExample {\n}\n')).toEqual([]);
        expect(codes('interface IExample {\n    name?: string,\n}\n\nclass Example implements IExample {\n    name: number = 1\n}\n')).toEqual([
            'check-unimplemented-interface',
        ]);
    });

    it('accepts a class that satisfies its interface', () => {
        expect(codes(`${COMMAND}class KickCommand implements Command {\n    name: string = 'kick'\n\n    execute = function (): void\n    end\n}\n`)).toEqual(
            [],
        );
    });

    it('checks implements against the interface when a class shares its name', () => {
        const source = [
            'interface Command { name: string execute(): void }',
            'class Command {',
            '    core: any = nil',
            '',
            '    execute = function (): void',
            '    end',
            '}',
            'class KickCommand implements Command {',
            "    name: string = 'kick'",
            '',
            '    execute = function (): void',
            '    end',
            '}',
        ].join('\n');

        expect(codes(source)).toEqual([]);
        expect(codes(source.replace("    name: string = 'kick'\n", ''))).toEqual(['check-unimplemented-interface']);
    });

    it('extends the interface when a class shares the parent name', () => {
        const source = [
            'interface Named { name: string }',
            'class Named { id: number = 1 }',
            'interface Entity extends Named {}',
            'class Player implements Entity {',
            "    name: string = 'Thigas'",
            '}',
        ].join('\n');

        expect(codes(source)).toEqual([]);
    });

    it('checks classes against inherited interface members', () => {
        const source = [
            'interface Named { name: string }',
            'interface Described { describe(): string }',
            'interface Entity extends Named, Described { id: number }',
            'class Player implements Entity {',
            '    name: string',
            '    id: number',
            '    describe = function (): string return self.name end',
            '}',
        ].join('\n');

        expect(codes(source)).toEqual([]);
        expect(codes(source.replace('    id: number\n', ''))).toEqual(['check-unimplemented-interface']);
    });

    it('resolves inherited members on interface-typed values', () => {
        const source = [
            'interface Named { name: string }',
            'interface Entity extends Named { describe(value: number): string }',
            'local entity: Entity',
            'local name: string = entity.name',
            'local description: string = entity:describe(1)',
        ].join('\n');

        expect(codes(source)).toEqual([]);
        expect(codes(source.replace('describe(1)', "describe('wrong')"))).toEqual(['check-type-mismatch']);
    });

    it('accepts compatible members inherited from multiple interfaces', () => {
        const source = 'interface Left { id: number }\ninterface Right { id: number }\ninterface Child extends Left, Right {}\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports invalid interface inheritance', () => {
        expect(codes('interface Child extends Missing {}\n')).toEqual(['check-unknown-interface']);
        expect(codes('interface Child extends Child {}\n')).toEqual(['check-interface-cycle']);
        expect(codes('interface Parent {}\ninterface Child extends Parent, Parent {}\n')).toEqual(['check-duplicate-interface-parent']);
    });

    it('reports conflicting inherited interface members', () => {
        const source = 'interface Left { id: number }\ninterface Right { id: string }\ninterface Child extends Left, Right {}\n';

        expect(codes(source)).toEqual(['check-conflicting-interface-member']);
    });

    it('reports duplicate members declared by an interface', () => {
        expect(codes('interface Named { name: string name: number }\n')).toEqual(['check-duplicate-interface-member']);
    });

    it('reports a super call that cannot resolve a parent method', () => {
        expect(codes('local function helper(): void\n    super()\nend\n')).toEqual(['check-invalid-super']);
        expect(codes('class Player {\n    greet = function (): void\n        super()\n    end\n}\n')).toEqual(['check-invalid-super']);
        expect(codes(`${PLAYER}class VIPPlayer extends Player {\n    greet = function (): void\n        super()\n    end\n}\n`)).toEqual([
            'check-unknown-super-method',
        ]);
    });

    it('checks super call arguments against the parent method', () => {
        const source = `${PLAYER}class VIPPlayer extends Player {\n    constructor = function (name: string)\n        super(1)\n    end\n}\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('rejects the legacy self super call syntax', () => {
        const source = `${PLAYER}class VIPPlayer extends Player {\n    constructor = function (name: string)\n        self:super(name)\n    end\n}\n`;

        expect(codes(source)).toEqual(['check-invalid-super']);
    });

    it('reports an enum member that is not declared', () => {
        expect(codes('enum State {\n    LOBBY,\n}\nprint(State.PLAYING)\n')).toEqual(['check-unknown-enum-member']);
    });

    it('reserves class, interface, enum, and new so they cannot name a variable', () => {
        expect(codes('local class = 1\n')).toEqual(['parse-unexpected-token']);
        expect(codes('local new = 2\n')).toEqual(['parse-unexpected-token']);
        expect(codes('local enum = 3\n')).toEqual(['parse-unexpected-token']);
        expect(codes('local interface = 4\n')).toEqual(['parse-unexpected-token']);
    });

    it('keeps the reserved words usable as table fields and members', () => {
        const source = 'local pool: table = { new = 1, type = 2, class = 3 }\nprint(pool.new, pool.type, pool.class)\n';

        expect(codes(source)).toEqual([]);
        expect(emit(source)).toBe('local pool = { new = 1, type = 2, class = 3 }\nprint(pool.new, pool.type, pool.class)\n');
    });

    it('rejects a class field named constructor', () => {
        expect(codes('class Player {\n    constructor: number = 1\n}\n')).toEqual(['check-invalid-constructor']);
        expect(codes('class Player {\n    constructor = bind(print, 1)\n}\n')).toEqual(['check-invalid-constructor']);
    });

    it('accepts the constructor written as a method', () => {
        expect(codes(PLAYER)).toEqual([]);
    });

    it('rejects self outside a method', () => {
        expect(codes('print(self)\n')).toEqual(['check-invalid-self']);
        expect(codes('self.name = "Thigas"\n')).toEqual(['check-invalid-self']);
        expect(codes('function greet(): void\n    print(self)\nend\n')).toEqual(['check-invalid-self']);
    });

    it('accepts self inside class methods, colon functions, and their closures', () => {
        const body = ['    greet = function (): void', '        bind(function ()', '            print(self)', '        end, 1)', '    end'];
        const closure = ['class Player {', ...body, '}', ''].join('\n');

        expect(codes(PLAYER)).toEqual([]);
        expect(codes('function Player:greet()\n    return self.name\nend\n')).toEqual([]);
        expect(codes(closure)).toEqual([]);
    });

    it('keeps a local named self usable', () => {
        expect(codes('local self: table = {}\nprint(self)\n')).toEqual([]);
    });

    it('keeps the Lua "type" function callable', () => {
        expect(codes('local kind: string = type(1)\n')).toEqual([]);
        expect(emit('local kind: string = type(1)\n')).toBe('local kind = type(1)\n');
    });
});
