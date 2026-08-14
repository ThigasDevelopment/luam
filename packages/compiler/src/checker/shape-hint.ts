import { isAssignable, isLiteralType, typeToString, type RecordType, type Type } from './types';

function matchesDiscriminants(source: RecordType, candidate: RecordType): boolean {
    for (const [name, member] of candidate.members) {
        const written = source.members.get(name);

        if (!isLiteralType(member) || written === undefined) {
            continue;
        }

        if (!isAssignable(written, member)) {
            return false;
        }
    }

    return true;
}

function chooseCandidate(source: RecordType, candidates: readonly RecordType[]): RecordType | null {
    const [only] = candidates;

    if (candidates.length === 1 && only !== undefined) {
        return only;
    }

    const matching = candidates.filter((candidate) => matchesDiscriminants(source, candidate));
    const [best] = matching;

    return matching.length === 1 && best !== undefined ? best : null;
}

function missingKeys(source: RecordType, target: RecordType): string[] {
    const missing: string[] = [];

    for (const [name, member] of target.members) {
        if (member.kind !== 'optional' && !source.members.has(name)) {
            missing.push(`"${name}"`);
        }
    }

    return missing;
}

export function missingKeyHint(source: Type, target: Type): string {
    if (source.kind !== 'record' || source.isLiteral !== true) {
        return '';
    }

    const options = target.kind === 'union' ? target.options : [target];
    const candidates = options.filter((option): option is RecordType => option.kind === 'record');
    const candidate = chooseCandidate(source, candidates);

    if (candidate === null) {
        return '';
    }

    const missing = missingKeys(source, candidate);

    if (missing.length === 0) {
        return '';
    }

    const label = missing.length === 1 ? `Key ${missing[0]} is` : `Keys ${missing.join(', ')} are`;

    return ` ${label} missing from "${typeToString(candidate)}".`;
}
