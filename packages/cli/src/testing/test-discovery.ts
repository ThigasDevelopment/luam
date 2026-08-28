import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { Environment } from '@compiler/environment/environment';
import type { SourceMapping } from '@compiler/manifest/manifest-contract';
import type { ProjectFile } from '@compiler/project/module';
import { createSourceResolver, describeMatches } from '@compiler/project/source-mapping';
import { isTestPath, TEST_EXTENSION } from '@compiler/project/source-kind';

export interface DiscoveredTests {
    files: ProjectFile[];
    diagnostics: CliDiagnostic[];
}

export const DEFAULT_TEST_ENVIRONMENT: Environment = 'shared';

const SIDE_CONFLICT = 'test-source-side-conflict';

const UNREADABLE_TEST = 'test-source-unreadable';

function readTest(root: string, path: string, diagnostics: CliDiagnostic[]): string | null {
    try {
        return readFileSync(resolve(root, path), 'utf8');
    } catch (error: unknown) {
        diagnostics.push(cliError(UNREADABLE_TEST, `The test file "${path}" could not be read: ${error instanceof Error ? error.message : String(error)}`));

        return null;
    }
}

export function discoverTests(root: string, sources: SourceMapping, excluded: readonly string[] = []): DiscoveredTests {
    const resolver = createSourceResolver(sources);
    const tree = listProjectFiles(root, ['.'], excluded);
    const diagnostics = tree.errors.map((message) => cliError(UNREADABLE_TEST, message));
    const files: ProjectFile[] = [];

    for (const path of tree.files.filter(isTestPath)) {
        const resolution = resolver.resolve(path);

        if (resolution.matches.length > 1) {
            diagnostics.push(cliError(SIDE_CONFLICT, `"${path}" is matched by more than one side: ${describeMatches(resolution.matches)}. Narrow the patterns.`));

            continue;
        }

        const source = readTest(root, path, diagnostics);

        if (source !== null) {
            files.push({ path, source, environment: resolution.environment ?? DEFAULT_TEST_ENVIRONMENT });
        }
    }

    return { files: files.sort((left, right) => left.path.localeCompare(right.path)), diagnostics };
}

export { TEST_EXTENSION };
