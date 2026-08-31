import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { FormatterFileSystem } from '@compiler/format/formatter-discovery';

export const NODE_FORMATTER_FILES: FormatterFileSystem = {
    exists: (path: string): boolean => existsSync(path),
    read: (path: string): string => readFileSync(path, 'utf8'),
    join: (directory: string, name: string): string => join(directory, name),
    parent: (directory: string): string => dirname(directory),
};
