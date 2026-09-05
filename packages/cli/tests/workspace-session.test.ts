import { afterEach, describe, expect, it } from 'vitest';

import { SESSION_VERBS } from '@cli/session/session-commands';

import { openSessionDriver, type SessionDriver } from './support/session-driver';

const drivers: SessionDriver[] = [];

function open(shape: Parameters<typeof openSessionDriver>[0] = {}): SessionDriver {
    const driver = openSessionDriver(shape);

    drivers.push(driver);

    return driver;
}

const BROKEN = 'function broken(value: string): number\n    return value\nend\n';

afterEach(() => {
    for (const driver of drivers.splice(0)) {
        driver.close();
    }
});

describe('a session that has just opened', () => {
    it('attaches nothing, compiles nothing and says what is here', () => {
        const driver = open();

        driver.session.reportOpening();

        expect(driver.session.attached.size).toBe(0);
        expect(driver.logger.text()).toContain('Watching nothing yet');
        expect(driver.logger.text()).toContain('"resource-a", "resource-b"');
        expect(driver.fixture.exists('server/mods/deathmatch/resources')).toBe(false);
        expect(driver.console).toEqual([]);
    });
});

describe('ensure', () => {
    it('builds, syncs, refreshes and starts the resource by name', async () => {
        const driver = open();

        await driver.type('ensure resource-a');

        expect(driver.deployed('resource-a')).toBe(true);
        expect(driver.console).toEqual(['refresh', 'start resource-a']);
        expect(driver.logger.text()).toContain('Attached "resource-a"');
        expect(driver.logger.text()).toContain('Started "resource-a"');
    });

    it('attaches a second resource without disturbing the first', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');

        expect(driver.deployed('resource-a')).toBe(true);
        expect(driver.deployed('resource-b')).toBe(true);
        expect(driver.console).toEqual(['refresh', 'start resource-a', 'refresh', 'start resource-b']);
        expect([...driver.session.attached]).toEqual(['resource-a', 'resource-b']);
    });

    it('rebuilds instead of attaching twice', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-a');

        expect([...driver.session.attached]).toEqual(['resource-a']);
        expect(driver.logger.text()).toContain('already attached');
    });

    it('starts on the first successful cycle even when a failing build came first', async () => {
        const driver = open();

        driver.fixture.write('resource-a/src/server/main.luam', BROKEN);
        await driver.type('ensure resource-a');

        expect(driver.console).toEqual([]);

        driver.fixture.write('resource-a/src/server/main.luam', "outputChatBox('fixed', root)\n");
        await driver.type('rebuild resource-a');

        expect(driver.console).toEqual(['refresh', 'start resource-a']);
    });

    it('syncs nothing, writes nothing and stays attached when the build fails', async () => {
        const driver = open();

        driver.fixture.write('resource-a/src/server/main.luam', BROKEN);
        await driver.type('ensure resource-a');

        expect(driver.deployed('resource-a')).toBe(false);
        expect(driver.console).toEqual([]);
        expect([...driver.session.attached]).toEqual(['resource-a']);
    });

    it('restarts rather than starts on a later sync that changed a file', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        driver.fixture.write('resource-a/src/client/hud.luam', "local title: string = 'Changed'\n\ndxDrawText(title, 10, 10)\n");
        await driver.type('rebuild resource-a');

        expect(driver.console).toEqual(['refresh', 'start resource-a', 'refresh', 'stop resource-a', 'start resource-a']);
    });

    it('starts a resource that is already synced and changed nothing', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('drop resource-a');
        driver.console.splice(0);
        await driver.type('ensure resource-a');

        expect(driver.console).toEqual(['refresh', 'start resource-a']);
    });

    it('writes nothing to the console when a rebuild changes no output', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        driver.console.splice(0);
        await driver.type('rebuild resource-a');

        expect(driver.console).toEqual([]);
    });

    it('names the workspace root and lists the resources for an unknown name', async () => {
        const driver = open();

        await driver.type('ensure nope');

        expect(driver.logger.errors.join('\n')).toContain(driver.workspace.root);
        expect(driver.logger.errors.join('\n')).toContain('"resource-a", "resource-b"');
        expect(driver.session.attached.size).toBe(0);
    });

    it('lists the resources when it is given no name', async () => {
        const driver = open();

        await driver.type('ensure');

        expect(driver.logger.errors.join('\n')).toContain('takes one resource name');
    });
});

