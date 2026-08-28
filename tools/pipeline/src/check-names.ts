import type { Job, Workflow } from '#pipeline/workflows.ts';
import { calledWorkflow } from '#pipeline/workflows.ts';

const matrixExpression = /^\$\{\{\s*fromJSON\(inputs\.([a-z0-9-]+)\)\s*\}\}$/;

const displayName = (job: Job): string => job.name ?? job.id;

const matrixValues = (workflow: Workflow, job: Job, provided: Record<string, unknown>): Record<string, string[]> => {
    const values: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(job.matrix ?? {})) {
        if (Array.isArray(value)) {
            values[key] = value.map(String);

            continue;
        }

        if (typeof value !== 'string') {
            continue;
        }

        const match = matrixExpression.exec(value);

        if (!match) {
            continue;
        }

        const input = match[1] ?? '';
        const raw = provided[input] ?? workflow.callInputs[input]?.default;

        values[key] = typeof raw === 'string' ? (JSON.parse(raw) as unknown[]).map(String) : [];
    }

    return values;
};

const expand = (template: string, values: Record<string, string[]>): string[] => {
    let names = [template];

    for (const [key, options] of Object.entries(values)) {
        const token = new RegExp(`\\$\\{\\{\\s*matrix\\.${key}\\s*\\}\\}`, 'g');

        names = names.flatMap((name) => (token.test(name) ? options.map((option) => name.replace(token, option)) : [name]));
    }

    return names;
};

export const reportedNames = (workflows: Workflow[], workflow: Workflow): string[] =>
    workflow.jobs.flatMap((job) => {
        const called = job.uses ? calledWorkflow(workflows, job.uses) : undefined;

        if (!called) {
            return [displayName(job)];
        }

        return called.jobs.flatMap((inner) => expand(displayName(inner), matrixValues(called, inner, job.with ?? {})).map((name) => `${displayName(job)} / ${name}`));
    });

export const allReportedNames = (workflows: Workflow[]): string[] => workflows.flatMap((workflow) => reportedNames(workflows, workflow));
