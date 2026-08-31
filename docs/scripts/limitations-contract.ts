import type { LocaleId } from '../.vitepress/structure.ts';

export type LimitationLabel = 'planned' | 'design-boundary' | 'upstream-constraint' | 'platform-constraint';

export interface Limitation {
    id: string;
    label: LimitationLabel;
    owners: string[];
    decision: string | null;
}

export interface StaleClaim {
    id: string;
    pattern: RegExp;
    correction: string;
}

export const LIMITATIONS_PAGE = 'reference/limitations.md';

export const LIMITATIONS: readonly Limitation[] = [
    { id: 'path-narrowing-aliasing', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/025-access-path-narrowing.md' },
    { id: 'flow-narrowing', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/031-flow-narrowing.md' },
    { id: 'undeclared-method-call', label: 'design-boundary', owners: [], decision: '.claude/plans/32.01-method-call-checking.md' },
    { id: 'class-runtime-visibility', label: 'platform-constraint', owners: [], decision: '.claude/docs/adr/024-two-phase-class-declaration.md' },
    { id: 'class-members', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/035-safe-class-metamethods.md' },
    { id: 'catalog-lag', label: 'upstream-constraint', owners: [], decision: '.github/workflows/catalog-refresh.yml' },
    { id: 'unverified-exports', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/033-resource-export-abi.md' },
    { id: 'opaque-configuration', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/022-opaque-native-configuration.md' },
    { id: 'source-faithful-output', label: 'design-boundary', owners: [], decision: 'docs/en/reference/output-layouts.md' },
    { id: 'erased-annotations', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/021-erased-type-annotations.md' },
    { id: 'file-environment', label: 'platform-constraint', owners: [], decision: '.claude/docs/adr/023-file-level-environments.md' },
    { id: 'development-log-scope', label: 'design-boundary', owners: [], decision: '.claude/plans/24.12-remote-development-bridge.md' },
    { id: 'no-debugger', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/039-no-debugger.md' },
    { id: 'error-is-not-a-terminator', label: 'design-boundary', owners: [], decision: '.claude/plans/37.01-missing-return.md' },
    { id: 'return-position-inference', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/032-erased-generic-classes.md' },
    { id: 'no-transitive-libraries', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/038-library-distribution.md' },
    { id: 'library-collisions-reported', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/038-library-distribution.md' },
    { id: 'library-assets', label: 'design-boundary', owners: [], decision: '.claude/plans/38.04-library-vendoring.md' },
    { id: 'formatter-whitespace-only', label: 'design-boundary', owners: [], decision: '.claude/docs/adr/042-formatter-configuration-file.md' },
];

export const LABEL_TEXT: Readonly<Record<LocaleId, Readonly<Record<LimitationLabel, string>>>> = {
    en: {
        planned: 'Planned',
        'design-boundary': 'Design boundary',
        'upstream-constraint': 'Upstream constraint',
        'platform-constraint': 'Platform constraint',
    },
    'pt-br': {
        planned: 'Planejado',
        'design-boundary': 'Decisão de projeto',
        'upstream-constraint': 'Restrição da fonte',
        'platform-constraint': 'Restrição da plataforma',
    },
};

export const CLAIM_ROOTS: readonly string[] = ['README.md', 'docs/en', 'docs/pt-br', 'examples'];

export const CLAIM_EXCLUDED: readonly string[] = ['docs/en/changelog.md', 'docs/pt-br/changelog.md'];

export const STALE_CLAIMS: readonly StaleClaim[] = [
    {
        id: 'absent-narrowing',
        pattern: /\b(does no (type )?narrowing|no type narrowing|não faz estreitamento)\b/i,
        correction: 'A guard narrows a name. Say that fields are what keep their declared type.',
    },
    {
        id: 'absent-static-members',
        pattern: /\b(no static (fields or )?(members|methods)|has no static|não tem campos nem métodos estáticos|sem membros estáticos)\b/i,
        correction: 'A class declares statics with the static modifier. Say what the class value holds instead.',
    },
    {
        id: 'absent-cross-file-recheck',
        pattern: /\b(does not re-?check an (already )?open file|não reverifica um arquivo já aberto)\b/i,
        correction: 'The server re-analyzes other files when a declaration changes. Describe the granularity instead.',
    },
    {
        id: 'restart-to-rescan',
        pattern: /\b(to force a rescan|para forçar uma nova varredura)\b/i,
        correction: 'The workspace scan and the file watchers already find unopened files. Restarting is a last resort, not the way in.',
    },
    {
        id: 'environment-wide-recheck',
        pattern: /(every file that can see it is re-?analyzed|todo arquivo que enxerga aquela declaração)/i,
        correction: 'A declaration change re-checks the files that reach it. Describe the reverse closure instead.',
    },
    {
        id: 'unscanned-files-invisible',
        pattern: /\b(invisible until it is saved or opened|invisível até ser salvo ou aberto)\b/i,
        correction: 'The server scans the workspace on start and watches the source, manifest and environment patterns.',
    },
];

export function labelOf(locale: LocaleId, label: LimitationLabel): string {
    return LABEL_TEXT[locale][label];
}
