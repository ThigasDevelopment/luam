import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

export type Permission = string;

export interface Step {
    uses?: string | undefined;
    run?: string | undefined;
    name?: string | undefined;
}

export interface Job {
    id: string;
    name?: string | undefined;
    uses?: string | undefined;
    permissions?: Record<string, Permission> | string | undefined;
    steps: Step[];
    matrix?: Record<string, unknown> | undefined;
    with?: Record<string, unknown> | undefined;
}

export interface Workflow {
    file: string;
    path: string;
    name: string;
    triggers: string[];
    jobs: Job[];
    callInputs: Record<string, { default?: unknown }>;
    source: string;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));

export const repositoryRoot = resolve(scriptDir, '..', '..', '..');
export const workflowDir = join(repositoryRoot, '.github', 'workflows');
export const actionDir = join(repositoryRoot, '.github', 'actions');

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {});

const triggerNames = (on: unknown): string[] => {
    if (typeof on === 'string') {
        return [on];
    }

    if (Array.isArray(on)) {
        return on.map(String);
    }

    return Object.keys(asRecord(on));
};

const readJobs = (jobs: Record<string, unknown>): Job[] =>
    Object.entries(jobs).map(([id, value]) => {
        const job = asRecord(value);
        const strategy = asRecord(job['strategy']);
        const steps = Array.isArray(job['steps']) ? (job['steps'] as Step[]) : [];

        return {
            id,
            name: typeof job['name'] === 'string' ? job['name'] : undefined,
            uses: typeof job['uses'] === 'string' ? job['uses'] : undefined,
            permissions: job['permissions'] as Job['permissions'],
            steps,
            matrix: strategy['matrix'] ? asRecord(strategy['matrix']) : undefined,
            with: job['with'] ? asRecord(job['with']) : undefined,
        } satisfies Job;
    });

export const readWorkflows = (): Workflow[] =>
    readdirSync(workflowDir)
        .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
        .sort()
        .map((file) => {
            const path = join(workflowDir, file);
            const source = readFileSync(path, 'utf8');
            const document = asRecord(parse(source));
            const call = asRecord(asRecord(document['on'])['workflow_call']);

            return {
                file,
                path,
                name: typeof document['name'] === 'string' ? document['name'] : file,
                triggers: triggerNames(document['on']),
                jobs: readJobs(asRecord(document['jobs'])),
                callInputs: asRecord(call['inputs']) as Workflow['callInputs'],
                source,
            } satisfies Workflow;
        });

export const readCompositeActions = (): { path: string; source: string; steps: Step[] }[] =>
    readdirSync(actionDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
            const path = join(actionDir, entry.name, 'action.yml');
            const source = readFileSync(path, 'utf8');
            const document = asRecord(parse(source));
            const runs = asRecord(document['runs']);

            return { path, source, steps: Array.isArray(runs['steps']) ? (runs['steps'] as Step[]) : [] };
        });

export const actionReferences = (steps: Step[]): string[] => steps.map((step) => step.uses).filter((use): use is string => typeof use === 'string');

export const isLocalReference = (reference: string): boolean => reference.startsWith('./');

export const isPinnedToCommit = (reference: string): boolean => /@[0-9a-f]{40}$/.test(reference);

export const calledWorkflow = (workflows: Workflow[], reference: string): Workflow | undefined => {
    const file = reference.replace('./.github/workflows/', '');

    return workflows.find((workflow) => workflow.file === file);
};

export const reachableFrom = (workflows: Workflow[], trigger: string): Workflow[] => {
    const reached = new Map<string, Workflow>();
    const queue = workflows.filter((workflow) => workflow.triggers.includes(trigger));

    while (queue.length > 0) {
        const workflow = queue.shift();

        if (!workflow || reached.has(workflow.file)) {
            continue;
        }

        reached.set(workflow.file, workflow);

        for (const job of workflow.jobs) {
            const called = job.uses ? calledWorkflow(workflows, job.uses) : undefined;

            if (called) {
                queue.push(called);
            }
        }
    }

    return [...reached.values()];
};
