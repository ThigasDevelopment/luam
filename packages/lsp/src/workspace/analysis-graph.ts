import { createDependencyGraph, type GraphNode } from '@compiler/project/dependency-graph';
import { fingerprintByName } from '@compiler/project/fingerprint';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { pathKey } from './document-uri';

function toNode(analysis: DocumentAnalysis): GraphNode {
    return {
        path: pathKey(analysis.path),
        environment: analysis.environment,
        provides: fingerprintByName(analysis.own),
        requires: analysis.referencedNames,
    };
}

export function declaredNames(analysis: DocumentAnalysis | null): Set<string> {
    return analysis === null || analysis.manifest !== null ? new Set() : new Set(fingerprintByName(analysis.own).keys());
}

export function dependentsOf(analyses: readonly DocumentAnalysis[], names: ReadonlySet<string>): Set<string> {
    if (names.size === 0) {
        return new Set();
    }

    const graph = createDependencyGraph(analyses.filter((analysis) => analysis.manifest === null).map(toNode));

    return graph.dependentsOf(names);
}
