import { type Plugin } from 'vite';

export function browserPath(shim: string, scope: string): Plugin {
    return {
        name: 'luam-browser-path',
        enforce: 'pre',
        resolveId(source, importer, options) {
            if (source !== 'node:path' || options.ssr === true || importer === undefined) {
                return null;
            }

            return importer.split('\\').join('/').includes(scope) ? shim : null;
        },
    };
}
