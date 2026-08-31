import { manifestSource, MANIFEST_FILE } from './project-fixture';

export const COLLECTIONS = '@luam-fixture/collections';

export const ASYNC = 'mta-async-fixture';

export const LIST_SOURCE = [
    'class FixtureList {',
    '    total: number = 0',
    '',
    '    add = function (amount: number): void',
    '        self.total += amount',
    '    end',
    '',
    '    describe = function (): string',
    '        return `total ${self.total}`',
    '    end',
    '}',
    '',
    'function describeList(list: FixtureList): string',
    '    return list:describe()',
    'end',
    '',
].join('\n');

export const HUD_SOURCE = ['function fixtureHudLabel(): string', "    return 'hud'", 'end', ''].join('\n');

export const LEGACY_LUA = ['function fixtureLegacy()', "    return 'legacy'", 'end', ''].join('\n');

export const LEGACY_DECLARATION = 'declare fixtureLegacy: fun(): string\n';

export const ASYNC_SOURCE = ['function fixtureDelay(seconds: number): number', '    return seconds', 'end', ''].join('\n');

export const CONSUMER_SHARED = [
    'class BigList extends FixtureList {',
    "    label: string = 'big'",
    '}',
    '',
    'function report(): string',
    '    local list = new BigList()',
    '',
    '    list:add(2)',
    '',
    '    return describeList(list)',
    'end',
    '',
].join('\n');

export const CONSUMER_CLIENT = ['local label: string = fixtureHudLabel()', '', 'dxDrawText(label, 10, 10)', ''].join('\n');

export function packageFiles(name: string, luam: unknown, files: Readonly<Record<string, string>>): Record<string, string> {
    const manifest = JSON.stringify({ name, version: '1.0.0', luam }, null, 4);
    const entries: Record<string, string> = { [`node_modules/${name}/package.json`]: `${manifest}\n` };

    for (const [path, contents] of Object.entries(files)) {
        entries[`node_modules/${name}/${path}`] = contents;
    }

    return entries;
}

export function collectionsPackage(luam: unknown = null, files: Readonly<Record<string, string>> = {}): Record<string, string> {
    const declaration = luam ?? { sources: { shared: ['src/**/*.luam', 'src/**/*.lua'], client: ['client/**/*.luam'] }, requires: [ASYNC] };

    return packageFiles(COLLECTIONS, declaration, {
        'src/list.luam': LIST_SOURCE,
        'src/legacy.lua': LEGACY_LUA,
        'src/legacy.d.luam': LEGACY_DECLARATION,
        'client/hud.luam': HUD_SOURCE,
        ...files,
    });
}

export function asyncPackage(files: Readonly<Record<string, string>> = {}): Record<string, string> {
    return packageFiles(ASYNC, { sources: { shared: ['src/**/*.luam'] } }, { 'src/async.luam': ASYNC_SOURCE, ...files });
}

export function consumerFiles(libraries: readonly string[], overrides: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    return {
        [MANIFEST_FILE]: manifestSource({ name: 'luam-demo', libraries: [...libraries], output: { bundle: false, map: false }, ...overrides }),
        'src/shared/main.luam': CONSUMER_SHARED,
        'src/client/hud.luam': CONSUMER_CLIENT,
    };
}

export function libraryProject(libraries: readonly string[] = [COLLECTIONS, ASYNC], overrides: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    return { ...consumerFiles(libraries, overrides), ...collectionsPackage(), ...asyncPackage() };
}
