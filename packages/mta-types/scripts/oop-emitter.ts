import type { OopClass, OopConstructor, OopMember } from '#mta-types/oop-declaration';

import { collectHelpers, printDescriptor } from './descriptor-printer.ts';
import type { GeneratedFile } from './generator-model.ts';

const MAX_BODY_LINES = 240;

const MAX_LINE_LENGTH = 150;

const AGGREGATE = 'MTA_OOP_CLASSES';

const CONSTRUCTORS: Readonly<Record<OopMember['kind'], string>> = {
    method: 'oopMethod',
    property: 'oopProperty',
};

function memberLines(member: OopMember): string[] {
    const head = `${CONSTRUCTORS[member.kind]}('${member.name}', '${member.environment}', '${member.procedural}'`;
    const single = `        ${head}, ${printDescriptor(member.type)}),`;

    if (single.length <= MAX_LINE_LENGTH) {
        return [single];
    }

    if (member.type.kind !== 'function') {
        return [`        ${head},`, `            ${printDescriptor(member.type)},`, '        ),'];
    }

    const parameters = member.type.parameters.map((parameter) => `                ${printDescriptor(parameter)},`);
    const tail = [printDescriptor(member.type.returnType), String(member.type.minimumArguments)];

    if (member.type.isVariadic) {
        tail.push('true');
    }

    return [
        `        ${head},`,
        '            fn(',
        '                [',
        ...parameters,
        '                ],',
        ...tail.map((part) => `                ${part},`),
        '            ),',
        '        ),',
    ];
}

function constructorLines(constructor: OopConstructor | null): string[] {
    if (constructor === null) {
        return ['    null,'];
    }

    const single = `    oopConstructor('${constructor.environment}', ${printDescriptor(constructor.type)}),`;

    if (single.length <= MAX_LINE_LENGTH) {
        return [single];
    }

    return [
        `    oopConstructor('${constructor.environment}',`,
        ...memberLines({ name: '', kind: 'method', environment: constructor.environment, procedural: '', type: constructor.type })
            .slice(1, -1)
            .map((line) => line.slice(4)),
        '    ),',
    ];
}

function classLines(declaration: OopClass): string[] {
    const parent = declaration.parent === null ? 'null' : `'${declaration.parent}'`;

    if (declaration.staticMethods.length === 0 && declaration.constructor === null) {
        if (declaration.members.length === 0) {
            return [`    oopClass('${declaration.name}', ${parent}, []),`];
        }

        return [`    oopClass('${declaration.name}', ${parent}, [`, ...declaration.members.flatMap(memberLines), '    ]),'];
    }

    return [
        `    oopClass('${declaration.name}', ${parent}, [`,
        ...declaration.members.flatMap(memberLines),
        '    ], [',
        ...declaration.staticMethods.flatMap(memberLines),
        '    ],',
        ...constructorLines(declaration.constructor),
        '    ),',
    ];
}

function chunkClasses(classes: readonly OopClass[]): OopClass[][] {
    const chunks: OopClass[][] = [];
    let current: OopClass[] = [];
    let lines = 0;

    for (const declaration of classes) {
        const length = classLines(declaration).length;

        if (current.length > 0 && lines + length > MAX_BODY_LINES) {
            chunks.push(current);
            current = [];
            lines = 0;
        }

        current.push(declaration);
        lines += length;
    }

    if (current.length > 0) {
        chunks.push(current);
    }

    return chunks;
}

function renderModule(symbol: string, classes: readonly OopClass[]): string {
    const helpers = new Set<string>();
    const builders = new Set<string>(['oopClass']);

    for (const declaration of classes) {
        for (const member of declaration.members) {
            collectHelpers(member.type, helpers);
            builders.add(CONSTRUCTORS[member.kind]);
        }

        for (const member of declaration.staticMethods) {
            collectHelpers(member.type, helpers);
            builders.add(CONSTRUCTORS[member.kind]);
        }

        if (declaration.constructor !== null) {
            collectHelpers(declaration.constructor.type, helpers);
            builders.add('oopConstructor');
        }
    }

    const imported = [...builders].sort((left, right) => left.localeCompare(right, 'en'));
    const descriptors = [...helpers].sort((left, right) => left.localeCompare(right, 'en'));

    return [
        `import { ${imported.join(', ')}, type OopClass } from '@mta-types/oop-declaration';`,
        `import { ${descriptors.join(', ')} } from '@mta-types/type-descriptor';`,
        '',
        `export const ${symbol}: readonly OopClass[] = [`,
        ...classes.flatMap(classLines),
        '];',
        '',
    ].join('\n');
}

function symbolName(module: string): string {
    return module.replaceAll('-', '_').toUpperCase();
}

function renderAggregate(modules: readonly string[]): string {
    return [
        "import type { OopClass } from '@mta-types/oop-declaration';",
        '',
        ...modules.map((module) => `import { ${symbolName(module)} } from './${module}';`),
        '',
        `export const ${AGGREGATE}: readonly OopClass[] = [`,
        ...modules.map((module) => `    ...${symbolName(module)},`),
        '];',
        '',
    ].join('\n');
}

export function emitOopSurface(classes: readonly OopClass[]): GeneratedFile[] {
    const chunks = chunkClasses(classes);
    const files: GeneratedFile[] = [];
    const modules: string[] = [];

    chunks.forEach((chunk, index) => {
        const module = `mta-oop-${index + 1}`;

        modules.push(module);
        files.push({ path: `src/generated/oop/${module}.ts`, contents: renderModule(symbolName(module), chunk) });
    });

    files.push({ path: 'src/generated/oop/mta-oop.ts', contents: renderAggregate(modules) });

    return files;
}
