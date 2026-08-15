import type { SymbolInfo } from './binder';
import type { CheckContext } from './context';

const UNUSED_LOCAL = 'check-unused-local';

const UNUSED_PARAMETER = 'check-unused-parameter';

const OPT_OUT = 'Read it, remove it, or rename it with a leading "_" to keep it on purpose.';

function isReportable(symbol: SymbolInfo): boolean {
    return symbol.origin !== undefined && symbol.read !== true && !symbol.name.startsWith('_') && symbol.position.line > 0;
}

export function reportUnusedSymbols(context: CheckContext, noUnusedLocals: boolean, noUnusedParameters: boolean): void {
    if (context.isDeclarationFile || (!noUnusedLocals && !noUnusedParameters)) {
        return;
    }

    for (const symbol of context.binder.declaredSymbols()) {
        if (!isReportable(symbol)) {
            continue;
        }

        if (symbol.origin === 'local' && noUnusedLocals) {
            context.warn(UNUSED_LOCAL, `"${symbol.name}" is declared but never read. ${OPT_OUT}`, symbol.position);
        }

        if (symbol.origin === 'parameter' && noUnusedParameters) {
            context.warn(UNUSED_PARAMETER, `Parameter "${symbol.name}" is never read. ${OPT_OUT}`, symbol.position);
        }
    }
}
