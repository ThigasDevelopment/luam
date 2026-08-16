import type { Hover } from 'vscode-languageserver';

import { wordAt } from '@lsp/support/source-text';

const SUPER_HOVER = [
    '```luam',
    'super(...): ParentReturnType',
    '```',
    '',
    '`super(...)` calls the parent-class implementation for the current class member while preserving the current `self` instance.',
    '',
    '**Resolution**',
    '',
    '- In a constructor, it invokes the parent-class constructor.',
    '- In an overridden method, it invokes the parent implementation of the method with the same name.',
    '- Dispatch starts from the declared parent class instead of calling the overriding implementation again.',
    '',
    '**Type checking**',
    '',
    '- Arguments are checked against the selected parent constructor or method parameters.',
    '- The expression type is the return type of the selected parent implementation, so its result can be returned or assigned.',
    '',
    '**Restrictions**',
    '',
    '- It is only valid inside a class member whose class declares a parent with `extends`.',
    '- Call it directly as `super(...)`; the legacy form `self:super(...)` is invalid.',
    '- A missing parent method produces `check-unknown-super-method`; use outside a valid class context produces `check-invalid-super`.',
].join('\n');

export function contextualHover(text: string, offset: number): Hover | null {
    if (wordAt(text, offset) !== 'super') {
        return null;
    }

    return { contents: { kind: 'markdown', value: SUPER_HOVER } };
}
