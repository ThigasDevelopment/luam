import { describe, expect, it } from 'vitest';

import { allReportedNames } from '#pipeline/check-names.ts';
import { actionReferences, isLocalReference, isPinnedToCommit, readCompositeActions, readWorkflows } from '#pipeline/workflows.ts';

const workflows = readWorkflows();
const actions = readCompositeActions();

describe('the permission budget', () => {
    it('declares permissions on every job', () => {
        const undeclared = workflows.flatMap((workflow) => workflow.jobs.filter((job) => job.permissions === undefined).map((job) => `${workflow.file}:${job.id}`));

        expect(undeclared).toEqual([]);
    });

    it('grants no job more than the contract allows', () => {
        const budget: Record<string, string[]> = {
            'catalog-refresh.yml': ['contents:write', 'pull-requests:write'],
            'dependency-audit.yml': ['contents:read', 'issues:write'],
            'docs.yml': ['contents:read', 'pages:write', 'id-token:write'],
            'release.yml': ['contents:read', 'contents:write', 'id-token:write'],
            'triage.yml': ['contents:read', 'issues:write', 'pull-requests:write'],
        };

        const granted = workflows.flatMap((workflow) =>
            workflow.jobs.flatMap((job) =>
                Object.entries((job.permissions ?? {}) as Record<string, string>)
                    .filter(([, level]) => level === 'write')
                    .map(([scope, level]) => ({ file: workflow.file, job: job.id, scope: `${scope}:${level}` })),
            ),
        );

        const outside = granted.filter((entry) => !(budget[entry.file] ?? []).includes(entry.scope));

        expect(outside).toEqual([]);
    });
});

describe('the supply chain', () => {
    it('pins every third-party action to a commit', () => {
        const references = [
            ...workflows.flatMap((workflow) => workflow.jobs.flatMap((job) => actionReferences(job.steps).map((reference) => ({ where: workflow.file, reference })))),
            ...actions.flatMap((action) => actionReferences(action.steps).map((reference) => ({ where: action.path, reference }))),
        ];

        const floating = references.filter((entry) => !isLocalReference(entry.reference) && !isPinnedToCommit(entry.reference));

        expect(floating).toEqual([]);
    });

    it('names the version beside every pin', () => {
        const sources = [...workflows.map((workflow) => workflow.source), ...actions.map((action) => action.source)];
        const unnamed = sources.flatMap((source) => source.split('\n').filter((line) => /uses:\s+[^.\s]+\/[^@\s]+@[0-9a-f]{40}\s*$/.test(line)));

        expect(unnamed).toEqual([]);
    });
});

const shared = ['pnpm --filter @luam/cli bundle', 'pnpm audit --audit-level moderate --prod --json > "$RUNNER_TEMP/audit.json" || true', 'pnpm audit --audit-level moderate || true'];

describe('one definition per verification', () => {
    it('defines each verification command in exactly one workflow', () => {
        const commands = new Map<string, string[]>();

        for (const workflow of workflows) {
            for (const job of workflow.jobs) {
                for (const step of job.steps) {
                    if (!step.run) {
                        continue;
                    }

                    for (const line of step.run.split('\n').map((entry) => entry.trim())) {
                        if (!line.startsWith('pnpm ') || shared.includes(line)) {
                            continue;
                        }

                        commands.set(line, [...new Set([...(commands.get(line) ?? []), workflow.file])]);
                    }
                }
            }
        }

        const duplicated = [...commands.entries()].filter(([, files]) => files.length > 1).map(([command, files]) => `${command} in ${files.join(', ')}`);

        expect(duplicated).toEqual([]);
    });
});

describe('the reported check names', () => {
    it('composes a caller job with the job of the workflow it calls', () => {
        expect(allReportedNames(workflows)).toEqual(expect.arrayContaining(['typecheck / Typecheck', 'test / Test on Node 22', 'test / Test on Node 24', 'build / Build', 'docs / Docs']));
    });
});
