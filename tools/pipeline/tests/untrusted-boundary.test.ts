import { describe, expect, it } from 'vitest';

import { reachableFrom, readWorkflows } from '#pipeline/workflows.ts';

const workflows = readWorkflows();
const fromPullRequest = reachableFrom(workflows, 'pull_request');

describe('the untrusted contribution boundary', () => {
    it('uses pull_request_target nowhere', () => {
        const offending = workflows.filter((workflow) => workflow.source.includes('pull_request_target')).map((workflow) => workflow.file);

        expect(offending).toEqual([]);
    });

    it('reads no secret from a workflow a fork can reach', () => {
        const referenced = fromPullRequest.flatMap((workflow) =>
            [...workflow.source.matchAll(/secrets\.([A-Za-z_][A-Za-z0-9_]*)/g)]
                .map((match) => match[1] ?? '')
                .filter((secret) => secret !== 'GITHUB_TOKEN')
                .map((secret) => `${workflow.file}:${secret}`),
        );

        expect(referenced).toEqual([]);
    });

    it('grants no write permission to a job a fork can reach', () => {
        const writes = fromPullRequest.flatMap((workflow) =>
            workflow.jobs.flatMap((job) =>
                Object.entries((job.permissions ?? {}) as Record<string, string>)
                    .filter(([, level]) => level === 'write')
                    .map(([scope]) => `${workflow.file}:${job.id}:${scope}`),
            ),
        );

        expect(writes).toEqual([]);
    });

    it('writes no cache under a key of its own on the fork path', () => {
        const explicit = fromPullRequest.filter((workflow) => /uses:\s+actions\/cache/.test(workflow.source)).map((workflow) => workflow.file);

        expect(explicit).toEqual([]);
    });

    it('checks out the default branch in every workflow_run workflow', () => {
        const elevated = workflows.filter((workflow) => workflow.triggers.includes('workflow_run'));

        for (const workflow of elevated) {
            const checkouts = workflow.jobs.flatMap((job) => job.steps.filter((step) => step.uses?.startsWith('actions/checkout')));

            expect(checkouts.length).toBeGreaterThan(0);
            expect(workflow.source).toContain('ref: ${{ github.event.repository.default_branch }}');
            expect(workflow.source).not.toContain('workflow_run.head_branch');
            expect(workflow.source).not.toContain('workflow_run.head_repository');
        }
    });
});