describe('a resource whose directory and manifest names differ', () => {
    it('starts the name it deployed under, not the directory name', async () => {
        const driver = open();

        driver.fixture.write(
            'resource-a/.luam.manifest',
            "name = 'deployed-name'\noutput = {\n    bundle = false,\n    map = true,\n}\n",
        );
        await driver.type('ensure resource-a');

        expect(driver.deployed('deployed-name')).toBe(true);
        expect(driver.deployed('resource-a')).toBe(false);
        expect(driver.console).toEqual(['refresh', 'start deployed-name']);
        expect(driver.logger.text()).toContain('which deploys as "deployed-name"');
    });

    it('restarts under the deployed name and attributes its log records to it', async () => {
        const driver = open();

        driver.fixture.write(
            'resource-a/.luam.manifest',
            "name = 'deployed-name'\noutput = {\n    bundle = false,\n    map = true,\n}\n",
        );
        await driver.type('ensure resource-a');
        driver.fixture.write('resource-a/src/client/hud.luam', "dxDrawText('changed', 1, 1)\n");
        driver.console.splice(0);
        await driver.type('rebuild resource-a');

        expect(driver.console).toEqual(['refresh', 'stop deployed-name', 'start deployed-name']);
        expect([...driver.session.attached]).toEqual(['resource-a']);
        expect([...driver.session.deployed]).toEqual(['deployed-name']);
    });
});

describe('drop', () => {
    it('stops watching and says the deployed resource was left alone', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');
        driver.console.splice(0);
        await driver.type('drop resource-a');

        expect([...driver.session.attached]).toEqual(['resource-b']);
        expect(driver.console).toEqual([]);
        expect(driver.logger.text()).toContain('left alone');
    });

    it('reports an unattached name against what is attached', async () => {
        const driver = open();

        await driver.type('drop resource-a');

        expect(driver.logger.errors.join('\n')).toContain('is not attached');
    });

    it('lists the attached resources when it is given no name', async () => {
        const driver = open();

        await driver.type('drop');

        expect(driver.logger.errors.join('\n')).toContain('takes one attached resource name');
    });
});

describe('rebuild', () => {
    it('cycles every attached resource in attachment order', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');
        driver.fixture.write('resource-a/src/client/hud.luam', "dxDrawText('a', 1, 1)\n");
        driver.fixture.write('resource-b/src/client/hud.luam', "dxDrawText('b', 1, 1)\n");
        driver.console.splice(0);
        await driver.type('rebuild');

        expect(driver.console).toEqual(['refresh', 'stop resource-a', 'start resource-a', 'refresh', 'stop resource-b', 'start resource-b']);
    });

    it('cycles one named resource', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');
        driver.fixture.write('resource-b/src/client/hud.luam', "dxDrawText('b', 1, 1)\n");
        driver.console.splice(0);
        await driver.type('rebuild resource-b');

        expect(driver.console).toEqual(['refresh', 'stop resource-b', 'start resource-b']);
    });

    it('suggests attaching a known but unattached resource', async () => {
        const driver = open();

        await driver.type('rebuild resource-a');

        expect(driver.logger.errors.join('\n')).toContain('Type "ensure resource-a" to attach it');
    });

    it('says the session is empty when nothing is attached', async () => {
        const driver = open();

        await driver.type('rebuild');

        expect(driver.logger.text()).toContain('Watching nothing yet');
    });
});

