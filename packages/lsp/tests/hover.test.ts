import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { createWorkspace, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function hoverText(text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const hover = service.hover(SERVER_FILE, positionOf(text, anchor, word));
    const contents = hover?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

describe('hover', () => {
    it('shows the annotated type of a local', () => {
        const text = 'local health: number = 100\nlocal copy = health\n';

        expect(hoverText(text, 'copy', 'health')).toContain('local health: number');
    });

    it('shows the inferred type of an unannotated local', () => {
        const text = 'local name = "thigas"\nlocal copy = name\n';

        expect(hoverText(text, 'copy', 'name')).toContain('local name: string');
    });

    it('shows the signature of a function', () => {
        const text = 'function greet(name: string, tag?: string): string\n    return name\nend\n\ngreet("a")\n';

        expect(hoverText(text, '\ngreet(', 'greet')).toContain('greet(name: string, tag?: string): string');
    });

    it('shows the inferred return type of an unannotated function', () => {
        const text = 'function greet()\n    return "hello"\nend\n\ngreet()\n';

        expect(hoverText(text, '\ngreet(', 'greet')).toContain('greet(): string');
    });

    it('shows the signature of a parameter', () => {
        const text = 'function greet(name: string): string\n    return name\nend\n';

        expect(hoverText(text, 'return', 'name')).toContain('parameter name: string');
    });

    it('shows the declaration of a class', () => {
        const text = 'class Player {\n    name: string\n}\n\nlocal one = new Player()\n';

        expect(hoverText(text, 'new ', 'Player')).toContain('class Player');
    });

    it('shows the parent of a class that extends another', () => {
        const text = 'class Base {\n    health: number = 1\n}\n\nclass Vip extends Base {\n}\n';

        expect(hoverText(text, 'class Vip', 'Vip')).toContain('class Vip extends Base');
    });

    it('shows the inferred constructor return type in a class', () => {
        const text = [
            'class Person {',
            '    constructor = function (age: number)',
            '    end',
            '}',
            'class Thigas extends Person {',
            '    constructor = function ()',
            '        super(1)',
            '    end',
            '}',
        ].join('\n');

        expect(hoverText(text, 'class Thigas', 'Thigas')).toContain('constructor(): void');
    });

    it('explains how super resolves and validates parent calls', () => {
        const text = [
            'class Person {',
            '    constructor = function (age: number)',
            '    end',
            '}',
            'class Thigas extends Person {',
            '    constructor = function ()',
            '        super(1)',
            '    end',
            '}',
        ].join('\n');
        const hover = hoverText(text, '        super', 'super');

        expect(hover).toContain('super(...): ParentReturnType');
        expect(hover).toContain('In a constructor, it invokes the parent-class constructor.');
        expect(hover).toContain('Arguments are checked against the selected parent constructor or method parameters.');
        expect(hover).toContain('the legacy form `self:super(...)` is invalid');
        expect(hover).toContain('check-invalid-super');
    });

    it('shows a class member with its owner', () => {
        const text = 'class Player {\n    name: string\n}\n\nlocal one = new Player()\nlocal value = one.name\n';

        expect(hoverText(text, 'one.', 'name')).toContain('field name: string');
    });

    it('documents the class keyword', () => {
        const text = 'class Player {\n    name: string\n}\n';

        expect(hoverText(text, '', 'class')).toContain('`class` declares a runtime class');
    });

    it('documents extends and implements in a class header', () => {
        const text = 'interface Named {\n    name: string\n}\n\nclass Entity {\n    name: string = \'a\'\n}\n\nclass Player extends Entity implements Named {\n}\n';

        expect(hoverText(text, 'Player ', 'extends')).toContain('`extends` declares inheritance');
        expect(hoverText(text, 'Entity ', 'implements')).toContain('`implements` asks the checker');
    });

    it('documents the new keyword on instantiation', () => {
        const text = 'class Player {\n}\n\nlocal one = new Player()\n';

        expect(hoverText(text, 'one = ', 'new')).toContain('`new` instantiates a class');
    });

    it('documents enum, interface, and continue keywords', () => {
        const text = 'enum State {\n    LOBBY,\n}\n\ninterface Named {\n    name: string\n}\n\nfor index = 1, 3 do\n    continue\nend\n';

        expect(hoverText(text, '', 'enum')).toContain('`enum` declares a fixed set of named numbers');
        expect(hoverText(text, '\n\ninterface', 'interface')).toContain('`interface` declares a compile-only contract');
        expect(hoverText(text, '    ', 'continue')).toContain('`continue` skips to the next iteration');
    });

    it('documents Lua keywords', () => {
        const text = 'local total: number = 0\n\nfor index = 1, 3 do\n    if index > 1 then\n        total += index\n    end\nend\n\nwhile total > 0 do\n    total -= 1\nend\n';

        expect(hoverText(text, '', 'local')).toContain('`local` declares a block-scoped name');
        expect(hoverText(text, '\n\nfor', 'for')).toContain('`for` loops in two forms');
        expect(hoverText(text, '    ', 'if')).toContain('`if` starts a conditional');
        expect(hoverText(text, '\nend\n\n', 'while')).toContain('`while` runs its body');
    });

    it('documents nil and the boolean operators', () => {
        const text = 'local ready: boolean? = nil\n\nlocal label: string = ready and \'yes\' or \'no\'\n';

        expect(hoverText(text, '= ', 'nil')).toContain('`nil` is the absent value');
        expect(hoverText(text, 'ready ', 'and')).toContain('`and` is the boolean conjunction');
        expect(hoverText(text, "'yes' ", 'or')).toContain('`or` is the boolean disjunction');
    });

    it('documents http only as an export modifier', () => {
        const text = 'export http function getCount(): number\n    return 1\nend\n\nlocal http = 1\nprint(http)\n';

        expect(hoverText(text, 'export ', 'http')).toContain('`http` is a contextual modifier');
        expect(hoverText(text, 'print(', 'http')).not.toContain('`http` is a contextual modifier');
    });

    it('does not document a keyword used as a property name', () => {
        const text = 'local settings: table = { export = true }\n\nprint(settings.export)\n';

        expect(hoverText(text, 'settings.', 'export')).not.toContain('`export` marks a top-level function');
    });

    it('shows the inferred type of an unannotated field with an initializer', () => {
        const text = "class Example {\n    lastname = 'Hello, World',\n}\n";

        expect(hoverText(text, '    ', 'lastname')).toContain('field lastname: string');
    });

    it('shows the inferred return type of an unannotated class method', () => {
        const text = 'class Text {\n    name: string\n    describe = function ()\n        return self.name\n    end\n}\nlocal text = new Text()\ntext:describe()\n';

        expect(hoverText(text, 'text:', 'describe')).toContain('describe(): string');
    });

    it('renders an optional field marker on the field name', () => {
        const text = 'class Player {\n    name?: string\n}\n\nlocal one = new Player()\nlocal value = one.name\n';

        expect(hoverText(text, 'one.', 'name')).toContain('field name?: string');
    });

    it('renders an object type with its keys', () => {
        const text = 'function take(args: { name: string, tag?: string }): void\n    print(args)\nend\n';

        expect(hoverText(text, 'print(', 'args')).toContain('parameter args: { name: string, tag?: string }');
    });

    it('explains the exact accessor generated by a decorator', () => {
        const boolean = 'class Player {\n    @Getter\n    admin: boolean\n}\n';
        const alias = 'type Flag = boolean\nclass Player {\n    @Getter\n    admin: Flag\n}\n';

        expect(hoverText(boolean, '@', 'Getter')).toContain('isAdmin(): boolean');
        expect(hoverText(alias, '@', 'Getter')).toContain('isAdmin(): Flag');
    });

    it('documents the placement, the generated api, and the diagnostics of a decorator', () => {
        const hover = hoverText('class Player {\n    @Getter\n    admin: boolean\n}\n', '@', 'Getter');

        expect(hover).toContain('Generates a typed getter for each decorated field.');
        expect(hover).toContain('Valid on a class and on a field. It takes no arguments.');
        expect(hover).toContain('- `getField(): FieldType`, returning the field unchanged.');
        expect(hover).toContain('**Rules**');
        expect(hover).toContain('- `check-decorator-conflict` when a generated name is already declared by a hand-written member.');
    });

    it('shows the companion class a builder decorator declares', () => {
        const hover = hoverText("@Builder\nclass Account {\n    name: string = ''\n    balance: number = 0\n}\n", '@', 'Builder');

        expect(hover).toContain('class AccountBuilder {\n    withName(value: string): AccountBuilder\n    withBalance(value: number): AccountBuilder\n    build(): Account\n}');
        expect(hover).toContain('Generates a companion builder class.');
    });

    it('shows every member a class decorator generates', () => {
        const observable = 'class Session {\n    @Observable\n    connected: boolean = false\n}\n';
        const hover = hoverText(observable, '@', 'Observable');

        expect(hover).toContain('setConnected(value: boolean): void');
        expect(hover).toContain('onConnectedChanged(listener: any): void');
    });

    it('explains a decorator that only validates, on a field and on a method', () => {
        const source = 'class Entity {\n    describe = function (): string\n        return self.name\n    end\n}\n';
        const player = 'class Player extends Entity {\n    @ReadOnly\n    id: number = 1\n\n    @Override\n    describe = function (): string\n        return self.name\n    end\n}\n';
        const text = `${source}${player}`;

        expect(hoverText(text, '@ReadOnly', 'ReadOnly')).toContain('@ReadOnly\nid: number');
        expect(hoverText(text, '@ReadOnly', 'ReadOnly')).toContain('`check-readonly-assignment` on an assignment outside the declaring class.');
        expect(hoverText(text, '@Override', 'Override')).toContain('@Override\ndescribe(): string');
        expect(hoverText(text, '@Override', 'Override')).toContain('Valid on a method. It takes no arguments.');
    });

    it('shows the instance behind self with the shape of its class', () => {
        const text = 'class Round {\n    label: string = \'a\'\n\n    describe = function (): string\n        return self.label\n    end\n}\n';
        const hover = hoverText(text, 'return ', 'self');

        expect(hover).toContain('self: Round');
        expect(hover).toContain('`self` is the receiver of the current class member.');
        expect(hover).toContain('class Round {\n    label: string\n\n    describe(): string\n}');
        expect(hover).toContain('check-explicit-self-parameter');
    });

    it('reports self as unbound outside a class member', () => {
        const hover = hoverText('print(self)\n', 'print(', 'self');

        expect(hover).toContain('check-invalid-self');
        expect(hover).toContain('It is not bound here');
    });

    it('shows generated methods like authored methods', () => {
        const text = 'class Player {\n    @Getter\n    name: string\n}\nlocal player = new Player()\nlocal name = player:getName()\n';

        expect(hoverText(text, 'player:', 'getName')).toContain('getName(): string');
    });

    it('shows an mta api signature with its environment', () => {
        const text = 'kickPlayer(source)\n';
        const hover = hoverText(text, '', 'kickPlayer');

        expect(hover).toContain('function kickPlayer');
        expect(hover).toContain('mta api (server)');
    });

    it('shows a shared mta api with its environment', () => {
        const hover = hoverText('outputChatBox("hello")\n', '', 'outputChatBox');

        expect(hover).toContain('function outputChatBox');
        expect(hover).toContain('mta api (shared)');
    });

    it('shows a class declared in another file with its constructor and origin', () => {
        const service = new LanguageService();
        const shared = pathToUri('/project/src/shared/core.luam');
        const text = "local core: Core = new Core('client')\n";
        const source = ["class Core {", "    side: string = ''", '', '    constructor = function (side: string)', '        self.side = side', '    end', '}', ''];

        service.update(shared, 1, source.join('\n'));
        service.update(SERVER_FILE, 1, text);

        const annotation = service.hover(SERVER_FILE, positionOf(text, ': Core', 'Core'));
        const instantiation = service.hover(SERVER_FILE, positionOf(text, 'new ', 'Core'));
        const contents = annotation?.contents;
        const value = contents !== undefined && typeof contents !== 'string' && !Array.isArray(contents) ? contents.value : '';

        expect(value).toContain('class Core {\n    side: string\n\n    constructor(side: string): void\n}');
        expect(value).toContain('declared in /project/src/shared/core.luam (shared)');
        expect(instantiation).not.toBeNull();
    });

    it('lists the members of a class and of an interface', () => {
        const source = [
            'interface Named {',
            '    name: string',
            '    describe(): string',
            '}',
            '',
            'class Account implements Named {',
            "    name: string = ''",
            '',
            '    describe = function (): string',
            '        return self.name',
            '    end',
            '}',
            '',
            'local account: Account = nil',
            'local named: Named = nil',
            '',
        ].join('\n');

        expect(hoverText(source, 'local account: ', 'Account')).toContain('class Account implements Named {\n    name: string\n\n    describe(): string\n}');
        expect(hoverText(source, 'local named: ', 'Named')).toContain('interface Named {\n    name: string\n\n    describe(): string\n}');
    });

    it('shows an empty body for a class without members', () => {
        const source = 'class Marker {\n}\n\nlocal marker: Marker = nil\n';

        expect(hoverText(source, 'local marker: ', 'Marker')).toContain('class Marker {}');
    });

    it('lists the members of an enum with the value each one carries', () => {
        const source = 'enum MatchState {\n    LOBBY,\n    PLAYING,\n    FINISHED,\n}\n\nlocal state: number = MatchState.LOBBY\n';
        const shape = 'enum MatchState {\n    LOBBY = 0\n    PLAYING = 1\n    FINISHED = 2\n}';

        expect(hoverText(source, 'enum ', 'MatchState')).toContain(shape);
        expect(hoverText(source, 'local state: number = ', 'MatchState')).toContain(shape);
        expect(hoverText(source, 'MatchState.', 'LOBBY')).toContain('MatchState.LOBBY = 0');
    });

    it('shows an empty body for an enum without members', () => {
        const source = 'enum Empty {\n}\n\nlocal value: number = 0\n';

        expect(hoverText(source, 'enum ', 'Empty')).toContain('enum Empty {}');
    });

    it('names the origin relative to the workspace root', () => {
        const root = createWorkspace({
            'src/shared/core.luam': 'class Core {\n}\n',
            'src/server/main.luam': 'local core: Core = new Core()\n',
        });
        const service = new LanguageService();
        const text = 'local core: Core = new Core()\n';

        try {
            service.loadWorkspace([root]);

            const hover = service.hover(uriFor(root, 'src/server/main.luam'), positionOf(text, ': Core', 'Core'));
            const contents = hover?.contents;
            const value = contents !== undefined && typeof contents !== 'string' && !Array.isArray(contents) ? contents.value : '';

            expect(value).toContain('declared in src/shared/core.luam (shared)');
            expect(value).not.toContain(root);
        } finally {
            removeWorkspace(root);
        }
    });

    it('shows the interfaces a class implements', () => {
        const text = 'interface Named {\n    name: string\n}\n\nclass Player implements Named {\n    name: string = \'\'\n}\n\nlocal player: Player = nil\n';

        expect(hoverText(text, 'local player', 'Player')).toContain('class Player implements Named');
    });

    it('does not show a class from an environment the file cannot reference', () => {
        const service = new LanguageService();
        const client = pathToUri('/project/src/client/hud.luam');
        const text = 'local hud: Hud = new Hud()\n';

        service.update(client, 1, 'class Hud {\n    visible: boolean = true\n}\n');
        service.update(SERVER_FILE, 1, text);

        expect(service.hover(SERVER_FILE, positionOf(text, ': Hud', 'Hud'))).toBeNull();
    });

    it('returns nothing for a position without a symbol', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local value = 1\n');

        expect(service.hover(SERVER_FILE, { line: 5, character: 0 })).toBeNull();
    });
});

describe('project environment hover', () => {
    function environmentHover(text: string, anchor: string, word: string): string {
        const root = createWorkspace({ '.env': 'SERVER_NAME="Luam"\nMAX_PLAYERS=32\nDEBUG=false\n' });
        const service = new LanguageService();

        service.loadWorkspace([root]);
        service.update(SERVER_FILE, 1, text);

        const contents = service.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

        removeWorkspace(root);

        if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
            return '';
        }

        return contents.value;
    }

    it('shows the declared keys with their configured values instead of repeating the name', () => {
        const value = environmentHover('local name = env.SERVER_NAME\n', 'local name', 'env');

        expect(value).toContain('env: {');
        expect(value).toContain('    DEBUG: boolean = false');
        expect(value).toContain('    MAX_PLAYERS: number = 32');
        expect(value).toContain("    SERVER_NAME: string = 'Luam'");
        expect(value).not.toContain('env: env');
    });

    it('quotes a value that would break out of its literal', () => {
        const root = createWorkspace({ '.env': 'MOTD="it\'s here"\n' });
        const service = new LanguageService();
        const text = 'local motd = env.MOTD\n';

        service.loadWorkspace([root]);
        service.update(SERVER_FILE, 1, text);

        const contents = service.hover(SERVER_FILE, positionOf(text, 'local motd', 'env'))?.contents;

        removeWorkspace(root);

        expect(contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value).toContain(
            "MOTD: string = 'it\\'s here'",
        );
    });

    it('shows a local interpolated inside a template', () => {
        const text = "local name: string = 'Thigas'\nlocal greeting: string = `Ola ${ name:Guest }`\n";

        expect(hoverText(text, 'greeting', 'name')).toContain('local name: string');
    });

    it('shows the field of a self path interpolated inside a template', () => {
        const text = ['class Round {', "    label: string = 'round'", '', '    describe = function (): string', '        return `Round ${ self.label }`', '    end', '}', ''].join('\n');

        expect(hoverText(text, 'return', 'label')).toContain('field label: string');
    });

    it('walks a deeper interpolated path to the field it ends on', () => {
        const text = [
            'class Owner {',
            '    name: string',
            '}',
            '',
            'class Round {',
            '    owner: Owner',
            '',
            '    describe = function (): string',
            '        return `Round ${ self.owner.name }`',
            '    end',
            '}',
            '',
        ].join('\n');

        expect(hoverText(text, 'return', 'owner')).toContain('field owner: Owner');
        expect(hoverText(text, 'self.owner.', 'name')).toContain('field name: string');
    });

    it('says nothing for a member of an untyped interpolated table', () => {
        const text = 'local slot: table = {}\nlocal caption: string = `Slot ${ slot.label }`\n';

        expect(hoverText(text, 'caption', 'label')).toBe('');
    });

    it('names the file the keys come from and the environment that may read them', () => {
        expect(environmentHover('local name = env.SERVER_NAME\n', 'local name', 'env')).toContain('declared in ".env" (server)');
    });
});
