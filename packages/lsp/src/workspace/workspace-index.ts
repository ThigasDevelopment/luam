import { dirname } from 'node:path';

import { mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { canReference, type Environment } from '@compiler/environment/environment';
import { fingerprintDeclarations } from '@compiler/project/fingerprint';

import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { pathKey, pathToUri, relativeToRoots, uriToPath } from './document-uri';
import { forgetEnvironments, isEnvironmentPath, loadProjectDeclarations, loadProjectEnvironment } from './project-environment';
import { DEFAULT_PROJECT_SETTINGS, settingsFrom, settingsKey, type ProjectSettings } from './project-settings';
import { scanSources } from './source-scanner';

export class WorkspaceIndex {
    private readonly analyses = new Map<string, DocumentAnalysis>();

    private roots: readonly string[] = [];

    private project: ProjectDeclarations = EMPTY_PROJECT_DECLARATIONS;

    private env: Readonly<Record<string, string>> = {};

    private settings: ProjectSettings = DEFAULT_PROJECT_SETTINGS;

    private key = '';

    private ambientFor(uri: string, environment: Environment): AmbientDeclarations {
        const visible = this.others(uri).filter((analysis) => canReference(environment, analysis.environment));

        return mergeAmbient(visible.map((analysis) => analysis.own));
    }

    private run(uri: string, version: number, text: string): DocumentAnalysis {
        const path = uriToPath(uri);
        const relative = relativeToRoots(path, this.roots);
        const analysis = analyzeDocument({
            uri,
            path,
            relative,
            version,
            text,
            project: this.project,
            env: this.env,
            compilerOptions: this.settings.compilerOptions,
            environment: this.settings.resolver.side(relative),
            ambient: (environment) => this.ambientFor(uri, environment),
        });

        this.analyses.set(pathKey(path), analysis);

        return analysis;
    }

    private manifest(): DocumentAnalysis | null {
        return this.all().find((analysis) => analysis.manifest !== null) ?? null;
    }

    private environmentRoots(): string[] {
        const manifest = this.manifest();

        return manifest === null ? [...this.roots] : [dirname(manifest.path), ...this.roots];
    }

    private loadEnvironment(): void {
        const roots = this.environmentRoots();

        this.project = loadProjectDeclarations(roots, this.settings.environment);
        this.env = loadProjectEnvironment(roots, this.settings.environment);
    }

    private applySettings(): boolean {
        const settings = settingsFrom(this.manifest()?.manifest ?? null);
        const key = `${settingsKey(settings)}|${this.environmentRoots().join(',')}`;

        if (key === this.key) {
            return false;
        }

        this.settings = settings;
        this.key = key;
        this.loadEnvironment();

        return true;
    }

    private rerunOthers(uri: string): DocumentAnalysis[] {
        return this.others(uri).map((other) => this.run(other.uri, other.version, other.text));
    }

    private visibleTo(analysis: DocumentAnalysis | null): string {
        return analysis === null || analysis.manifest !== null ? '' : `${analysis.environment}|${fingerprintDeclarations(analysis.own)}`;
    }

    analyze(uri: string, version: number, text: string): DocumentAnalysis[] {
        const before = this.visibleTo(this.get(uri));
        const analysis = this.run(uri, version, text);

        if (analysis.manifest !== null) {
            return this.applySettings() ? [analysis, ...this.rerunOthers(uri)] : [analysis];
        }

        return before === this.visibleTo(analysis) ? [analysis] : [analysis, ...this.rerunOthers(uri)];
    }

    isEnvironmentFile(path: string): boolean {
        return isEnvironmentPath(path, this.settings.environment);
    }

    remove(uri: string): void {
        this.analyses.delete(pathKey(uriToPath(uri)));
    }

    refresh(): DocumentAnalysis[] {
        this.applySettings();

        for (const analysis of this.all()) {
            this.run(analysis.uri, analysis.version, analysis.text);
        }

        return this.all();
    }

    reloadSettings(): DocumentAnalysis[] {
        forgetEnvironments();
        this.loadEnvironment();

        return this.refresh();
    }

    get(uri: string): DocumentAnalysis | null {
        return this.analyses.get(pathKey(uriToPath(uri))) ?? null;
    }

    all(): DocumentAnalysis[] {
        return [...this.analyses.values()];
    }

    others(uri: string): DocumentAnalysis[] {
        const key = pathKey(uriToPath(uri));

        return this.all().filter((analysis) => pathKey(analysis.path) !== key && analysis.manifest === null);
    }

    load(roots: readonly string[]): void {
        forgetEnvironments();
        this.roots = roots;
        this.key = '';

        const loaded: DocumentAnalysis[] = [];

        for (const file of scanSources(roots)) {
            if (this.analyses.has(pathKey(file.path))) {
                continue;
            }

            loaded.push(this.run(pathToUri(file.path), 0, file.text));
        }

        this.applySettings();

        for (const analysis of loaded) {
            this.run(analysis.uri, analysis.version, analysis.text);
        }
    }
}
