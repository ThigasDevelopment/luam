import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import { NATIVE_EXTENSIONS } from '@compiler/extensions/native-extensions';
import { isLibrary, findLibraryMember } from '@mta-types/library-members';

import type { CheckContext } from './context';

const HELPER_TARGETS: ReadonlyMap<string, string> = new Map(
    NATIVE_EXTENSIONS.map((extension) => [
        extension.target,
        extension.style === 'call' ? `${extension.receiver}.${extension.property}(...)` : `${extension.receiver}.${extension.property}`,
    ]),
);

const SUPPRESSION = 'Rename the declaration, or record the new signature in a ".d.luam" file so later calls are checked against it.';

export function reportShadowedGlobal(context: CheckContext, name: string, position: SourcePosition): void {
    if (context.isDeclarationFile || !context.binder.isBuiltinReference(name)) {
        return;
    }

    const message = `"${name}" is an API this environment declares. Later calls are still checked against the declared signature, not this one. ${SUPPRESSION}`;

    context.warn('check-shadowed-api', message, position);
}

export function reportShadowedHelper(context: CheckContext, library: string, member: string, position: SourcePosition): void {
    if (context.isDeclarationFile || !isLibrary(library) || findLibraryMember(library, member) === null) {
        return;
    }

    const target = `${library}.${member}`;
    const rewrite = HELPER_TARGETS.get(target);
    const lowered = rewrite === undefined ? '' : ` The extension "${rewrite}" lowers to it.`;
    const message = `"${target}" is part of the standard library this build models.${lowered} Later calls are still checked against the declared signature, not this one. ${SUPPRESSION}`;

    context.warn('check-shadowed-helper', message, position);
}

export function reportImplicitGlobal(context: CheckContext, name: string, position: SourcePosition): void {
    if (context.isDeclarationFile || !context.noImplicitGlobals) {
        return;
    }

    const message = `"${name}" is not declared anywhere this file can reach, so this assignment creates a global. Declare it with "local", annotate it as a global, or describe it in a ".d.luam" file.`;

    context.warn('check-implicit-global', message, position);
}
