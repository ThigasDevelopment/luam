export type DecoratorTarget = 'class' | 'field' | 'method';

export interface DecoratorDefinition {
    name: string;
    documentation: string;
    targets: readonly DecoratorTarget[];
    generates: readonly string[];
    rules: readonly string[];
    diagnostics: readonly string[];
}

const CONFLICT = '`check-decorator-conflict` when a generated name is already declared by a hand-written member.';

const SPREAD = 'On a class it applies to every field of that class; on a field it applies to that field alone.';

const NOTHING = 'Nothing. The emitted Lua is unchanged; the decorator only makes the checker validate how the class is used.';

export const KNOWN_DECORATORS: ReadonlyMap<string, DecoratorDefinition> = new Map<string, DecoratorDefinition>([
    [
        'Getter',
        {
            name: 'Getter',
            documentation: 'Generates a typed getter for each decorated field.',
            targets: ['class', 'field'],
            generates: ['`getField(): FieldType`, returning the field unchanged.', 'A boolean field uses `isField()`, and a boolean already named `isReady` keeps `isReady()` instead of `isIsReady()`.'],
            rules: [SPREAD, 'The accessor is an ordinary member: completion after `:` lists it, and go-to-definition lands on the field that generated it.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Setter',
        {
            name: 'Setter',
            documentation: 'Generates a typed setter for each decorated field.',
            targets: ['class', 'field'],
            generates: ['`setField(value: FieldType): void`, assigning the field.', 'A boolean field named `isReady` becomes `setReady(value)`.'],
            rules: [SPREAD, 'The parameter is typed from the field, so a wrong argument is `check-type-mismatch`, exactly as for a hand-written method.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'FluentSetter',
        {
            name: 'FluentSetter',
            documentation: 'Generates a chainable setter that returns the same instance.',
            targets: ['field'],
            generates: ['`withField(value: FieldType): OwnerClass`, assigning the field and returning `self`.'],
            rules: ['The returned value is the same instance, never a copy, so calls chain: `session:withTimeout(60):withTimeout(90)`.', 'It does not replace `@Setter`; declare both when `setField` is wanted as well.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'ToString',
        {
            name: 'ToString',
            documentation: 'Generates a shallow string representation.',
            targets: ['class'],
            generates: ['`toString(): string`, formatted as `ClassName{field=value, field=value}`.'],
            rules: ['Every field of the class is included, in declaration order, through `tostring`.', 'It is shallow: a table field is rendered as its `tostring` address, not as its contents.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Equals',
        {
            name: 'Equals',
            documentation: 'Generates shallow field equality.',
            targets: ['class'],
            generates: ['`equals(other: OwnerClass): boolean`, comparing every field with `==`.'],
            rules: ['It is shallow: two tables with the same contents are equal only when they are the same table.', 'It does not overload the Lua `==` operator; call `equals` explicitly.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Clone',
        {
            name: 'Clone',
            documentation: 'Generates a shallow clone.',
            targets: ['class'],
            generates: ['`clone(): OwnerClass`, a new instance carrying the same field values.'],
            rules: ['The copy is built with `new OwnerClass()` and no constructor arguments, then every field is assigned.', 'It is shallow: a table stored in a field is the same table in the clone.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Serializable',
        {
            name: 'Serializable',
            documentation: 'Generates a plain-table view of the fields.',
            targets: ['class'],
            generates: ['`toTable(): table`, a plain table keyed by field name.'],
            rules: ['It is shallow: a table stored in a field is the same table in the result.', 'It pairs with `@Deserialize` for a round trip.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Deserialize',
        {
            name: 'Deserialize',
            documentation: 'Generates field assignment from a plain table.',
            targets: ['class'],
            generates: ['`fromTable(values: table): void`, assigning the fields of the current instance.'],
            rules: ['It assigns onto the existing instance and returns nothing.', 'Every field is assigned, so a key missing from `values` sets that field to `nil`.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'Lazy',
        {
            name: 'Lazy',
            documentation: 'Generates a caching getter for an initialized field.',
            targets: ['field'],
            generates: ['`getField(): FieldType`, running the initializer on first access and reusing the result afterwards.'],
            rules: ['The initializer is not emitted as an initial class value; the getter runs it while the field is still `nil`.', 'Naming follows `@Getter`, so a boolean field yields `isField()`.'],
            diagnostics: ['`check-lazy-initializer` when the decorated field has no initializer.', CONFLICT],
        },
    ],
    [
        'Observable',
        {
            name: 'Observable',
            documentation: 'Generates a notifying setter and listener registration.',
            targets: ['field'],
            generates: ['`setField(value: FieldType): void`, assigning the field and then calling every listener with the new value.', '`onFieldChanged(listener): void`, appending a listener.'],
            rules: ['Listeners live on the instance and run in registration order.', 'Only the generated setter notifies; assigning `instance.field = value` directly does not.'],
            diagnostics: [CONFLICT],
        },
    ],
    [
        'ReadOnly',
        {
            name: 'ReadOnly',
            documentation: 'Prevents writes outside methods of the declaring class.',
            targets: ['field'],
            generates: [NOTHING],
            rules: ['Reads are always allowed.', 'Methods of the declaring class may assign the field; every other place may not.'],
            diagnostics: ['`check-readonly-assignment` on an assignment outside the declaring class.'],
        },
    ],
    [
        'Deprecated',
        {
            name: 'Deprecated',
            documentation: 'Reports a warning when the decorated member is used.',
            targets: ['field', 'method'],
            generates: [NOTHING],
            rules: ['The report lands on every use site, not on the declaration.', 'It is a warning, so it never blocks the build.'],
            diagnostics: ['`check-deprecated-use` at every read or call of the member.'],
        },
    ],
    [
        'Override',
        {
            name: 'Override',
            documentation: 'Requires a matching superclass method.',
            targets: ['method'],
            generates: [NOTHING],
            rules: ['The class must declare a parent with `extends`, and that parent must declare the method with an identical signature.', 'It does not change dispatch; call the parent implementation with `super(...)`.'],
            diagnostics: ['`check-invalid-override` when the superclass has no such method or the signature differs.'],
        },
    ],
    [
        'Builder',
        {
            name: 'Builder',
            documentation: 'Generates a companion builder class.',
            targets: ['class'],
            generates: ['`OwnerClassBuilder`, a separate class declared beside the decorated one.', '`withField(value: FieldType): OwnerClassBuilder` for every field, and `build(): OwnerClass`.'],
            rules: ['The builder adds no member to the decorated class; construct it with `new OwnerClassBuilder()`.', '`build()` calls `new OwnerClass()` with no constructor arguments, then assigns the collected fields.'],
            diagnostics: [CONFLICT],
        },
    ],
]);
