import type { ProjectFile } from '@compiler/project/module';

export interface GeneratedProject {
    files: ProjectFile[];
    sharedPath: string;
    clientPath: string;
}

function sharedModule(index: number): string {
    return `class Entity${index} {
    id: number = ${index}
    name: string = 'entity-${index}'

    constructor(name: string) {
        self.name = name
    }

    describe(): string {
        return \`entity \${self.name} #\${self.id}\`
    }

    rename(name: string): void {
        self.name = name
    }
}

function formatEntity${index}(entity: Entity${index}): string {
    return entity:describe()
end
`;
}

function serverModule(index: number): string {
    return `--!server

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
    return `--!client

local entity = new Entity${index}('client-${index}')
local caption: string = \`HUD \${entity.name}\`

addEventHandler('onClientRender', root, function()
    dxDrawText(caption, 10, ${index % 500})
end)
`;
}

export function generateProject(moduleCount: number): GeneratedProject {
    const files: ProjectFile[] = [];

    for (let index = 0; index < moduleCount; index += 1) {
        files.push({ path: `src/shared/entity-${index}.luam`, source: sharedModule(index) });
        files.push({ path: `src/server/handler-${index}.luam`, source: serverModule(index) });
        files.push({ path: `src/client/hud-${index}.luam`, source: clientModule(index) });
    }

    files.sort((left, right) => left.path.localeCompare(right.path));

    return { files, sharedPath: 'src/shared/entity-0.luam', clientPath: 'src/client/hud-0.luam' };
}

export function editBody(project: GeneratedProject, path: string): ProjectFile[] {
    return project.files.map((file) => (file.path === path ? { path: file.path, source: `${file.source}\nlocal touched: number = 1\n` } : file));
}

export function editDeclaration(project: GeneratedProject, path: string): ProjectFile[] {
    return project.files.map((file) => (file.path === path ? { path: file.path, source: file.source.replace('id: number', 'level: number = 1\n    id: number') } : file));
}
