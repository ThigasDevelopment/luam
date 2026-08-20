import { type PlaygroundEnvironment } from './protocol';

export interface StartingDocument {
    environment: PlaygroundEnvironment;
    oop: boolean;
    source: string;
}

export const DEFAULT_DOCUMENT: StartingDocument = {
    environment: 'shared',
    oop: false,
    source: `local welcome: string = 'Welcome to the server'

function greet(player: Player): void
    local name: string = getPlayerName(player)

    outputChatBox(\`\${welcome}, \${name}\`, player)
end
`,
};
