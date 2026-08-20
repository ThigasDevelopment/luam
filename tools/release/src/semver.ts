export interface Version {
    major: number;
    minor: number;
    patch: number;
}

export const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseVersion(value: string): Version | null {
    const found = VERSION_PATTERN.exec(value);

    if (found === null) {
        return null;
    }

    return { major: Number(found[1] ?? '0'), minor: Number(found[2] ?? '0'), patch: Number(found[3] ?? '0') };
}

export function compareVersions(left: Version, right: Version): number {
    if (left.major !== right.major) {
        return left.major - right.major;
    }

    if (left.minor !== right.minor) {
        return left.minor - right.minor;
    }

    return left.patch - right.patch;
}

export function compareVersionStrings(left: string, right: string): number {
    const parsedLeft = parseVersion(left);
    const parsedRight = parseVersion(right);

    if (parsedLeft === null || parsedRight === null) {
        return left.localeCompare(right);
    }

    return compareVersions(parsedLeft, parsedRight);
}

export function isReleaseDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }

    const parsed = new Date(`${value}T00:00:00Z`);

    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}
