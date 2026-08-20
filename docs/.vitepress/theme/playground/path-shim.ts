function normalize(value: string): string {
    return value.split('\\').join('/');
}

export function dirname(value: string): string {
    const path = normalize(value);
    const cut = path.lastIndexOf('/');

    if (cut < 0) {
        return '.';
    }

    return cut === 0 ? '/' : path.slice(0, cut);
}

export function basename(value: string, suffix?: string): string {
    const path = normalize(value);
    const name = path.slice(path.lastIndexOf('/') + 1);

    return suffix !== undefined && name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

export function extname(value: string): string {
    const name = basename(value);
    const cut = name.lastIndexOf('.');

    return cut <= 0 ? '' : name.slice(cut);
}

export function join(...parts: string[]): string {
    const joined = parts.filter((part) => part !== '').join('/');

    return normalize(joined).replace(/\/{2,}/g, '/');
}

export function resolve(...parts: string[]): string {
    const joined = join(...parts);

    return joined.startsWith('/') ? joined : `/${joined}`;
}

export function relative(from: string, to: string): string {
    const base = normalize(from).replace(/\/$/, '');
    const target = normalize(to);

    return target.startsWith(`${base}/`) ? target.slice(base.length + 1) : target;
}

export function isAbsolute(value: string): boolean {
    return normalize(value).startsWith('/') || /^[A-Za-z]:/.test(value);
}

export const sep = '/';

export default { dirname, basename, extname, join, resolve, relative, isAbsolute, sep };
