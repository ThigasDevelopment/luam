import { createInterface } from 'node:readline/promises';

export type InstallationPrompt = (editorName: string) => Promise<boolean | null>;

export async function promptForInstallation(editorName: string): Promise<boolean | null> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return null;
    }

    const prompt = createInterface({ input: process.stdin, output: process.stdout });

    try {
        const answer = (await prompt.question(`Install the Luam extension in ${editorName}? [Y/n] `)).trim().toLowerCase();

        return answer === '' || answer === 'y' || answer === 'yes';
    } finally {
        prompt.close();
    }
}
