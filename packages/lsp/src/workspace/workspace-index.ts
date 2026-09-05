import { dirname } from 'node:path';

import { mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { TEST_DECLARATIONS } from '@compiler/checker/test-declarations';
import { canReference, type Environment } from '@compiler/environment/environment';
import { fingerprintDeclarations } from '@compiler/project/fingerprint';
import { isTestPath } from '@compiler/project/source-kind';

import { analyzeDocument, type DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { declaredNames, dependentsOf } from './analysis-graph';
import { normalizeFsPath, pathKey, pathToUri, relativeToRoots, uriToPath } from './document-uri';
import { forgetEnvironments, isEnvironmentPath } from './project-environment';
import {
    createDefaultProjectScope,
    createProjectScope,
    DEFAULT_PROJECT_KEY,
    projectKeyOf,
    scopeOwning,
    scopeSignature,
    type ProjectScope,
} from './project-scope';
import { settingsFrom } from './project-settings';
import { scanSources, type ScannedFile } from './source-scanner';

export interface RescanResult {
    updated: DocumentAnalysis[];
    removed: string[];
}

export class WorkspaceIndex {
    private readonly analyses = new Map<string, DocumentAnalysis>();

    private readonly lastOwners = new Map<string, string>();

    private scopes = new Map<string, ProjectScope>();

    private roots: readonly string[] = [];

    private defaultScope: ProjectScope = createDefaultProjectScope([]);

    private scopeFor(path: string): ProjectScope {
        return scopeOwning(this.scopes.values(), path, this.defaultScope);
    }

    private ownerOf(analysis: DocumentAnalysis): string {
        return this.scopeFor(analysis.path).key;
    }

    private ambientFor(uri: string, environment: Environment, scope: ProjectScope, isLibrary: boolean): AmbientDeclarations {
        const others = this.others(uri).filter((analysis) => canReference(environment, analysis.environment) && !isTestPath(analysis.relative));
        const visible = isLibrary ? others.filter((analysis) => scope.libraries.isLibraryPath(analysis.path)) : others;

        return mergeAmbient(visible.map((analysis) => analysis.own));
    }

    private run(uri: string, version: number, text: string): DocumentAnalysis {
        const path = uriToPath(uri);
        const scope = this.scopeFor(path);
        const library = scope.libraries.fileFor(path);
        const relative = library === null ? relativeToRoots(path, scope.roots) : library.relative;
        const analysis = analyzeDocument({
            uri,
            path,
            relative,
            version,
            text,
            project: isTestPath(relative) ? { globals: [...scope.project.globals, ...TEST_DECLARATIONS] } : scope.project,
            env: scope.env,
            compilerOptions: scope.settings.compilerOptions,
            environment: library === null ? scope.settings.resolver.side(relative) : library.environment,
            environmentLocked: library !== null,
            ambient: (environment) => this.ambientFor(uri, environment, scope, library !== null),
        });

        this.analyses.set(pathKey(path), analysis);
        this.lastOwners.set(pathKey(path), scope.key);

        return analysis;
    }

    private manifests(): Map<string, DocumentAnalysis> {
        const found = new Map<string, DocumentAnalysis>();

        for (const analysis of this.all()) {
            if (analysis.manifest !== null) {
                found.set(projectKeyOf(analysis.path), analysis);
            }
        }

        return found;
    }

    private applySettings(): Set<string> {
        const changed = new Set<string>();
        const next = new Map<string, ProjectScope>();

        for (const [key, analysis] of this.manifests()) {
            const settings = settingsFrom(analysis.manifest);
            const roots = [normalizeFsPath(dirname(analysis.path))];
            const existing = this.scopes.get(key);

            if (existing !== undefined && existing.signature === scopeSignature(settings, roots)) {
                next.set(key, existing);

                continue;
            }

            next.set(key, createProjectScope(key, roots, settings));
            changed.add(key);
        }

        for (const key of this.scopes.keys()) {
            if (!next.has(key) && key !== DEFAULT_PROJECT_KEY) {
                changed.add(key);
            }
        }

        if (this.defaultScope.signature !== scopeSignature(this.defaultScope.settings, this.roots)) {
            this.defaultScope = createDefaultProjectScope(this.roots);
            changed.add(DEFAULT_PROJECT_KEY);
        }

        this.scopes = next;

        return changed;
    }

    private libraryRoots(): string[] {
        return [...this.scopes.values()].flatMap((scope) => scope.libraries.roots);
    }

    private isLibraryPath(path: string): boolean {
        return [...this.scopes.values()].some((scope) => scope.libraries.isLibraryPath(path));
    }

    private scanAll(): ScannedFile[] {
        const own = scanSources(this.roots);
        const libraries = scanSources(this.libraryRoots()).filter((file) => this.isLibraryPath(file.path));

        return [...own, ...libraries];
    }

    private rerunAffected(changed: ReadonlySet<string>, uri: string): DocumentAnalysis[] {
        const excluded = pathKey(uriToPath(uri));

        return this.all()
            .filter((analysis) => analysis.manifest === null && pathKey(analysis.path) !== excluded)
            .filter((analysis) => changed.has(this.ownerOf(analysis)) || changed.has(this.lastOwners.get(pathKey(analysis.path)) ?? DEFAULT_PROJECT_KEY))
            .map((analysis) => this.run(analysis.uri, analysis.version, analysis.text));
    }

    private rerunDependents(names: ReadonlySet<string>, excluded: ReadonlySet<string>, scope: string): DocumentAnalysis[] {
        const inScope = this.all().filter((analysis) => analysis.manifest === null && this.ownerOf(analysis) === scope);
        const dependents = dependentsOf(inScope, names);

        return inScope.filter((analysis) => !excluded.has(pathKey(analysis.path)) && dependents.has(pathKey(analysis.path))).map((analysis) => this.run(analysis.uri, analysis.version, analysis.text));
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
            const changed = this.applySettings();

            return changed.size === 0 ? [analysis] : [analysis, ...this.rerunAffected(changed, uri)];
        }

        if (before === this.visibleTo(analysis)) {
            return [analysis];
        }

        const names = new Set([...declared, ...declaredNames(analysis)]);

        return [analysis, ...this.rerunDependents(names, new Set([pathKey(analysis.path)]), this.ownerOf(analysis))];
    }

    isEnvironmentFile(path: string): boolean {
        return isEnvironmentPath(path, this.scopeFor(path).settings.environment);
    }

    remove(uri: string): void {
        const key = pathKey(uriToPath(uri));

        this.analyses.delete(key);
        this.lastOwners.delete(key);
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
        this.lastOwners.clear();
        this.scopes.clear();
        this.load(this.roots);

        return { updated: this.all(), removed: known.filter((uri) => this.get(uri) === null) };
    }

    rescan(): RescanResult {
        if (this.applySettings().size > 0) {
            return { updated: this.refresh(), removed: [] };
        }

        const scanned = this.scanAll();
        const present = new Set(scanned.map((file) => pathKey(file.path)));
        const names = new Map<string, Set<string>>();
        const removed: string[] = [];
        const touched = new Set<string>();
        const updated: DocumentAnalysis[] = [];

        const record = (scope: string, declarations: Iterable<string>): void => {
            const bucket = names.get(scope) ?? new Set<string>();

            for (const name of declarations) {
                bucket.add(name);
            }

            names.set(scope, bucket);
        };

        for (const analysis of this.all()) {
            if (present.has(pathKey(analysis.path))) {
                continue;
            }

            record(this.ownerOf(analysis), declaredNames(analysis));
            this.analyses.delete(pathKey(analysis.path));
            this.lastOwners.delete(pathKey(analysis.path));
            removed.push(analysis.uri);
        }

        for (const file of scanned) {
            if (this.analyses.has(pathKey(file.path))) {
                continue;
            }

            const analysis = this.run(pathToUri(file.path), 0, file.text);

            record(this.ownerOf(analysis), declaredNames(analysis));
            touched.add(pathKey(analysis.path));
            updated.push(analysis);
        }

        const dependents = [...names.entries()].flatMap(([scope, declarations]) => this.rerunDependents(declarations, touched, scope));

        return { updated: [...updated, ...dependents], removed };
    }

    reloadSettings(): DocumentAnalysis[] {
        forgetEnvironments();
        this.scopes.clear();
        this.defaultScope = createDefaultProjectScope(this.roots);

        return this.refresh();
    }

    get(uri: string): DocumentAnalysis | null {
        return this.analyses.get(pathKey(uriToPath(uri))) ?? null;
    }

    all(): DocumentAnalysis[] {
        return [...this.analyses.values()];
    }

    others(uri: string): DocumentAnalysis[] {
        const path = uriToPath(uri);
        const key = pathKey(path);
        const scope = this.scopeFor(path).key;

        return this.all().filter((analysis) => pathKey(analysis.path) !== key && analysis.manifest === null && this.ownerOf(analysis) === scope);
    }

    load(roots: readonly string[]): void {
        forgetEnvironments();
        this.roots = roots;
        this.scopes.clear();
        this.defaultScope = createDefaultProjectScope(roots);

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
