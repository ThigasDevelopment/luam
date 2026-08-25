export type ValueShape = 'table' | 'bullet';

export interface ValueTemplate {
    title: string;
    shape: ValueShape;
    minimum: number;
}

export const VALUE_TEMPLATES: Readonly<Record<string, ValueTemplate>> = {
    enginePools: { title: 'Template:Engine pools', shape: 'table', minimum: 15 },
    materialProperties: { title: 'Template:Material Properties', shape: 'table', minimum: 10 },
    physicalProperties: { title: 'Template:Physical Properties', shape: 'table', minimum: 10 },
    worldProperties: { title: 'Template:World Properties', shape: 'table', minimum: 10 },
    dxFonts: { title: 'Template:DxFonts', shape: 'bullet', minimum: 8 },
    soundEffects: { title: 'Template:Sound Effects', shape: 'bullet', minimum: 5 },
    vehicleDummies: { title: 'Template:VehicleDummies', shape: 'bullet', minimum: 8 },
    markerTypes: { title: 'Template:Marker types', shape: 'bullet', minimum: 4 },
};

export interface ParameterEnumeration {
    parameter: string;
    template?: string;
    values?: readonly string[];
    element?: string;
    page?: boolean;
}

const WEAPON_SKILLS = ['pro', 'std', 'poor'];

export const PARAMETER_ENUMERATIONS: Readonly<Record<string, readonly ParameterEnumeration[]>> = {
    createMarker: [{ parameter: 'theType', template: 'markerTypes' }],
    dxCreateTexture: [
        { parameter: 'textureFormat', page: true },
        { parameter: 'textureEdge', page: true },
    ],
    dxDrawText: [
        { parameter: 'alignX', values: ['left', 'center', 'right'] },
        { parameter: 'alignY', values: ['top', 'center', 'bottom'] },
        { parameter: 'font', template: 'dxFonts', element: 'DxFont' },
    ],
    dxGetFontHeight: [{ parameter: 'font', template: 'dxFonts', element: 'DxFont' }],
    dxGetTextSize: [{ parameter: 'font', template: 'dxFonts', element: 'DxFont' }],
    dxGetTexturePixels: [{ parameter: 'textureFormat', page: true }],
    dxGetTextWidth: [{ parameter: 'font', template: 'dxFonts', element: 'DxFont' }],
    engineGetObjectGroupPhysicalProperty: [{ parameter: 'property', template: 'physicalProperties' }],
    engineGetPoolCapacity: [{ parameter: 'pool', template: 'enginePools' }],
    engineGetPoolDefaultCapacity: [{ parameter: 'pool', template: 'enginePools' }],
    engineGetPoolUsedCapacity: [{ parameter: 'pool', template: 'enginePools' }],
    engineGetSurfaceProperties: [{ parameter: 'property', template: 'materialProperties' }],
    engineSetObjectGroupPhysicalProperty: [{ parameter: 'property', template: 'physicalProperties' }],
    engineSetPoolCapacity: [{ parameter: 'pool', template: 'enginePools' }],
    engineSetSurfaceProperties: [{ parameter: 'property', template: 'materialProperties' }],
    getChatboxLayout: [{ parameter: 'CVar', page: true }],
    getOriginalWeaponProperty: [{ parameter: 'weaponSkill', values: WEAPON_SKILLS }],
    getPostFXValue: [{ parameter: 'fxType', page: true }],
    getSoundEffectParameters: [{ parameter: 'effectName', template: 'soundEffects' }],
    getVehicleComponentPosition: [{ parameter: 'base', page: true }],
    getVehicleComponentRotation: [{ parameter: 'base', page: true }],
    getVehicleDummyPosition: [{ parameter: 'dummy', template: 'vehicleDummies' }],
    getVehicleModelDummyPosition: [{ parameter: 'dummy', template: 'vehicleDummies' }],
    getVehicleModelWheelSize: [{ parameter: 'wheelGroup', page: true }],
    getWeaponFlags: [{ parameter: 'theFlag', page: true }],
    getWeaponProperty: [{ parameter: 'weaponSkill', values: WEAPON_SKILLS }],
    getWorldProperty: [{ parameter: 'property', template: 'worldProperties' }],
    isPostFXEnabled: [{ parameter: 'fxType', page: true }],
    resetWorldProperty: [{ parameter: 'property', template: 'worldProperties' }],
    setElementData: [
        { parameter: 'syncMode', page: true },
        { parameter: 'clientChangesPolicy', page: true },
    ],
    setMarkerIcon: [{ parameter: 'icon', page: true }],
    setSoundEffectEnabled: [{ parameter: 'effectName', template: 'soundEffects' }],
    setSoundEffectParameter: [{ parameter: 'effectName', template: 'soundEffects' }],
    setVehicleComponentPosition: [{ parameter: 'base', page: true }],
    setVehicleComponentRotation: [{ parameter: 'base', page: true }],
    setVehicleDummyPosition: [{ parameter: 'dummy', template: 'vehicleDummies' }],
    setVehicleModelDummyPosition: [{ parameter: 'dummy', template: 'vehicleDummies' }],
    setWeaponProperty: [{ parameter: 'weaponSkill', values: WEAPON_SKILLS }],
    setWorldProperty: [{ parameter: 'property', template: 'worldProperties' }],
};

export function templateTitles(): string[] {
    return [...new Set(Object.values(VALUE_TEMPLATES).map((entry) => entry.title))].sort();
}
