import { describe, expect, it } from 'vitest';

import { check } from '@compiler/checker/checker';
import { compile } from '@compiler/index';
import { parse } from '@compiler/parser/parser';

function result(source: string) {
    return compile(source);
}

function code(source: string): string {
    const compiled = result(source);

    expect(compiled.diagnostics).toEqual([]);

    return compiled.code ?? '';
}

function codes(source: string): string[] {
    return result(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('decorators', () => {
    it.each([
        ['name: string', 'getName', 'setName'],
        ['health: number = 100', 'getHealth', 'setHealth'],
        ['admin: boolean', 'isAdmin', 'setAdmin'],
        ['isAdmin: boolean', 'isAdmin', 'setAdmin'],
        ['enabled?: boolean', 'isEnabled', 'setEnabled'],
        ['spawned = true', 'isSpawned', 'setSpawned'],
        ['island: boolean', 'isIsland', 'setIsland'],
        ['x: number', 'getX', 'setX'],
        ['value', 'getValue', 'setValue'],
    ])('generates accessors for %s', (field, getter, setter) => {
        const emitted = code(`class Value {\n    @Getter\n    @Setter\n    ${field}\n}\n`);

        expect(emitted).toContain(`${getter} = function(self)`);
        expect(emitted).toContain(`${setter} = function(self, value)`);
    });

    it.each([
        ['type Flag = boolean\n', 'admin: Flag', 'isAdmin'],
        ['type Flag = boolean\ntype OtherFlag = Flag\n', 'admin: OtherFlag', 'isAdmin'],
        ['', 'admin: boolean | string', 'getAdmin'],
        ['', 'admin: any', 'getAdmin'],
        ['type Name = string\n', 'name: Name', 'getName'],
    ])('uses the resolved field type for accessor naming', (prefix, field, getter) => {
        expect(code(`${prefix}class Value {\n    @Getter\n    ${field}\n}\n`)).toContain(`${getter} = function(self)`);
    });

    it('applies class decorators to every field and deduplicates field decorators', () => {
        const emitted = code('@Getter\nclass Player {\n    @Getter\n    name: string\n    health: number\n}\n');

        expect(emitted.match(/getName =/g)).toHaveLength(1);
        expect(emitted.match(/getHealth =/g)).toHaveLength(1);
    });

    it('ignores constructors when applying class accessors', () => {
        const emitted = code('@Getter\n@Setter\nclass Example {\n    constructor = function ()\n    end\n}\n');

        expect(emitted).toContain('constructor = function(self)');
        expect(emitted).not.toContain('getConstructor');
        expect(emitted).not.toContain('setConstructor');
    });

    it('types generated accessors and method calls', () => {
        const valid = 'class Player {\n    @Getter\n    @Setter\n    name: string\n}\nlocal player = new Player()\nplayer:setName("Luam")\nlocal name: string = player:getName()\n';
        const invalid = valid.replace('player:setName("Luam")', 'player:setName(1)');

        expect(codes(valid)).toEqual([]);
        expect(codes(invalid)).toEqual(['check-type-mismatch']);
    });

    it('lets generated accessors satisfy interfaces and resolve through inheritance', () => {
        const source = 'interface Named {\n    getName(): string\n}\nclass Parent implements Named {\n    @Getter\n    name: string\n}\nclass Child extends Parent {\n}\nlocal child = new Child()\nlocal name: string = child:getName()\n';

        expect(codes(source)).toEqual([]);
    });

    it('resolves generated accessors through self', () => {
        const source = 'class Player {\n    @Getter\n    name: string\n    copy = function (): string\n        return self:getName()\n    end\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it.each([
        ['class Value {\n    @Unknown\n    name: string\n}\n', 'check-unknown-decorator'],
        ['class Value {\n    @Getter\n    run = function (): void\n    end\n}\n', 'check-decorator-target'],
        ['class Value {\n    @Getter\n    @Getter\n    name: string\n}\n', 'check-duplicate-decorator'],
        ['class Value {\n    @Getter\n    name: string\n    getName = function (): string return self.name end\n}\n', 'check-decorator-conflict'],
    ])('reports invalid decorator usage', (source, diagnostic) => {
        const [found] = result(source).diagnostics;

        expect(found?.code).toBe(diagnostic);
        expect(found?.position.column).toBe(5);
    });

    it('reports collisions between generated accessors', () => {
        const source = 'class Value {\n    @Getter\n    admin: boolean\n    @Getter\n    isAdmin: boolean\n}\n';

        expect(codes(source)).toEqual(['check-decorator-conflict']);
    });

    it('keeps generated members outside the parsed AST and stable across checks', () => {
        const parsed = parse('class Value {\n    @Getter\n    name: string\n}\n');
        const first = check(parsed.program, 'strict');
        const second = check(parsed.program, 'strict');

        expect(parsed.program.body[0]?.kind === 'class-declaration' && parsed.program.body[0].members).toHaveLength(1);
        expect([...first.generatedMembers.values()].flat().map((member) => member.name)).toEqual(['getName']);
        expect([...second.generatedMembers.values()].flat().map((member) => member.name)).toEqual(['getName']);
        expect(first.diagnostics).toEqual(second.diagnostics);
    });

    it('emits accessors after authored members and erases decorator syntax', () => {
        const emitted = code('class Value {\n    @Getter\n    first: string = "a"\n    constructor = function ()\n    end\n    run = function (): void\n    end\n}\n');

        expect(emitted.indexOf('first =')).toBeLessThan(emitted.indexOf('getFirst ='));
        expect(emitted.indexOf('constructor =')).toBeLessThan(emitted.indexOf('getFirst ='));
        expect(emitted.indexOf('run =')).toBeLessThan(emitted.indexOf('getFirst ='));
        expect(emitted).not.toContain('@');
        expect(result('class Value {\n    @Getter\n    name: string\n}\n').requiredHelpers).toEqual(['class']);
    });

    it('generates the confirmed class and field decorator APIs', () => {
        const source = '@ToString\n@Equals\n@Clone\n@Serializable\n@Deserialize\n@Builder\nclass Profile {\n    @FluentSetter\n    name: string = \'Luam\'\n    @Lazy\n    token: string = \'token\'\n    @Observable\n    online: boolean = false\n}\nlocal builder = new ProfileBuilder()\nlocal profile = builder:withName(\'Thigas\'):build()\nlocal token: string = profile:getToken()\n';
        const emitted = code(source);

        expect(emitted).toContain('toString = function(self)');
        expect(emitted).toContain('equals = function(self, other)');
        expect(emitted).toContain('clone = function(self)');
        expect(emitted).toContain('toTable = function(self)');
        expect(emitted).toContain('fromTable = function(self, values)');
        expect(emitted).toContain('onOnlineChanged = function(self, listener)');
        expect(emitted).toContain("class 'ProfileBuilder'");
        expect(emitted).toContain('withName = function(self, value)');
    });

    it('preserves an inferred lazy field type', () => {
        const source = 'class Value {\n    @Lazy\n    active = true\n}\nlocal value = new Value()\nlocal active: boolean = value:isActive()\n';

        expect(codes(source)).toEqual([]);
    });

    it('enforces readonly fields, warns on deprecated use, and validates overrides', () => {
        const readOnly = 'class Value {\n    @ReadOnly\n    value: number\n}\nlocal value = new Value()\nvalue.value = 1\n';
        const deprecated = 'class Value {\n    @Deprecated\n    run = function (): void\n    end\n}\nlocal value = new Value()\nvalue:run()\n';
        const invalidOverride = 'class Parent {\n    run = function (value: string): void\n    end\n}\nclass Child extends Parent {\n    @Override\n    run = function (value: number): void\n    end\n}\n';

        expect(codes(readOnly)).toEqual(['check-readonly-assignment']);
        expect(codes(deprecated)).toEqual(['check-deprecated-use']);
        expect(codes(invalidOverride)).toEqual(['check-invalid-override']);
    });
});
