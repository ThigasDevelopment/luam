import { describe, expect, it } from 'vitest';

import { allReportedNames } from '#pipeline/check-names.ts';
import { readRulesets, requiredChecks, ruleOf } from '#pipeline/rulesets.ts';
import { readWorkflows } from '#pipeline/workflows.ts';

const workflows = readWorkflows();
const rulesets = readRulesets();
const reported = allReportedNames(workflows);

const advisory = ['Benchmark', 'Audit', 'Report', 'Label', 'Deploy', 'Package', 'Verify', 'Publish'];

const find = (name: string) => {
    const ruleset = rulesets.find((entry) => entry.name === name);

    expect(ruleset, `the ${name} ruleset is committed`).toBeDefined();

    return ruleset!;
};

describe('the committed rulesets', () => {
    it('protects both permanent branches and the release tags', () => {
        expect(rulesets.map((ruleset) => ruleset.name).sort()).toEqual(['develop', 'main', 'release tags']);
    });

    it('blocks a force-push and a deletion everywhere', () => {
        for (const ruleset of rulesets) {
            expect(ruleOf(ruleset, 'deletion'), `${ruleset.name} blocks deletion`).toBeDefined();
            expect(ruleOf(ruleset, 'non_fast_forward'), `${ruleset.name} blocks a force-push`).toBeDefined();
        }
    });

    it('leaves no bypass actor anywhere', () => {
        for (const ruleset of rulesets) {
            expect(ruleset.bypass_actors, `${ruleset.name} grants no bypass`).toEqual([]);
        }
    });

    it('enforces every ruleset rather than leaving it in evaluation', () => {
        for (const ruleset of rulesets) {
            expect(ruleset.enforcement).toBe('active');
        }
    });

    it('requires a pull request into main with no approval it cannot get', () => {
        const rule = ruleOf(find('main'), 'pull_request');

        expect(rule).toBeDefined();
        expect(rule?.parameters?.['required_approving_review_count']).toBe(0);
    });

    it('requires only checks a job actually reports', () => {
        const missing = requiredChecks(find('main')).filter((check) => !reported.includes(check));

        expect(missing).toEqual([]);
    });

    it('requires no advisory job', () => {
        const required = requiredChecks(find('main'));
        const offending = required.filter((check) => advisory.some((job) => check.endsWith(`/ ${job}`) || check === job));

        expect(offending).toEqual([]);
    });

    it('requires only checks a pull request from a fork can satisfy', () => {
        const gate = workflows.find((workflow) => workflow.file === 'ci.yml');

        expect(gate?.triggers).toContain('pull_request');

        const fromGate = new Set(allReportedNames([...workflows].filter((workflow) => workflow.file === 'ci.yml' || workflow.file.startsWith('unit-'))));
        const outside = requiredChecks(find('main')).filter((check) => !fromGate.has(check));

        expect(outside).toEqual([]);
    });

    it('protects the release tags against a move', () => {
        const tags = find('release tags');

        expect(tags.target).toBe('tag');
        expect(tags.conditions.ref_name.include).toEqual(['refs/tags/v*']);
    });
});
