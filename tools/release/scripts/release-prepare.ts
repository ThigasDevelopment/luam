import { count } from '#release/plural';
import { applyRelease, planRelease, today } from '#release/release-preparation';
import { repositoryRoot } from '#release/repository';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const dateIndex = argv.indexOf('--date');
const date = dateIndex === -1 ? today() : (argv[dateIndex + 1] ?? '');
const version = argv.find((value) => !value.startsWith('-') && value !== date) ?? '';

if (version === '') {
    process.stderr.write('Usage: pnpm release:prepare <version> [--date YYYY-MM-DD] [--dry-run]\n');
    process.exit(2);
}

const root = repositoryRoot();
const plan = planRelease(root, version, date);

if (plan.problems.length > 0) {
    for (const problem of plan.problems) {
        process.stderr.write(`${problem}\n`);
    }

    process.stderr.write(`\nNothing was written. Release preparation for ${version} failed with ${count(plan.problems.length, 'problem', 'problems')}.\n`);
    process.exit(1);
}

if (dryRun) {
    process.stdout.write(`Release ${version} - ${date} would change ${count(plan.changes.length, 'file', 'files')}:\n`);

    for (const change of plan.changes) {
        process.stdout.write(`  ${change.path}\n`);
    }

    process.exit(0);
}

const written = applyRelease(root, plan);

process.stdout.write(`Prepared ${version} - ${date} in ${count(written.length, 'file', 'files')}:\n`);

for (const path of written) {
    process.stdout.write(`  ${path}\n`);
}

process.stdout.write('\nReview both locales, then run "pnpm docs:verify" and "pnpm -r test".\n');
process.stdout.write('Nothing was committed, tagged, or pushed.\n');
