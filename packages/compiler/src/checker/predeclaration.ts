import type { Statement } from '@compiler/parser/ast';
import type { ClassDeclaration } from '@compiler/parser/declaration-nodes';

import { declareClassInfo, resolveClassHeader, resolveSuperClass } from './classes';
import type { CheckContext } from './context';
import type { ClassInfo } from './registry';

interface PredeclaredClass {
    info: ClassInfo;
    statement: ClassDeclaration;
}

function declareHeaders(context: CheckContext, body: readonly Statement[]): PredeclaredClass[] {
    const declared: PredeclaredClass[] = [];

    for (const statement of body) {
        if (statement.kind !== 'class-declaration') {
            continue;
        }

        const info = declareClassInfo(context, statement);

        if (info === null) {
            continue;
        }

        context.predeclareClass(info);
        declared.push({ info, statement });
    }

    return declared;
}

function breakCycle(context: CheckContext, info: ClassInfo): void {
    const seen = new Set<string>([info.name]);

    let current = info.superClass === null ? null : context.declarations.lookupClass(info.superClass);

    while (current !== null) {
        if (seen.has(current.name)) {
            context.report('check-class-cycle', `Class "${info.name}" creates an inheritance cycle through "${current.name}".`, info.position);
            info.superClass = null;

            return;
        }

        seen.add(current.name);
        current = current.superClass === null ? null : context.declarations.lookupClass(current.superClass);
    }
}

export function predeclareModule(context: CheckContext, body: readonly Statement[]): void {
    const declared = declareHeaders(context, body);

    for (const entry of declared) {
        entry.info.superClass = resolveSuperClass(context, entry.statement);
        resolveClassHeader(context, entry.info, entry.statement);
    }

    for (const entry of declared) {
        breakCycle(context, entry.info);
    }
}
