import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { repositoryRoot } from '#pipeline/workflows.ts';

export interface Rule {
    type: string;
    parameters?: Record<string, unknown>;
}

export interface Ruleset {
    file: string;
    name: string;
    target: string;
    enforcement: string;
    bypass_actors: unknown[];
    conditions: { ref_name: { include: string[]; exclude: string[] } };
    rules: Rule[];
}

export const rulesetDir = join(repositoryRoot, '.github', 'rulesets');

export const readRulesets = (): Ruleset[] =>
    readdirSync(rulesetDir)
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => ({ file, ...(JSON.parse(readFileSync(join(rulesetDir, file), 'utf8')) as Omit<Ruleset, 'file'>) }));

export const ruleOf = (ruleset: Ruleset, type: string): Rule | undefined => ruleset.rules.find((rule) => rule.type === type);

export const requiredChecks = (ruleset: Ruleset): string[] => {
    const rule = ruleOf(ruleset, 'required_status_checks');
    const checks = (rule?.parameters?.['required_status_checks'] ?? []) as { context: string }[];

    return checks.map((check) => check.context);
};
