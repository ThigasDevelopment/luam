import { createInterface } from 'node:readline/promises';

export interface InitProjectDetails {
    name: string;
    version: string;
    description: string | null;
    author: string | null;
}

export type InitPrompt = (defaults: InitProjectDetails, nameLocked: boolean) => Promise<InitProjectDetails>;

async function question(prompt: ReturnType<typeof createInterface>, label: string, fallback: string): Promise<string> {
    const answer = (await prompt.question(`${label}${fallback === '' ? '' : ` (${fallback})`}: `)).trim();

    return answer === '' ? fallback : answer;
}

export async function promptForProject(defaults: InitProjectDetails, nameLocked: boolean): Promise<InitProjectDetails> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return defaults;
    }

    const prompt = createInterface({ input: process.stdin, output: process.stdout });

    try {
        const name = nameLocked ? defaults.name : await question(prompt, 'Project name', defaults.name);
        const version = await question(prompt, 'Version', defaults.version);
        const description = await question(prompt, 'Description', defaults.description ?? '');
        const author = await question(prompt, 'Author', defaults.author ?? '');

        return { name, version, description: description || null, author: author || null };
    } finally {
        prompt.close();
    }
}
