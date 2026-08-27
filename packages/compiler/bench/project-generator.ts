import type { ProjectFile } from '@compiler/project/module';

export type Topology = 'sparse' | 'dense';

export interface GeneratedProject {
    files: ProjectFile[];
    topology: Topology;
    sharedPath: string;
    clientPath: string;
    rootPath: string;
    leafPath: string;
}

const ROOT_PATH = 'src/shared/core.luam';

const LEAF_PATH = 'src/shared/leaf.luam';

function rootModule(): string {
    return `interface CoreOptions {
    label: string
}

class Core {
    label: string = 'core'

    constructor = function (label: string)
        self.label = label
    end

    describeCore = function (): string
        return self.label
    end
}
`;
}

function leafModule(): string {
    return `class Leaf {
    tag: string = 'leaf'

    describeLeaf = function (): string
        return self.tag
    end
}
`;
}

function sharedModule(index: number, topology: Topology): string {
    const header = topology === 'dense' ? `class Entity${index} extends Core {` : `class Entity${index} {`;
    const parent = topology === 'dense' ? '        super(name)\n' : '';
    const options = topology === 'dense' ? `\nfunction configureEntity${index}(options: CoreOptions): string\n    return options.label\nend\n` : '';

    return `${header}
    id: number = ${index}
    name: string = 'entity-${index}'

    constructor = function (name: string)
${parent}        self.name = name
    end

    describe = function (): string
        return \`entity \${self.name} #\${self.id}\`
    end

    rename = function (name: string): void
        self.name = name
    end
}

function formatEntity${index}(entity: Entity${index}): string
    return entity:describe()
end
${options}`;
}

function serverModule(index: number): string {
    return `#!server

local entity = new Entity${index}('server-${index}')

function handleJoin${index}(player: Player): void
    local label: string = formatEntity${index}(entity)

    outputChatBox(label, root)
end

addEventHandler('onPlayerJoin', root, function()
    handleJoin${index}(source)
end)
`;
}

function clientModule(index: number): string {
    return `#!client

local entity = new Entity${index}('client-${index}')
local caption: string = \`HUD \${entity.name}\`

addEventHandler('onClientRender', root, function()
    dxDrawText(caption, 10, ${index % 500})
end)
`;
}

export function generateProject(moduleCount: number, topology: Topology = 'sparse'): GeneratedProject {
    const files: ProjectFile[] = [
        { path: ROOT_PATH, source: rootModule() },
        { path: LEAF_PATH, source: leafModule() },
    ];

    for (let index = 0; index < moduleCount; index += 1) {
        files.push({ path: `src/shared/entity-${index}.luam`, source: sharedModule(index, topology) });
        files.push({ path: `src/server/handler-${index}.luam`, source: serverModule(index) });
        files.push({ path: `src/client/hud-${index}.luam`, source: clientModule(index) });
    }

    files.sort((left, right) => left.path.localeCompare(right.path));

    return { files, topology, sharedPath: 'src/shared/entity-0.luam', clientPath: 'src/client/hud-0.luam', rootPath: ROOT_PATH, leafPath: LEAF_PATH };
}

function replaceSource(project: GeneratedProject, path: string, replace: (source: string) => string): ProjectFile[] {
    return project.files.map((file) => (file.path === path ? { path: file.path, source: replace(file.source) } : file));
}

export function editBody(project: GeneratedProject, path: string): ProjectFile[] {
    return replaceSource(project, path, (source) => `${source}\nlocal touched: number = 1\n`);
}

export function editDeclaration(project: GeneratedProject, path: string): ProjectFile[] {
    return replaceSource(project, path, (source) => source.replace('id: number', 'level: number = 1\n    id: number'));
}

export function editLeafDeclaration(project: GeneratedProject): ProjectFile[] {
    return replaceSource(project, project.leafPath, (source) => source.replace('tag: string', 'weight: number = 1\n    tag: string'));
}

export function editRootDeclaration(project: GeneratedProject): ProjectFile[] {
    return replaceSource(project, project.rootPath, (source) => source.replace("label: string = 'core'", "rank: number = 1\n    label: string = 'core'"));
}

export function removeFile(project: GeneratedProject, path: string): ProjectFile[] {
    return project.files.filter((file) => file.path !== path);
}
