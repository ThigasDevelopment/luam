import type { ApiEnvironment } from './api-declaration';
import { ANY, BOOLEAN, fn, type FunctionDescriptor, named, NUMBER, STRING, TABLE, tupleOf, type TypeDescriptor, unionOf, VOID } from './type-descriptor';

export interface CatalogOverride {
    environment?: ApiEnvironment;
    type?: TypeDescriptor;
    returnType?: TypeDescriptor;
}

export const ELEMENT_TYPE_ALIASES: Readonly<Record<string, string>> = {
    MTASAObject: 'Object',
    connection: 'Connection',
};

export const ELEMENT_TYPE_PARENTS: Readonly<Record<string, string>> = {
    DxFont: 'Element',
    DxRenderTarget: 'Element',
    DxScreenSource: 'Element',
    DxShader: 'Element',
    DxTexture: 'Element',
    GuiButton: 'GuiElement',
    GuiElement: 'Element',
    GuiFont: 'Element',
    GuiRadioButton: 'GuiElement',
    Light: 'Element',
    Object: 'Element',
    Pickup: 'Element',
    Projectile: 'Element',
    Sound3D: 'Sound',
};

export const EXCLUDED_ELEMENT_TYPES: readonly string[] = ['QueryHandle'];

export interface OopMemberAddition {
    name: string;
    procedural: string;
}

export const OOP_MEMBER_ADDITIONS: Readonly<Record<string, readonly OopMemberAddition[]>> = {
    Connection: [{ name: 'destroy', procedural: 'destroyElement' }],
};

export const EXCLUDED_APIS: readonly string[] = ['exports'];

export interface CallbackTypeGap {
    kind: 'callback' | 'opaque';
    parameter: number;
    reason: string;
}

export const CALLBACK_TYPE_GAPS: Readonly<Record<string, CallbackTypeGap>> = {
    addEventHandler: { kind: 'callback', parameter: 2, reason: 'The upstream indexed GenericEventHandler callback requires event-name-dependent signatures.' },
    dbFree: { kind: 'opaque', parameter: 0, reason: 'The upstream HandleFunction alias incorrectly represents an opaque database query handle.' },
    dbPoll: { kind: 'opaque', parameter: 0, reason: 'The upstream HandleFunction alias incorrectly represents an opaque database query handle.' },
    dbQuery: { kind: 'callback', parameter: 0, reason: 'The upstream overloads reuse HandleFunction for both a callback and an opaque query handle.' },
    removeEventHandler: { kind: 'callback', parameter: 2, reason: 'The upstream indexed GenericEventHandler callback requires event-name-dependent signatures.' },
};

export interface EventSignatureOverride {
    environment: ApiEnvironment;
    type: FunctionDescriptor;
    reason: string;
}

export const EVENT_SIGNATURE_OVERRIDES: Readonly<Record<string, EventSignatureOverride>> = {
    onPlayerChangesProtectedData: {
        environment: 'server',
        type: fn([named('Element'), STRING, ANY], VOID, 3, false, ['element', 'key', 'value']),
        reason: 'The wiki page lists the parameters as description bullets and carries no Lua parameter block.',
    },
    onPlayerTriggerEventThreshold: {
        environment: 'server',
        type: fn([STRING], VOID, 1, false, ['eventName']),
        reason: 'The wiki page documents eventName inside a release template and carries no Lua parameter block.',
    },
};

const GENERIC_CALLBACK: TypeDescriptor = fn([], ANY, 0, true);

export const CATALOG_OVERRIDES: Readonly<Record<string, CatalogOverride>> = {
    addEventHandler: { type: fn([STRING, named('Element'), GENERIC_CALLBACK, BOOLEAN, STRING], BOOLEAN, 3) },
    createBrowser: { returnType: named('Browser') },
    dbConnect: { type: fn([STRING, STRING, STRING, STRING, STRING], named('Connection'), 2) },
    dbExec: { type: fn([named('Connection'), STRING, ANY], BOOLEAN, 2, true) },
    dbFree: { type: fn([ANY], BOOLEAN, 1) },
    dbPoll: { type: fn([ANY, NUMBER, BOOLEAN], TABLE, 2) },
    dbPrepareString: { type: fn([named('Connection'), STRING, ANY], STRING, 2, true) },
    dbQuery: { type: fn([unionOf([GENERIC_CALLBACK, named('Connection')]), ANY, ANY, ANY, ANY], ANY, 2, true) },
    dxCreateFont: { returnType: named('DxFont') },
    dxCreateRenderTarget: { returnType: named('DxRenderTarget') },
    dxCreateScreenSource: { returnType: named('DxScreenSource') },
    dxCreateShader: { returnType: tupleOf([named('DxShader'), STRING]) },
    guiCreateButton: { returnType: named('GuiButton') },
    guiCreateCheckBox: { returnType: named('GuiCheckbox') },
    guiCreateComboBox: { returnType: named('GuiCombobox') },
    guiCreateEdit: { returnType: named('GuiEdit') },
    guiCreateFont: { returnType: named('GuiFont') },
    guiCreateGridList: { returnType: named('GuiGridList') },
    guiCreateLabel: { returnType: named('GuiLabel') },
    guiCreateRadioButton: { returnType: named('GuiRadioButton') },
    guiCreateStaticImage: { returnType: named('GuiStaticImage') },
    guiCreateTab: { returnType: named('GuiTab') },
    guiCreateTabPanel: { returnType: named('GuiTabPanel') },
    guiCreateWindow: { returnType: named('GuiWindow') },
    playSound: { returnType: named('Sound') },
    playSound3D: { returnType: named('Sound3D') },
    removeEventHandler: { type: fn([STRING, named('Element'), GENERIC_CALLBACK], BOOLEAN, 3) },
    triggerEvent: { type: fn([STRING, named('Element')], BOOLEAN, 2, true) },
    triggerServerEvent: { type: fn([STRING, named('Element')], BOOLEAN, 2, true) },
    unbindKey: { type: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1) },
};

export const OOP_CONSTRUCTOR_OVERRIDES: Readonly<Record<string, TypeDescriptor>> = {
    File: fn([STRING], named('File'), 1),
};
