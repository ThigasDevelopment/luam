import { count } from '#release/plural';
import { repositoryRoot } from '#release/repository';
import { checkVersionContract } from '#release/version-contract';

const argument = process.argv.slice(2).find((value) => !value.startsWith('-')) ?? process.env['LUAM_RELEASE_TAG'] ?? '';
const tag = argument === '' ? null : argument;

const result = checkVersionContract(repositoryRoot(), tag);

if (result.problems.length > 0) {
    for (const problem of result.problems) {
        process.stderr.write(`${problem.file}: ${problem.message}\n`);
    }

    process.stderr.write(`\nThe version contract failed with ${count(result.problems.length, 'problem', 'problems')}.\n`);
    process.exit(1);
}

const scope = tag === null ? '' : ` for "${tag}"`;

process.stdout.write(`The version contract passed${scope}: every package and changelog names ${result.version}.\n`);
