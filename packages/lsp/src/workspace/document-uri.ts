const FILE_SCHEME = 'file://';

const DRIVE_PATTERN = /^\/?[A-Za-z]:/;

export function normalizeFsPath(path: string): string {
    const forward = path.replace(/\\/g, '/');

    if (!DRIVE_PATTERN.test(forward)) {
        return forward;
    }

    const trimmed = forward.startsWith('/') ? forward.slice(1) : forward;

    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

export function uriToPath(uri: string): string {
    if (!uri.startsWith(FILE_SCHEME)) {
        return normalizeFsPath(uri);
    }

    const authorityEnd = uri.indexOf('/', FILE_SCHEME.length);
    const raw = authorityEnd === -1 ? '' : uri.slice(authorityEnd);

    return normalizeFsPath(decodeURIComponent(raw));
}

export function pathToUri(path: string): string {
    const normalized = normalizeFsPath(path);
    const encoded = normalized
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

    return `${FILE_SCHEME}/${encoded.startsWith('/') ? encoded.slice(1) : encoded}`;
}

export function pathKey(path: string): string {
    return normalizeFsPath(path).toLowerCase();
}

export function relativeToRoots(path: string, roots: readonly string[]): string {
    const normalized = normalizeFsPath(path);
    const key = pathKey(normalized);
    let longest = '';

    for (const root of roots) {
        const rootKey = pathKey(root).replace(/\/$/, '');

        if (key.startsWith(`${rootKey}/`) && rootKey.length > longest.length) {
            longest = rootKey;
        }
    }

    return longest === '' ? normalized : normalized.slice(longest.length + 1);
}
