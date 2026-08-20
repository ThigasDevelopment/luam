import { lintObsolete } from '#release/obsolete-lint';
import { count } from '#release/plural';
import { repositoryRoot } from '#release/repository';

const result = lintObsolete(repositoryRoot());

for (const finding of result.findings) {
    process.stderr.write(`${finding.file}:${finding.line}: "${finding.match}" was removed. Use ${finding.replacement}.\n`);
    process.stderr.write(`  ${finding.note}\n`);
}

for (const exemption of result.unusedExemptions) {
    process.stderr.write(`${exemption.file}: the "${exemption.rule}" exemption no longer matches any line. Drop it from tools/release/src/obsolete-rules.ts.\n`);
}

const problems = result.findings.length + result.unusedExemptions.length;

if (problems > 0) {
    process.stderr.write(`\nObsolete content check failed with ${count(problems, 'problem', 'problems')} across ${count(result.scanned, 'file', 'files')}.\n`);
    process.stderr.write('A removed form is only allowed under a "## X.Y.Z - YYYY-MM-DD" release heading no newer than the version that removed it.\n');
    process.exit(1);
}

process.stdout.write(`Obsolete content check passed: ${result.scanned} files carry no removed form outside their release history.\n`);
