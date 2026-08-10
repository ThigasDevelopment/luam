import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';

const RESOLVED = /\.[cm]?[jt]s$/;

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
            return nextResolve(specifier, context);
        }

        if (RESOLVED.test(specifier) || context.parentURL === undefined) {
            return nextResolve(specifier, context);
        }

        return existsSync(new URL(`${specifier}.ts`, context.parentURL)) ? nextResolve(`${specifier}.ts`, context) : nextResolve(specifier, context);
    },
});
