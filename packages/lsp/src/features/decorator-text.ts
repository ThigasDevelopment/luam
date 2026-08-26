import type { DecoratorDefinition, DecoratorTarget } from '@compiler/checker/decorator-catalog';

const TARGET_LABELS: Readonly<Record<DecoratorTarget, string>> = { class: 'a class', field: 'a field', method: 'a method' };

function joinLabels(labels: readonly string[]): string {
    const last = labels.at(-1) ?? '';

    return labels.length <= 1 ? last : `${labels.slice(0, -1).join(', ')} and on ${last}`;
}

export function targetText(definition: DecoratorDefinition): string {
    return `Valid on ${joinLabels(definition.targets.map((target) => TARGET_LABELS[target]))}. It takes no arguments.`;
}

export function section(title: string, lines: readonly string[]): string[] {
    return lines.length === 0 ? [] : ['', `**${title}**`, '', ...lines.map((line) => `- ${line}`)];
}

export function decoratorDocumentation(definition: DecoratorDefinition): string {
    const body = [
        definition.documentation,
        '',
        targetText(definition),
        ...section('Generates', definition.generates),
        ...section('Rules', definition.rules),
        ...section('Diagnostics', definition.diagnostics),
    ];

    return body.join('\n');
}
