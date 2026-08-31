import { describe, expect, it } from 'vitest';

import { runClasses } from './support/lua-vm';

const PARENT = "class 'Parent' {\n    label = function(self)\n        return 'parent'\n    end\n}\n";

const CHILD = "class 'Child' :extends 'Parent' {\n    describe = function(self)\n        return 'child:' .. self:label()\n    end\n}\n";

describe('class helper', () => {
    it('inherits from a parent declared after the child', () => {
        const outcome = runClasses(`${CHILD}${PARENT}result = new 'Child' ():describe()\n`);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('child:parent');
    });

    it('inherits from a parent declared before the child', () => {
        const outcome = runClasses(`${PARENT}${CHILD}result = new 'Child' ():describe()\n`);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('child:parent');
    });

    it('binds super to a parent declared after the child', () => {
        const source = "class 'Child' :extends 'Parent' {\n    label = function(self)\n        return 'child+' .. self:super()\n    end\n}\n";
        const outcome = runClasses(`${source}${PARENT}result = new 'Child' ():label()\n`);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('child+parent');
    });

    it('binds super to a parent declared before the child', () => {
        const source = "class 'Child' :extends 'Parent' {\n    label = function(self)\n        return 'child+' .. self:super()\n    end\n}\n";
        const outcome = runClasses(`${PARENT}${source}result = new 'Child' ():label()\n`);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('child+parent');
    });

    it('runs field initializers in the authored order', () => {
        const source = [
            'local log = {}',
            'local function note(tag) log[#log + 1] = tag return tag end',
            "class 'Child' :extends 'Parent' {",
            "    tag = note('child')",
            '}',
            "note('between')",
            "class 'Parent' {",
            "    tag = note('parent')",
            '}',
            "result = table.concat(log, ',')",
            '',
        ].join('\n');
        const outcome = runClasses(source);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('child,between,parent');
    });

    it('refuses to instantiate a class whose parent never arrives', () => {
        const source = "class 'Child' :extends 'Ghost' {}\nlocal ok, err = pcall(function()\n    return new 'Child' ()\nend)\nresult = tostring(err)\n";
        const outcome = runClasses(source);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toContain('Ghost');
        expect(outcome.result).toContain('not defined');
    });

    it('refuses to instantiate a class nothing declares', () => {
        const outcome = runClasses("local ok, err = pcall(function()\n    return new 'Missing' ()\nend)\nresult = tostring(err)\n");

        expect(outcome.result).toContain('Missing');
    });

    it('refuses a second declaration of one class', () => {
        const source = "class 'Twice' {}\nlocal ok, err = pcall(function()\n    return class 'Twice' {}\nend)\nresult = tostring(err)\n";
        const outcome = runClasses(source);

        expect(outcome.result).toContain('already exists');
    });

    it('hides a parent that is still pending from getClass', () => {
        const outcome = runClasses("class 'Child' :extends 'Ghost' {}\nresult = tostring(getClass('Ghost'))\n");

        expect(outcome.result).toBe('nil');
    });

    it('reports a class once it is declared', () => {
        const outcome = runClasses(`${CHILD}${PARENT}result = tostring(getClass('Parent').__name) .. ',' .. tostring(getClasses()['Child'].__name)\n`);

        expect(outcome.result).toBe('Parent,Child');
    });

    it('runs the constructor and keeps field defaults', () => {
        const source = "class 'Player' {\n    health = 100,\n    constructor = function(self, name)\n        self.name = name\n    end\n}\nlocal player = new 'Player' ('Thigas')\nresult = player.name .. '/' .. tostring(player.health)\n";
        const outcome = runClasses(source);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('Thigas/100');
    });

    it('keeps a blocked metamethod blocked', () => {
        const source = "local ok, err = pcall(function()\n    class 'Bad' :metamethods({ __index = function() end }) {}\n    return new 'Bad' ()\nend)\nresult = tostring(err)\n";
        const outcome = runClasses(source);

        expect(outcome.result).toContain('__index');
    });

    it('reads and writes a static through the class table', () => {
        const source = "class 'Counter' {\n    total = 0,\n    bump = function(amount)\n        getClass('Counter').total = getClass('Counter').total + amount\n        return getClass('Counter').total\n    end\n}\nresult = tostring(getClass('Counter').bump(2)) .. ',' .. tostring(getClass('Counter').total)\n";
        const outcome = runClasses(source);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('2,2');
    });

    it('shares one static slot with a subclass', () => {
        const source = "class 'Base' {\n    origin = 'base'\n}\nclass 'Child' :extends 'Base' {}\nlocal before = getClass('Child').origin\ngetClass('Base').origin = 'moved'\nresult = before .. ',' .. getClass('Child').origin\n";
        const outcome = runClasses(source);

        expect(outcome.error).toBeNull();
        expect(outcome.result).toBe('base,moved');
    });

    it('numbers enum members from zero', () => {
        const outcome = runClasses("local colors = enum { 'RED', 'GREEN' }\nresult = tostring(colors.RED) .. ',' .. tostring(colors.GREEN)\n");

        expect(outcome.result).toBe('0,1');
    });
});
