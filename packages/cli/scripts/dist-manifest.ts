const REPOSITORY_URL = 'https://github.com/ThigasDevelopment/luam';

export function distManifest(version: string): string {
    const manifest = {
        name: '@thigasdevelopment/luam',
        version,
        description: 'The Luam compiler for Multi Theft Auto resources.',
        keywords: ['mta', 'mtasa', 'multi-theft-auto', 'lua', 'lua5.1', 'luau', 'compiler', 'transpiler', 'typed-lua'],
        homepage: `${REPOSITORY_URL}#readme`,
        bugs: { url: `${REPOSITORY_URL}/issues` },
        repository: { type: 'git', url: `git+${REPOSITORY_URL}.git` },
        license: 'MIT',
        author: 'Thigas',
        type: 'module',
        bin: { luam: 'luam.mjs' },
        engines: { node: '>=20' },
        files: ['luam.mjs', 'lua', 'template'],
    };

    return `${JSON.stringify(manifest, null, 4)}\n`;
}
