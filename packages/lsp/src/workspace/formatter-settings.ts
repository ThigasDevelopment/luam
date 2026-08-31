import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { DEFAULT_FORMATTER_OPTIONS, resolveFormatterOptions, type FormatterFileSystem, type ResolvedFormatOptions } from '@compiler/format/formatter-discovery';

const NODE_FORMATTER_FILES: FormatterFileSystem = {
    exists: (path: string): boolean => existsSync(path),
    read: (path: string): string => readFileSync(path, 'utf8'),
    join: (directory: string, name: string): string => join(directory, name),
    parent: (directory: string): string => dirname(directory),
};

export function formatterOptionsFor(path: string): ResolvedFormatOptions {
    if (path.length === 0) {
        return DEFAULT_FORMATTER_OPTIONS;
    }

    return resolveFormatterOptions(NODE_FORMATTER_FILES, dirname(path));
}
