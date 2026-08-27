import { describe, expect, it } from 'vitest';

import { runClasses } from './support/lua-vm';

const POINT = `class 'Point' {
    x = 0,

    constructor = function(self, x)
        self.x = x
    end,

    __tostring = function(self)
        return 'Point(' .. tostring(self.x) .. ')'
    end,

    __eq = function(self, other)
        return self.x == other.x
    end,

    __lt = function(self, other)
        return self.x < other.x
    end,

    __len = function(self)
        return self.x
    end,

    __add = function(self, other)
        return new 'Point' (self.x + other.x)
    end,

    __concat = function(left, right)
        return tostring(left) .. '|' .. tostring(right)
    end
}
`;

describe('class metamethods', () => {
    it('renders an instance through tostring', () => {
        expect(runClasses(`${POINT}result = tostring(new 'Point' (3))\n`).result).toBe('Point(3)');
    });

    it('compares two instances', () => {
        const source = `${POINT}local same = new 'Point' (2) == new 'Point' (2)\nlocal other = new 'Point' (2) == new 'Point' (3)\nresult = tostring(same) .. ':' .. tostring(other)\n`;

        expect(runClasses(source).result).toBe('true:false');
    });

    it('orders two instances', () => {
        const source = `${POINT}result = tostring(new 'Point' (1) < new 'Point' (2)) .. ':' .. tostring(new 'Point' (3) < new 'Point' (2))\n`;

        expect(runClasses(source).result).toBe('true:false');
    });

    it('answers the length operator', () => {
        expect(runClasses(`${POINT}result = tostring(#(new 'Point' (7)))\n`).result).toBe('7');
    });

    it('answers arithmetic', () => {
        expect(runClasses(`${POINT}result = tostring(new 'Point' (2) + new 'Point' (3))\n`).result).toBe('Point(5)');
    });

    it('answers concatenation', () => {
        expect(runClasses(`${POINT}result = new 'Point' (1) .. new 'Point' (2)\n`).result).toBe('Point(1)|Point(2)');
    });

    it('inherits a metamethod from the parent', () => {
        const source = `${POINT}class 'Marker' :extends 'Point' {
    label = function(self)
        return 'marker'
    end
}

result = tostring(new 'Marker' (4))
`;

        expect(runClasses(source).result).toBe('Point(4)');
    });

    it('lets a child override an inherited metamethod', () => {
        const source = `${POINT}class 'Marker' :extends 'Point' {
    __tostring = function(self)
        return 'Marker(' .. tostring(self.x) .. ')'
    end
}

result = tostring(new 'Marker' (4)) .. ':' .. tostring(new 'Point' (4))
`;

        expect(runClasses(source).result).toBe('Marker(4):Point(4)');
    });

    it('keeps member lookup and construction unchanged', () => {
        const source = `${POINT}local point = new 'Point' (9)
point.tag = 'set'
result = tostring(point.x) .. ':' .. point.tag
`;

        expect(runClasses(source).result).toBe('9:set');
    });

    it('refuses a blocked metamethod passed through the modifier', () => {
        const source = `class 'Sneaky' :metamethods { __index = function() return 1 end } {
    x = 0
}

result = tostring(new 'Sneaky' ())
`;

        expect(runClasses(source).error).toContain('Cannot override metamethod __index');
    });

    it('refuses a blocked call hook passed through the modifier', () => {
        const source = `class 'Sneaky' :metamethods { __call = function() return 1 end } {
    x = 0
}

result = tostring(new 'Sneaky' ())
`;

        expect(runClasses(source).error).toContain('Cannot override metamethod __call');
    });

    it('ignores a key that is not an exposed metamethod', () => {
        const source = `class 'Quiet' {
    __cache = 1,

    read = function(self)
        return self.__cache
    end
}

result = tostring(new 'Quiet' ():read())
`;

        expect(runClasses(source).result).toBe('1');
    });
});
