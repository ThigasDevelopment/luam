import { createProjectCache, type CompileProjectOptions } from './project-cache';
import type { ProjectFile, ProjectResult } from './module';

export function compileProject(files: readonly ProjectFile[], options: CompileProjectOptions = {}): ProjectResult {
    return createProjectCache().compile(files, options);
}
