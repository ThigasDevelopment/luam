import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { generatedFiles, staleTargets } from '@theme/generate';

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('determinism', () => {
    it('writes every target from the role table', () => {
        expect(generatedFiles(workspaceRoot).map((file) => file.path.replace(/\\/g, '/'))).toEqual([
            'packages/vscode/themes/luam-dark.json',
            'packages/vscode/themes/luam-light.json',
            'packages/theme/dist-themes/luam-zed.json',
            'packages/theme/dist-themes/luam.lua',
            'packages/theme/dist-themes/luam-dark.tmTheme',
            'packages/theme/dist-themes/luam-light.tmTheme',
            'docs/generated/theme-sample.md',
            'docs/generated/theme-elements.en.md',
            'docs/generated/theme-contrast.en.md',
            'docs/generated/theme-elements.pt-br.md',
            'docs/generated/theme-contrast.pt-br.md',
        ]);
    });

    it('matches every committed file byte for byte', () => {
        expect(staleTargets(workspaceRoot)).toEqual([]);
    });

    it('produces the same bytes twice', () => {
        const first = generatedFiles(workspaceRoot);
        const second = generatedFiles(workspaceRoot);

        expect(first).toEqual(second);
    });

    it('tells a reader the files are generated', () => {
        for (const file of generatedFiles(workspaceRoot)) {
            const contents = readFileSync(fileURLToPath(new URL(`../../../${file.path.replace(/\\/g, '/')}`, import.meta.url)), 'utf8');

            expect(contents.includes('@luam/theme'), file.path).toBe(true);
        }
    });
});
