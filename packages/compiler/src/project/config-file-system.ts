export interface ConfigFileSystem {
    exists(path: string): boolean;
    read(path: string): string;
    join(directory: string, name: string): string;
    parent(directory: string): string;
}

const LIBRARY_DIRECTORY = 'node_modules';

export function insideLibrary(directory: string): boolean {
    return directory.split(/[\\/]/).includes(LIBRARY_DIRECTORY);
}

export function findConfigFile(files: ConfigFileSystem, start: string, name: string): string | null {
    let directory = start;

    for (;;) {
        if (insideLibrary(directory)) {
            return null;
        }

        const candidate = files.join(directory, name);

        if (files.exists(candidate)) {
            return candidate;
        }

        const parent = files.parent(directory);

        if (parent === directory) {
            return null;
        }

        directory = parent;
    }
}
