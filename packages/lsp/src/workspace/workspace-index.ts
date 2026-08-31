import { dirname } from 'node:path';

import { mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { TEST_DECLARATIONS } from '@compiler/checker/test-declarations';
import { canReference, type Environment } from '@compiler/environment/environment';
import { fingerprintDeclarations } from '@compiler/project/fingerprint';
import { isTestPath } from '@compiler/project/source-kind';

import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { declaredNames, dependentsOf } from './analysis-graph';
import { pathKey, pathToUri, relativeToRoots, uriToPath } from './document-uri';
import { forgetEnvironments, isEnvironmentPath, loadProjectDeclarations, loadProjectEnvironment } from './project-environment';
import { EMPTY_LIBRARY_INDEX, loadLibraries, type LibraryIndex } from './library-index';
import { DEFAULT_PROJECT_SETTINGS, settingsFrom, settingsKey, type ProjectSettings } from './project-settings';
import { scanSources, type ScannedFile } from './source-scanner';

export interface RescanResult {
    updated: DocumentAnalysis[];
    removed: string[];
}

export class WorkspaceIndex {
    private readonly analyses = new Map<string, DocumentAnalysis>();

    private roots: readonly string[] = [];

    private project: ProjectDeclarations = EMPTY_PROJECT_DECLARATIONS;

    private env: Readonly<Record<string, string>> = {};

    private settings: ProjectSettings = DEFAULT_PROJECT_SETTINGS;

    private libraries: LibraryIndex = EMPTY_LIBRARY_INDEX;

    private key = '';

    private ambientFor(uri: string, environment: Environment, isLibrary: boolean): AmbientDeclarations {
        const others = this.others(uri).filter((analysis) => canReference(environment, analysis.environment) && !isTestPath(analysis.relative));
        const visible = isLibrary ? others.filter((analysis) => this.libraries.isLibraryPath(analysis.path)) : others;

        return mergeAmbient(visible.map((analysis) => analysis.own));
    }

    private run(uri: string, version: number, text: string): DocumentAnalysis {
        const path = uriToPath(uri);
        const library = this.libraries.fileFor(path);
        const relative = library === null ? relativeToRoots(path, this.roots) : library.relative;
        const analysis = analyzeDocument({
            uri,
            path,
            relative,
            version,
            text,
            project: isTestPath(relative) ? { globals: [...this.project.globals, ...TEST_DECLARATIONS] } : this.project,
            env: this.env,
            compilerOptions: this.settings.compilerOptions,
            environment: library === null ? this.settings.resolver.side(relative) : library.environment,
            environmentLocked: library !== null,
            ambient: (environment) => this.ambientFor(uri, environment, library !== null),
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
        this.libraries = this.loadLibraryIndex();
        this.loadEnvironment();

        return true;
    }

    private loadLibraryIndex(): LibraryIndex {
        const manifest = this.manifest();

        if (manifest === null || this.settings.libraries.length === 0) {
            return EMPTY_LIBRARY_INDEX;
        }

        return loadLibraries(dirname(manifest.path), this.settings.libraries);
    }

    private scanAll(): ScannedFile[] {
        const own = scanSources(this.roots);
        const libraries = scanSources(this.libraries.roots).filter((file) => this.libraries.isLibraryPath(file.path));

        return [...own, ...libraries];
    }

    private rerunOthers(uri: string): DocumentAnalysis[] {
        return this.others(uri).map((other) => this.run(other.uri, other.version, other.text));
    }

    private rerunDependents(names: ReadonlySet<string>, excluded: ReadonlySet<string>): DocumentAnalysis[] {
        const dependents = dependentsOf(this.all(), names);

        return this.all()
            .filter((analysis) => analysis.manifest === null && !excluded.has(pathKey(analysis.path)) && dependents.has(pathKey(analysis.path)))
            .map((analysis) => this.run(analysis.uri, analysis.version, analysis.text));
    }

    private visibleTo(analysis: DocumentAnalysis | null): string {
        return analysis === null || analysis.manifest !== null ? '' : `${analysis.environment}|${fingerprintDeclarations(analysis.own)}`;
    }

    analyze(uri: string, version: number, text: string): DocumentAnalysis[] {
        const previous = this.get(uri);
        const before = this.visibleTo(previous);
        const declared = declaredNames(previous);
        const analysis = this.run(uri, version, text);

        if (analysis.manifest !== null) {
            return this.applySettings() ? [analysis, ...this.rerunOthers(uri)] : [analysis];
        }

        if (before === this.visibleTo(analysis)) {
            return [analysis];
        }

        const names = new Set([...declared, ...declaredNames(analysis)]);

        return [analysis, ...this.rerunDependents(names, new Set([pathKey(analysis.path)]))];
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

    reload(): RescanResult {
        const known = this.all().map((analysis) => analysis.uri);

        this.analyses.clear();
        this.key = '';
        this.load(this.roots);

        return { updated: this.all(), removed: known.filter((uri) => this.get(uri) === null) };
    }

    rescan(): RescanResult {
        if (this.applySettings()) {
            return { updated: this.refresh(), removed: [] };
        }

        const scanned = this.scanAll();
        const present = new Set(scanned.map((file) => pathKey(file.path)));
        const names = new Set<string>();
        const removed: string[] = [];
        const touched = new Set<string>();
        const updated: DocumentAnalysis[] = [];

        for (const analysis of this.all()) {
            if (present.has(pathKey(analysis.path))) {
                continue;
            }

            for (const name of declaredNames(analysis)) {
                names.add(name);
            }

            this.analyses.delete(pathKey(analysis.path));
            removed.push(analysis.uri);
        }

        for (const file of scanned) {
            if (this.analyses.has(pathKey(file.path))) {
                continue;
            }

            const analysis = this.run(pathToUri(file.path), 0, file.text);

            for (const name of declaredNames(analysis)) {
                names.add(name);
            }

            touched.add(pathKey(analysis.path));
            updated.push(analysis);
        }

        return { updated: [...updated, ...this.rerunDependents(names, touched)], removed };
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

        for (const file of this.scanAll()) {
            if (this.analyses.has(pathKey(file.path))) {
                continue;
            }

            loaded.push(this.run(pathToUri(file.path), 0, file.text));
        }

        this.applySettings();

        for (const file of this.scanAll()) {
            if (!this.analyses.has(pathKey(file.path))) {
                loaded.push(this.run(pathToUri(file.path), 0, file.text));
            }
        }

        for (const analysis of loaded) {
            this.run(analysis.uri, analysis.version, analysis.text);
        }
    }
}
