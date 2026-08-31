import { scanSource } from '#conventions/source-scan';

export interface Violation {
    rule: string;
    path: string;
    line: number;
    column: number;
    message: string;
}

export interface SourceFile {
    path: string;
    source: string;
}

const KEBAB_NAME = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)*\.tsx?$/;

const PARENT_IMPORT = /^\s*(?:import|export)\b[^\n]*?from\s+'(\.\.\/[^']*)'/;

const ALIASED_TREE = /^packages\/[a-z0-9-]+\/src\//;

export function checkFileName(path: string): Violation[] {
    const name = path.slice(path.lastIndexOf('/') + 1);

    if (KEBAB_NAME.test(name)) {
        return [];
    }

    return [{ rule: 'kebab-case', path, line: 1, column: 1, message: `"${name}" is not kebab-case. Rename it to lower-case words joined by hyphens.` }];
}

export function checkTypeScriptOnly(path: string): Violation[] {
    if (!/\.(js|jsx|mjs|cjs)$/.test(path)) {
        return [];
    }

    return [{ rule: 'typescript-only', path, line: 1, column: 1, message: `"${path}" is JavaScript. Every source file in this workspace is ".ts" or ".tsx".` }];
}

export function checkIndentation(file: SourceFile): Violation[] {
    const violations: Violation[] = [];

    file.source.split('\n').forEach((line, index) => {
        if (line.startsWith('\t')) {
            violations.push({ rule: 'indentation', path: file.path, line: index + 1, column: 1, message: 'The line is indented with a tab. Indent with four spaces.' });
        }
    });

    return violations;
}

export function checkComments(file: SourceFile): Violation[] {
    return scanSource(file.source).comments.map((comment) => ({
        rule: 'no-comments',
        path: file.path,
        line: comment.line,
        column: comment.column,
        message: `A ${comment.kind} comment. Code in this workspace carries no comments; say it in a name instead.`,
    }));
}

export function checkQuotes(file: SourceFile): Violation[] {
    return scanSource(file.source)
        .strings.filter((entry) => entry.quote === '"' && !entry.text.includes("'"))
        .map((entry) => ({
            rule: 'single-quotes',
            path: file.path,
            line: entry.line,
            column: entry.column,
            message: 'A double-quoted string that holds no single quote. Use single quotes.',
        }));
}

export function checkParentImports(file: SourceFile): Violation[] {
    if (!ALIASED_TREE.test(file.path)) {
        return [];
    }

    const violations: Violation[] = [];

    file.source.split('\n').forEach((line, index) => {
        const found = PARENT_IMPORT.exec(line);

        if (found !== null) {
            violations.push({
                rule: 'path-aliases',
                path: file.path,
                line: index + 1,
                column: line.indexOf('..') + 1,
                message: `"${found[1] ?? ''}" leaves the directory. Import through the package's path alias.`,
            });
        }
    });

    return violations;
}

export function checkFile(file: SourceFile): Violation[] {
    return [
        ...checkFileName(file.path),
        ...checkTypeScriptOnly(file.path),
        ...checkIndentation(file),
        ...checkComments(file),
        ...checkQuotes(file),
        ...checkParentImports(file),
    ];
}

export function formatViolation(violation: Violation): string {
    return `${violation.path}:${violation.line}:${violation.column} ${violation.rule}: ${violation.message}`;
}
