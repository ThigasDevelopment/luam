import type { ApiEnvironment } from '#mta-types/api-declaration';
import { fn, type TypeDescriptor } from '#mta-types/type-descriptor';

import type { ParsedDeclaration } from './generator-model.ts';
import { wikiDocumentation } from './wiki-documentation.ts';
import { parseSignature, type WikiSignature } from './wiki-signature.ts';
import { snapshotEnvironments, type WikiSnapshot, type WikiSnapshotPage } from './wiki-snapshot.ts';
import { syntaxBlocks, type SyntaxBlock } from './wiki-syntax.ts';
import { parseOopTemplate, parsePageFlags, type WikiOopSurface, type WikiPageFlags } from './wiki-templates.ts';
import { mapWikiReturn, mapWikiType, type WikiTypeContext } from './wiki-type-mapper.ts';

export interface WikiSurface {
    name: string;
    title: string;
    revision: number;
    category: string;
    environment: ApiEnvironment;
    oop: WikiOopSurface | null;
    flags: WikiPageFlags;
    signatures: number;
}

export interface UnparsedPage {
    name: string;
    reason: string;
}

export interface WikiCatalog {
    server: readonly ParsedDeclaration[];
    client: readonly ParsedDeclaration[];
    surfaces: readonly WikiSurface[];
    unparsed: readonly UnparsedPage[];
    multiReturns: readonly string[];
}

function blockFor(blocks: readonly SyntaxBlock[], side: 'server' | 'client'): SyntaxBlock | undefined {
    return blocks.find((block) => block.environment === side) ?? blocks.find((block) => block.environment === null) ?? blocks[0];
}

function descriptorOf(signature: WikiSignature, context: WikiTypeContext): TypeDescriptor {
    const parameters = signature.parameters.map((parameter) => mapWikiType(parameter.type, context));

    return fn(parameters, mapWikiReturn(signature.returns, context), signature.minimumArguments, signature.isVariadic);
}

function declarationOf(page: WikiSnapshotPage, signature: WikiSignature, context: WikiTypeContext): ParsedDeclaration {
    return {
        name: page.name,
        category: page.category,
        type: descriptorOf(signature, context),
        documentation: wikiDocumentation(page.title, page.text, signature.parameters, signature.isVariadic),
    };
}

export function parseWikiCatalog(snapshot: WikiSnapshot, context: WikiTypeContext): WikiCatalog {
    const environments = snapshotEnvironments(snapshot);
    const server: ParsedDeclaration[] = [];
    const client: ParsedDeclaration[] = [];
    const surfaces: WikiSurface[] = [];
    const unparsed: UnparsedPage[] = [];
    const multiReturns: string[] = [];

    for (const page of snapshot.pages) {
        const environment = environments.get(page.name) ?? 'shared';
        const blocks = syntaxBlocks(page.text, page.name);

        if (blocks.length === 0) {
            unparsed.push({ name: page.name, reason: 'the Syntax section carries no Lua block naming the function' });

            continue;
        }

        const sides: ('server' | 'client')[] = environment === 'shared' ? ['server', 'client'] : [environment];
        const parsedSides = sides.map((side) => ({ side, signature: parseSignature(blockFor(blocks, side)?.source ?? '', page.name) }));
        const failed = parsedSides.filter((entry) => entry.signature === null);

        if (failed.length > 0) {
            const where = failed.map((entry) => entry.side).join(' and ');

            unparsed.push({ name: page.name, reason: `the ${where} signature does not name ${page.name} followed by a parameter list` });

            continue;
        }

        for (const { side, signature } of parsedSides) {
            if (signature === null) {
                continue;
            }

            (side === 'server' ? server : client).push(declarationOf(page, signature, context));

            if (signature.returns.length > 1) {
                multiReturns.push(page.name);
            }
        }

        surfaces.push({
            name: page.name,
            title: page.title,
            revision: page.revision,
            category: page.category,
            environment,
            oop: parseOopTemplate(page.text),
            flags: parsePageFlags(page.text),
            signatures: blocks.length,
        });
    }

    return { server, client, surfaces, unparsed, multiReturns: [...new Set(multiReturns)].sort() };
}
