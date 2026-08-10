import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { Position } from 'vscode-languageserver';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

export interface OpenDocument {
    uri: string;
    text: string;
}

export function markerAt(text: string, marker: string): Position {
    const found = text.indexOf(marker);

    if (found === -1) {
        throw new Error(`The marker "${marker}" was not found in the fixture.`);
    }

    const offset = found + marker.length;
    const before = text.slice(0, offset);
    const lastBreak = before.lastIndexOf('\n');

    return { line: before.split('\n').length - 1, character: offset - lastBreak - 1 };
}

export function positionOf(text: string, marker: string, word: string): Position {
    const anchor = text.indexOf(marker);
    const offset = text.indexOf(word, anchor === -1 ? 0 : anchor);

    if (offset === -1) {
        throw new Error(`The word "${word}" was not found in the fixture.`);
    }

    const before = text.slice(0, offset);
    const lastBreak = before.lastIndexOf('\n');

    return { line: before.split('\n').length - 1, character: offset - lastBreak - 1 };
}

export function createWorkspace(files: Readonly<Record<string, string>>): string {
    const root = mkdtempSync(join(tmpdir(), 'luam-lsp-'));

    for (const [relative, contents] of Object.entries(files)) {
        const absolute = join(root, relative);

        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, contents, 'utf8');
    }

    return root;
}

export function removeWorkspace(root: string): void {
    rmSync(root, { recursive: true, force: true });
}

export function uriFor(root: string, relative: string): string {
    return pathToUri(join(root, relative));
}

export function openService(files: Readonly<Record<string, string>>, root: string | null = null): LanguageService {
    const service = new LanguageService();

    for (const [path, text] of Object.entries(files)) {
        service.update(root === null ? pathToUri(path) : uriFor(root, path), 1, text);
    }

    return service;
}
