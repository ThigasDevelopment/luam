import { ANY, BOOLEAN, fn, named, NIL, NUMBER, STRING, TABLE, tupleOf, unionOf, USERDATA, VOID, type TypeDescriptor } from '#mta-types/type-descriptor';

export const GENERIC_CALLBACK: TypeDescriptor = fn([], ANY, 0, true);

const SCALARS: Readonly<Record<string, TypeDescriptor>> = {
    bool: BOOLEAN,
    boolean: BOOLEAN,
    callback: GENERIC_CALLBACK,
    float: NUMBER,
    func: GENERIC_CALLBACK,
    function: GENERIC_CALLBACK,
    handle: ANY,
    int: NUMBER,
    mixed: ANY,
    nil: NIL,
    number: NUMBER,
    objectgroupmodifiable: STRING,
    primitivetype: STRING,
    string: STRING,
    surfaceformat: STRING,
    table: TABLE,
    text: STRING,
    uint: NUMBER,
    userdata: USERDATA,
    var: ANY,
    void: VOID,
};

const ELEMENT_SPELLINGS: Readonly<Record<string, string>> = {
    col: 'EngineCOL',
    dff: 'EngineDFF',
    font: 'DxFont',
    guiscrollbar: 'GuiElement',
    list: 'GuiGridList',
    progressbar: 'GuiElement',
    pseudovehicle: 'Vehicle',
    rendertarget: 'RenderTarget',
    screensource: 'DxScreenSource',
    shader: 'DxShader',
    texture: 'DxTexture',
    txd: 'EngineTXD',
};

export interface WikiTypeContext {
    elementTypes: ReadonlySet<string>;
}

function normalize(spelling: string): string {
    return spelling.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function elementIndex(elementTypes: ReadonlySet<string>): ReadonlyMap<string, string> {
    return new Map([...elementTypes].map((name) => [normalize(name), name]));
}

function mapSpelling(spelling: string, index: ReadonlyMap<string, string>): TypeDescriptor {
    const key = normalize(spelling);
    const scalar = SCALARS[key];

    if (scalar !== undefined) {
        return scalar;
    }

    const aliased = ELEMENT_SPELLINGS[key];
    const element = index.get(aliased === undefined ? key : normalize(aliased));

    return element === undefined ? ANY : named(element);
}

function dedupe(options: readonly TypeDescriptor[]): TypeDescriptor[] {
    const seen = new Map<string, TypeDescriptor>();

    for (const option of options) {
        seen.set(JSON.stringify(option), option);
    }

    return [...seen.values()];
}

export function mapWikiType(spelling: string, context: WikiTypeContext): TypeDescriptor {
    const index = elementIndex(context.elementTypes);
    const parts = spelling
        .split(/[/|]/)
        .map((part) => (part.trim().split(/\s+/).shift() ?? '').trim())
        .filter((part) => part.length > 0);

    if (parts.length === 0) {
        return ANY;
    }

    const options = dedupe(parts.map((part) => mapSpelling(part, index)));

    if (options.length === 1) {
        return options[0] ?? ANY;
    }

    return options.some((option) => option.kind === 'any') ? ANY : unionOf(options);
}

export function mapWikiReturn(spellings: readonly string[], context: WikiTypeContext): TypeDescriptor {
    const mapped = spellings.map((spelling) => mapWikiType(spelling, context));

    if (mapped.length === 0) {
        return VOID;
    }

    if (mapped.length === 1) {
        return mapped[0] ?? VOID;
    }

    return tupleOf(mapped);
}
