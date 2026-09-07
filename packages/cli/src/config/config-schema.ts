import type {
    AuthorInfo,
    BuildDetails,
    CompilerOptions,
    EngineVersions,
    FileEntry,
    OrderedName,
    ScriptEntry,
} from '@compiler/manifest/manifest-contract';
import { DEFAULT_CONTRACTS_DIR, MANIFEST_FILE_NAME } from '@compiler/manifest/manifest-defaults';
import { isValidResourceName } from '@compiler/manifest/manifest-rules';

export interface LuamConfig {
    name: string;
    author: AuthorInfo | null;
    version: string | null;
    description: string | null;
    dependencies: OrderedName[];
    secret: string;
    compilerOptions: CompilerOptions;
    oopDeclared: boolean;
    engine: EngineVersions;
    libraries: OrderedName[];
    scripts: ScriptEntry[];
    files: FileEntry[];
    contracts: string;
    outDir: string;
    output: BuildDetails;
}

export { DEFAULT_CONTRACTS_DIR, MANIFEST_FILE_NAME };

export type { AuthorInfo, BuildDetails, CompilerOptions, EngineVersions, FileEntry, OrderedName, ScriptEntry };

export { isValidResourceName };
