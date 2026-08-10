import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@compiler': fileURLToPath(new URL('./src', import.meta.url)),
            '@mta-types': fileURLToPath(new URL('../mta-types/src', import.meta.url)),
            '@runtime': fileURLToPath(new URL('../runtime/src', import.meta.url)),
        },
    },
    test: {
        include: ['tests/**/*.test.ts'],
    },
});
