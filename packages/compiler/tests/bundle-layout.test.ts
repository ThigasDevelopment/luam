import { describe, expect, it } from 'vitest';

import { compileProject } from '@compiler/project/project';
import { assembleResource, materializeBundles, resolveResourcePosition } from '@compiler/project/resource';

describe('bundle resource layout', () => {
    it('assembles environment bundles with helpers first and load-ordered module blocks', () => {
        const project = compileProject([
            { path: 'src/shared/shop.luam', source: "class Shop {\n    name: string = ''\n}\n" },
            { path: 'src/server/a.luam', source: "print('a')\n" },
            { path: 'src/server/z.luam', source: "print('z')\n" },
        ]);
        const build = assembleResource(project, { layout: 'bundle', loadOrder: ['src/server/z.luam'] }).build;
        const shared = build?.bundles.find((bundle) => bundle.environment === 'shared');
        const server = build?.bundles.find((bundle) => bundle.environment === 'server');

        expect(build?.scripts).toEqual([]);
        expect(shared?.members[0]?.kind).toBe('helper');
        expect(server?.members.map((member) => (member.kind === 'module' ? member.module.source : member.helper.file))).toEqual([
            'src/server/z.luam',
            'src/server/a.luam',
        ]);
        expect(build?.manifest).not.toContain('lib/');
        expect(build?.manifest).not.toContain('**/*.lua');
        expect(build?.manifest).toContain('<script src="src/shared.lua" type="shared" cache="false" />');
        expect(build?.manifest).toContain('<script src="src/server.lua" />');
    });

    it('places configuration before bundles and omits empty environments', () => {
        const project = compileProject([{ path: 'code/server/main.luam', source: '#!server\nprint(1)\n' }]);
        const configuration = { path: 'config.lua', source: 'config.lua', content: 'Config = {}\n' };
        const build = assembleResource(project, { layout: 'bundle', configuration }).build;
        const entries = build?.manifest.match(/src="[^"]+"/g) ?? [];

        expect(build?.bundles.map((bundle) => bundle.path)).toEqual(['src/server.lua']);
        expect(entries).toEqual(['src="config.lua"', 'src="src/server.lua"']);
    });

    it('concatenates members and resolves module lines after CLI-owned helper bytes', () => {
        const project = compileProject([{ path: 'src/shared/main.luam', source: '\nprint(1)\n' }]);
        const build = assembleResource(project, { layout: 'bundle', helpers: ['class'] }).build;

        expect(build).not.toBeNull();

        if (build === null || build === undefined) {
            return;
        }

        const materialized = materializeBundles('demo', build.bundles, () => '_class = {}\n');
        const script = materialized.scripts[0];

        expect(script?.content).toBe('_class = {}\nprint(1)\n');
        expect(materialized.map.files[0]?.segments).toEqual([
            {
                kind: 'helper',
                generatedStartLine: 1,
                generatedEndLine: 1,
                contentStartLine: 1,
                source: 'class.lua',
                lines: [],
            },
            {
                kind: 'module',
                generatedStartLine: 2,
                generatedEndLine: 2,
                contentStartLine: 2,
                source: 'src/shared/main.luam',
                lines: [{ generatedLine: 1, sourceLine: 2 }],
            },
        ]);
        expect(resolveResourcePosition(materialized.map, 'src/shared.lua', 2)).toEqual({
            status: 'resolved',
            position: { file: 'src/shared/main.luam', line: 2 },
        });
        expect(resolveResourcePosition(materialized.map, 'src/shared.lua', 1)).toEqual({ status: 'uncovered' });
        expect(resolveResourcePosition(materialized.map, 'src/shared.lua', 3)).toEqual({ status: 'uncovered' });
    });

    it('concatenates modules into one chunk scope without function frames', () => {
        const project = compileProject([
            { path: 'src/server/first.luam', source: "local value: string = 'first'\nprint(value)\n" },
            { path: 'src/server/second.luam', source: "local value: string = 'second'\nerror(value, 2)\n" },
        ]);
        const build = assembleResource(project, { layout: 'bundle' }).build;

        expect(build).not.toBeNull();

        if (build === null) {
            return;
        }

        const content = materializeBundles('demo', build.bundles, () => '').scripts[0]?.content;

        expect(content).toBe("local value = 'first'\nprint(value)\nlocal value = 'second'\nerror(value, 2)\n");
        expect(content).not.toContain('function(');
    });

    it('materializes 200 file-level modules as one flat chunk', () => {
        const project = compileProject(
            Array.from({ length: 200 }, (_, index) => ({ path: `src/server/module-${String(index).padStart(3, '0')}.luam`, source: `local value = ${index}\n` })),
        );
        const build = assembleResource(project, { layout: 'bundle' }).build;

        expect(build).not.toBeNull();

        if (build === null) {
            return;
        }

        const content = materializeBundles('demo', build.bundles, () => '').scripts[0]?.content ?? '';

        expect(content.match(/^do$/gm)).toBeNull();
        expect(content.match(/^end$/gm)).toBeNull();
        expect(content.match(/^local value = \d+$/gm)).toHaveLength(200);
        expect(content.startsWith('local value = 0\n')).toBe(true);
        expect(content.endsWith('local value = 199\n')).toBe(true);
    });

    it('rejects top-level returns only in bundle layout', () => {
        const project = compileProject([{ path: 'src/server/main.luam', source: 'print(1)\nreturn\n' }]);

        expect(assembleResource(project, {}).build).not.toBeNull();

        const bundled = assembleResource(project, { layout: 'bundle' });

        expect(bundled.build).toBeNull();
        expect(bundled.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-bundle-toplevel-return']);
        expect(bundled.diagnostics[0]?.diagnostic.position.line).toBe(2);
        expect(bundled.diagnostics[0]?.diagnostic.message).toBe(
            '"src/server/main.luam" contains a top-level return and cannot be included in a bundle. Remove the return or build the tree layout with "--no-bundle" or "output = { bundle = false }" in .luam.manifest.',
        );
    });

    it('rejects conditional chunk returns without inspecting nested function bodies or class methods', () => {
        const conditional = compileProject([{ path: 'src/server/main.luam', source: 'if true then\n    do\n        return\n    end\nend\n' }]);
        const nested = compileProject([
            {
                path: 'src/server/nested.luam',
                source: 'if true then\n    local callback = function() return 1 end\n    function value()\n        return 1\n    end\n    class Value {\n        get = function (): number return 1 end\n    }\nend\n',
            },
        ]);

        const bundled = assembleResource(conditional, { layout: 'bundle' });

        expect(bundled.build).toBeNull();
        expect(bundled.diagnostics[0]?.diagnostic.position.line).toBe(3);
        expect(assembleResource(nested, { layout: 'bundle' }).build).not.toBeNull();
    });

    it('rejects assets and authored outputs that collide with an emitted bundle', () => {
        const project = compileProject([{ path: 'src/server.luam', source: '#!server\nprint(1)\n' }]);
        const asset = { path: 'src/server.lua', source: 'assets/server.lua', isDownloaded: false };
        const result = assembleResource(project, { layout: 'bundle', assets: [asset] });

        expect(result.build).toBeNull();
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual([
            'project-bundle-output-collision',
            'project-bundle-output-collision',
        ]);
        expect(result.diagnostics.map((entry) => entry.diagnostic.message)).toEqual([
            '"assets/server.lua" produces "src/server.lua", which is reserved for the server bundle. Rename the source output or build the tree layout with "--no-bundle".',
            '"src/server.luam" produces "src/server.lua", which is reserved for the server bundle. Rename the source output or build the tree layout with "--no-bundle".',
        ]);
    });
});