describe('list and help', () => {
    it('reports each attached resource with its outcome and age', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');
        driver.logger.lines.splice(0);
        await driver.type('list');

        const text = driver.logger.text();

        expect(text).toContain('resource-a: built');
        expect(text).toContain('resource-b: built');
        expect(text).toContain('ago.');
    });

    it('reports a failed build in the list', async () => {
        const driver = open();

        driver.fixture.write('resource-a/src/server/main.luam', BROKEN);
        await driver.type('ensure resource-a');
        driver.logger.lines.splice(0);
        await driver.type('list');

        expect(driver.logger.text()).toContain('resource-a: failed');
    });

    it('reports the empty case in the same words the session opens with', async () => {
        const driver = open();

        driver.session.reportOpening();

        const opening = driver.logger.lines[0];

        driver.logger.lines.splice(0);
        await driver.type('list');

        expect(driver.logger.lines[0]).toBe(opening);
    });

    it('names exactly the five verbs and the leading-space escape', async () => {
        const driver = open();

        await driver.type('help');

        const text = driver.logger.text();

        expect(SESSION_VERBS).toEqual(['ensure', 'drop', 'rebuild', 'list', 'help']);

        for (const verb of SESSION_VERBS) {
            expect(text).toContain(verb);
        }

        expect(text).toContain('Begin a line with a space');
    });

    it('reports a usage line rather than guessing at the wrong arity', async () => {
        const driver = open();

        await driver.type('list resource-a');
        await driver.type('ensure resource-a resource-b');

        expect(driver.logger.errors.join('\n')).toContain('Usage: list');
        expect(driver.logger.errors.join('\n')).toContain('Usage: ensure <resource>');
    });
});

async function waitUntil(predicate: () => boolean, what: string): Promise<void> {
    const deadline = Date.now() + 3000;

    while (!predicate()) {
        if (Date.now() >= deadline) {
            throw new Error(`Timed out waiting for ${what}.`);
        }

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 10));
    }
}

describe('the watch a session hangs a resource on', () => {
    it('rebuilds, syncs and restarts on save', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        driver.console.splice(0);
        driver.fixture.write('resource-a/src/client/hud.luam', "dxDrawText('saved', 1, 1)\n");

        await waitUntil(() => driver.console.length >= 3, 'the save to restart the resource');

        expect(driver.console).toEqual(['refresh', 'stop resource-a', 'start resource-a']);
        expect(driver.fixture.read('server/mods/deathmatch/resources/resource-a/src/client/hud.lua')).toContain('saved');
    });

    it('rebuilds only the resource that changed and never interleaves the reports', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-b');
        driver.console.splice(0);
        driver.fixture.write('resource-b/src/client/hud.luam', "dxDrawText('only b', 1, 1)\n");

        await waitUntil(() => driver.console.length >= 3, 'the save to restart resource-b');
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));

        expect(driver.console).toEqual(['refresh', 'stop resource-b', 'start resource-b']);
    });

    it('stops rebuilding a dropped resource', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('drop resource-a');
        driver.console.splice(0);
        driver.fixture.write('resource-a/src/client/hud.luam', "dxDrawText('ignored', 1, 1)\n");

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 400));

        expect(driver.console).toEqual([]);
    });

    it('produces one rebuild for one save after ensure was typed twice', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        await driver.type('ensure resource-a');
        driver.console.splice(0);
        driver.fixture.write('resource-a/src/client/hud.luam', "dxDrawText('once', 1, 1)\n");

        await waitUntil(() => driver.console.length >= 3, 'the save to restart the resource');
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

        expect(driver.console).toEqual(['refresh', 'stop resource-a', 'start resource-a']);
    });

    it('leaves the running resource in place when a save breaks the build', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        driver.console.splice(0);
        driver.fixture.write('resource-a/src/server/main.luam', BROKEN);

        await waitUntil(() => driver.logger.text().includes('Skipping sync and restart'), 'the failing rebuild');

        expect(driver.console).toEqual([]);
        expect([...driver.session.attached]).toEqual(['resource-a']);
    });
});

describe('a resource that disappears while attached', () => {
    it('is reported, dropped, and leaves the session running', async () => {
        const driver = open();

        await driver.type('ensure resource-a');
        driver.fixture.remove('resource-a');
        await driver.type('rebuild resource-a');

        expect(driver.logger.errors.join('\n')).toContain('no longer exists');
        expect(driver.session.attached.size).toBe(0);

        await driver.type('ensure resource-b');

        expect(driver.deployed('resource-b')).toBe(true);
    });
});
