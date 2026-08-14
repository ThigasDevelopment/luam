import { mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { canReference, type Environment } from '@compiler/environment/environment';

import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { pathKey, pathToUri, relativeToRoots, uriToPath } from './document-uri';
import { loadProjectDeclarations, loadProjectEnvironment } from './project-environment';
import { DEFAULT_PROJECT_SETTINGS, settingsFrom, type ProjectSettings } from './project-settings';
import { scanSources } from './source-scanner';

export class WorkspaceIndex {
    private readonly analyses = new Map<string, DocumentAnalysis>();

    private roots: readonly string[] = [];

    private project: ProjectDeclarations = EMPTY_PROJECT_DECLARATIONS;

    private env: Readonly<Record<string, string>> = {};

    private settings: ProjectSettings = DEFAULT_PROJECT_SETTINGS;

    private ambientFor(uri: string, environment: Environment): AmbientDeclarations {
        const visible = this.others(uri).filter((analysis) => canReference(environment, analysis.environment));

        return mergeAmbient(visible.map((analysis) => analysis.own));
    }

    private run(uri: string, version: number, text: string): DocumentAnalysis {
        const path = uriToPath(uri);
        const analysis = analyzeDocument({
            uri,
            path,
            relative: relativeToRoots(path, this.roots),
            version,
            text,
            project: this.project,
            env: this.env,
            oop: this.settings.oop,
            ambient: (environment) => this.ambientFor(uri, environment),
        });

        this.analyses.set(pathKey(path), analysis);

        return analysis;
    }

    private manifest(): DocumentAnalysis | null {
        return this.all().find((analysis) => analysis.manifest !== null) ?? null;
    }

    private applySettings(): boolean {
        const settings = settingsFrom(this.manifest()?.manifest ?? null);

        if (settings.oop === this.settings.oop) {
            return false;
        }

        this.settings = settings;

        return true;
    }

    analyze(uri: string, version: number, text: string): DocumentAnalysis {
        const analysis = this.run(uri, version, text);

        if (analysis.manifest === null || !this.applySettings()) {
            return analysis;
        }

        for (const other of this.all().filter((entry) => entry.manifest === null)) {
            this.run(other.uri, other.version, other.text);
        }

        return analysis;
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
        this.project = loadProjectDeclarations(this.roots);
        this.env = loadProjectEnvironment(this.roots);

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
        this.roots = roots;
        this.project = loadProjectDeclarations(roots);
        this.env = loadProjectEnvironment(roots);

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
