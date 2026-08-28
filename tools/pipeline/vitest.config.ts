import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '#pipeline': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        include: ['tests/**/*.test.ts'],
    },
});
