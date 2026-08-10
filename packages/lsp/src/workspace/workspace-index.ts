import { ambientFromRegistry, mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { canReference, type Environment } from '@compiler/environment/environment';

import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { pathKey, pathToUri, uriToPath } from './document-uri';
import { loadProjectDeclarations } from './project-environment';
import { DEFAULT_PROJECT_SETTINGS, loadProjectSettings, type ProjectSettings } from './project-settings';
import { scanSources } from './source-scanner';

export class WorkspaceIndex {
    private readonly analyses = new Map<string, DocumentAnalysis>();

    private project: ProjectDeclarations = EMPTY_PROJECT_DECLARATIONS;

    private settings: ProjectSettings = DEFAULT_PROJECT_SETTINGS;

    private ambientFor(uri: string, environment: Environment): AmbientDeclarations {
        const visible = this.others(uri).filter((analysis) => canReference(environment, analysis.environment));

        return mergeAmbient(visible.map((analysis) => ambientFromRegistry(analysis.declarations)));
    }

    analyze(uri: string, version: number, text: string): DocumentAnalysis {
        const path = uriToPath(uri);
        const analysis = analyzeDocument({
            uri,
            path,
            version,
            text,
            project: this.project,
            oop: this.settings.oop,
            ambient: (environment) => this.ambientFor(uri, environment),
        });

        this.analyses.set(pathKey(path), analysis);

        return analysis;
    }

    remove(uri: string): void {
        this.analyses.delete(pathKey(uriToPath(uri)));
    }

    refresh(): DocumentAnalysis[] {
        for (const analysis of this.all()) {
            this.analyze(analysis.uri, analysis.version, analysis.text);
        }

        return this.all();
    }

    get(uri: string): DocumentAnalysis | null {
        return this.analyses.get(pathKey(uriToPath(uri))) ?? null;
    }

    all(): DocumentAnalysis[] {
        return [...this.analyses.values()];
    }

    others(uri: string): DocumentAnalysis[] {
        const key = pathKey(uriToPath(uri));

        return this.all().filter((analysis) => pathKey(analysis.path) !== key);
    }

    load(roots: readonly string[]): void {
        this.project = loadProjectDeclarations(roots);
        this.settings = loadProjectSettings(roots);

        const loaded: DocumentAnalysis[] = [];

        for (const file of scanSources(roots)) {
            if (this.analyses.has(pathKey(file.path))) {
                continue;
            }

            loaded.push(this.analyze(pathToUri(file.path), 0, file.text));
        }

        for (const analysis of loaded) {
            this.analyze(analysis.uri, analysis.version, analysis.text);
        }
    }
}
