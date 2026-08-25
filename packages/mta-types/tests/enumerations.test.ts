import { describe, expect, it } from 'vitest';

import { findDeclaration } from '@mta-types/catalog';
import { extractValues, enumerationValues } from '@generator/wiki-enumeration-values';
import { PARAMETER_ENUMERATIONS, VALUE_TEMPLATES, templateTitles } from '@generator/wiki-enumerations';
import { readSnapshot, templateText } from '@generator/wiki-snapshot';

const SNAPSHOT = readSnapshot();

const VALUES = enumerationValues(templateText(SNAPSHOT));

function optionsOf(name: string, index: number): string[] {
    const type = findDeclaration(name)?.type;
    const parameter = type?.kind === 'function' ? type.parameters[index] : undefined;

    if (parameter?.kind === 'union') {
        return parameter.options.map((option) => (option.kind === 'literal' ? option.value : option.kind === 'named' ? option.name : option.kind));
    }

    return parameter?.kind === 'literal' ? [parameter.value] : [];
}

describe('literal parameter enumerations', () => {
    it('carries the wikitext of every value template in the snapshot', () => {
        const titles = new Set(SNAPSHOT.templates.map((template) => template.title));

        expect(templateTitles().filter((title) => !titles.has(title))).toEqual([]);
        expect(SNAPSHOT.templates.every((template) => template.revision > 0 && template.text.length > 0)).toBe(true);
    });

    it('reads the first column of a table template and stops at the first table', () => {
        expect(VALUES.get('enginePools')).toContain('vehicle');
        expect(VALUES.get('enginePools')).toHaveLength(20);
        expect(VALUES.get('physicalProperties')).toContain('mass');
        expect(VALUES.get('physicalProperties')).not.toContain('change_model');
        expect(VALUES.get('worldProperties')).not.toContain('RGB');
    });

    it('reads a bullet template whether the value is bold or quoted', () => {
        expect(VALUES.get('soundEffects')).toEqual(['gargle', 'compressor', 'echo', 'i3dl2reverb', 'distortion', 'chorus', 'parameq', 'reverb', 'flanger']);
        expect(VALUES.get('markerTypes')).toEqual(['checkpoint', 'ring', 'cylinder', 'arrow', 'corona']);
        expect(VALUES.get('vehicleDummies')).toContain('light_front_main');
    });

    it('holds every template above the size its curation recorded', () => {
        for (const [key, template] of Object.entries(VALUE_TEMPLATES)) {
            expect(VALUES.get(key)?.length ?? 0).toBeGreaterThanOrEqual(template.minimum);
        }
    });

    it('takes only quoted or bolded tokens out of a bullet list', () => {
        expect(extractValues('* \'\'\'alpha\'\'\'\n* "beta"\n* gamma - a note\n', 'bullet')).toEqual(['alpha', 'beta', 'gamma']);
        expect(extractValues('{|\n|-\n| one || two\n|-\n| three || four\n|}\n{|\n|-\n| five\n|}', 'table')).toEqual(['one', 'three']);
    });

    it('types the enumerated parameters of the shipped catalog', () => {
        expect(optionsOf('engineSetPoolCapacity', 0)).toContain('vehicle');
        expect(optionsOf('engineGetPoolCapacity', 0)).toEqual(optionsOf('engineSetPoolCapacity', 0));
        expect(optionsOf('createMarker', 3)).toEqual(['checkpoint', 'ring', 'cylinder', 'arrow', 'corona']);
        expect(optionsOf('dxDrawText', 8)).toEqual(['left', 'center', 'right']);
        expect(optionsOf('dxDrawText', 9)).toEqual(['top', 'center', 'bottom']);
        expect(optionsOf('getWeaponProperty', 1)).toEqual(['pro', 'std', 'poor']);
    });

    it('reads a value list documented under the parameter itself', () => {
        expect(optionsOf('getPostFXValue', 0)).toEqual(['Gamma', 'Brightness', 'Contrast', 'Saturation']);
        expect(optionsOf('setMarkerIcon', 1)).toEqual(['none', 'arrow']);
        expect(optionsOf('getVehicleComponentRotation', 2)).toEqual(['parent', 'root', 'world']);
        expect(optionsOf('dxCreateTexture', 1)).toEqual(['argb', 'dxt1', 'dxt3', 'dxt5']);
    });

    it('reads past a third bullet level instead of stopping at it', () => {
        expect(optionsOf('getWeaponFlags', 1)).toEqual(['disable_model', 'flags', 'instant_reload', 'shoot_if_out_of_range', 'shoot_if_blocked']);
    });

    it('unions the built-in font names with the DxFont element', () => {
        const font = optionsOf('dxDrawText', 7);

        expect(font).toContain('pricedown');
        expect(font).toContain('DxFont');
    });

    it('names a parameter for every curated entry', () => {
        for (const [name, entries] of Object.entries(PARAMETER_ENUMERATIONS)) {
            const declaration = findDeclaration(name);

            expect(declaration, `${name} is not declared`).not.toBeNull();
            expect(entries.length, `${name} carries no enumeration`).toBeGreaterThan(0);
        }
    });
});
