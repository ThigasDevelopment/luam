import { releaseNotes } from '#release/release-notes';
import { repositoryRoot } from '#release/repository';

process.stdout.write(`${releaseNotes(repositoryRoot())}\n`);
