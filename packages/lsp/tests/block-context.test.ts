import { describe, expect, it } from 'vitest';

import { blockContext } from '@lsp/features/block-context';

function frameAt(text: string, marker: string): ReturnType<typeof blockContext> {
    const found = text.indexOf(marker);

    if (found === -1) {
        throw new Error(`The marker "${marker}" was not found in the fixture.`);
    }

    return blockContext(text, found + marker.length);
}

describe('block context', () => {
    it('reports the open header of the innermost block', () => {
        const context = frameAt('if 1 + 1 == 2 the', 'the');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: true });
        expect(context.unbalanced).toBe(true);
    });

    it('closes the header once "then" is read', () => {
        const context = frameAt('if ready then\n    x\nend\n', '    x');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: false });
    });

    it('keeps the header open while the word under the cursor is being typed', () => {
        const context = frameAt('if ready then return end\n', 'then');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: true });
        expect(context.unbalanced).toBe(false);
    });

    it('reads the innermost of nested blocks', () => {
        const context = frameAt('if ready then\n    while running d\nend\n', 'running d');

        expect(context.frame).toMatchObject({ keyword: 'while', headerOpen: true });
    });

    it('treats the "do" of a loop header as the header closer and not as a block', () => {
        const context = frameAt('for index = 1, 10 do\n    x\nend\n', '    x');

        expect(context.frame).toMatchObject({ keyword: 'for', headerOpen: false });
    });

    it('pushes a frame for a "do" that opens a scope of its own', () => {
        const context = frameAt('do\n    x\nend\n', '    x');

        expect(context.frame).toMatchObject({ keyword: 'do', headerOpen: false });
    });

    it('reopens the header of the block an "elseif" continues', () => {
        const context = frameAt('if a then\n    x\nelseif b the\n', 'b the');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: true });
    });

    it('offers the repeat frame anywhere in its body and pops it on "until"', () => {
        const inside = frameAt('repeat\n    x\nuntil done\n', '    x');
        const after = frameAt('repeat\n    x\nuntil done\nl', '\nl');

        expect(inside.frame).toMatchObject({ keyword: 'repeat', headerOpen: false });
        expect(after.frame).toBeNull();
    });

    it('ignores an "end" written inside a string', () => {
        const context = frameAt("if ready then\n    say ('end')\n    x\n", '    x');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: false });
        expect(context.unbalanced).toBe(true);
    });

    it('ignores block words written inside a comment', () => {
        const context = frameAt('if ready then\n    # end\n    x\n', '    x');

        expect(context.frame).toMatchObject({ keyword: 'if', headerOpen: false });
        expect(context.unbalanced).toBe(true);
    });

    it('reports a closed block as balanced and an unterminated one as not', () => {
        const closed = frameAt('if ready the\nend\n', 'the');
        const open = frameAt('if ready the\n', 'the');

        expect(closed.unbalanced).toBe(false);
        expect(open.unbalanced).toBe(true);
    });

    it('reports no frame at the top level', () => {
        expect(frameAt('local value = 1\nl', '\nl').frame).toBeNull();
    });

    it('reports where the frame opened', () => {
        const context = frameAt('local ready = true\nif ready the', 'the');

        expect(context.frame?.start).toBe(19);
    });
});
