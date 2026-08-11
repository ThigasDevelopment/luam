import type { DevelopmentLogRecord } from '@cli/logging/log-record';
import { resolveResourcePosition, type ResourceMap } from '@compiler/project/resource';

export interface GeneratedPosition {
    file: string;
    line: number;
}

const RESOURCE_BRACKET = /\[[A-Za-z0-9._-]+[\/:]([^\]]+?):(\d+)\]/;

const RESOURCE_PREFIX = /\[[A-Za-z0-9._-]+\][\/:]([^\s:]+):(\d+)/;

const STRING_POSITION = /\[string "([^"]+)"\]:(\d+)/;

const FILE_POSITION = /([^\s\[\]]+):(\d+)(?::|\b)/g;

function position(file: string | undefined, line: string | undefined): GeneratedPosition | null {
    const value = Number(line);

    return file === undefined || !Number.isSafeInteger(value) || value < 1 ? null : { file: file.replace(/\\/g, '/'), line: value };
}

export function parseTracePosition(value: string): GeneratedPosition | null {
    const bracket = RESOURCE_BRACKET.exec(value) ?? RESOURCE_PREFIX.exec(value) ?? STRING_POSITION.exec(value);

    if (bracket !== null) {
        return position(bracket[1], bracket[2]);
    }

    let found: RegExpExecArray | null = null;

    for (const match of value.matchAll(FILE_POSITION)) {
        found = match;
    }

    return found === null ? null : position(found[1], found[2]);
}

export function resolveDevelopmentLogPosition(record: DevelopmentLogRecord, map: ResourceMap | null): DevelopmentLogRecord {
    if (record.source === undefined || map === null) {
        return record;
    }

    const resolution = resolveResourcePosition(map, record.source.path, record.source.line);

    if (resolution.status !== 'resolved') {
        return record;
    }

    const source = { path: resolution.position.file, line: resolution.position.line };

    return {
        ...record,
        source: resolution.position.symbol === undefined ? source : { ...source, symbol: resolution.position.symbol },
    };
}
