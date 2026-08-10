import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            'vscode-languageclient/node': fileURLToPath(new URL('./tests/support/language-client-mock.ts', import.meta.url)),
            vscode: fileURLToPath(new URL('./tests/support/vscode-mock.ts', import.meta.url)),
            '@vscode-extension': fileURLToPath(new URL('./src', import.meta.url)),
            '@lsp': fileURLToPath(new URL('../lsp/src', import.meta.url)),
            '@compiler': fileURLToPath(new URL('../compiler/src', import.meta.url)),
            '@mta-types': fileURLToPath(new URL('../mta-types/src', import.meta.url)),
        },
    },
    test: {
        include: ['tests/**/*.test.ts'],
    },
});
