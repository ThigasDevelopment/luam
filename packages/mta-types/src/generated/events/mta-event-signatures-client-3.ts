import { BOOLEAN, fn, named, NUMBER, STRING, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_CLIENT_3: Readonly<Record<string, FunctionDescriptor>> = {
    onClientGUIBlur: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientGUIChanged: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'theElement',
        ],
    ),
    onClientGUIClick: fn(
        [
            STRING,
            STRING,
            NUMBER,
            NUMBER,
        ],
        VOID,
        4,
        false,
        [
            'button',
            'state',
            'absoluteX',
            'absoluteY',
        ],
    ),
    onClientGUIComboBoxAccepted: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'theElement',
        ],
    ),
    onClientGUIDoubleClick: fn(
        [
            STRING,
            STRING,
            NUMBER,
            NUMBER,
        ],
        VOID,
        4,
        false,
        [
            'button',
            'state',
            'absoluteX',
            'absoluteY',
        ],
    ),
    onClientGUIFocus: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientGUIMouseDown: fn(
        [
            STRING,
            NUMBER,
            NUMBER,
        ],
        VOID,
        3,
        false,
        [
            'button',
            'absoluteX',
            'absoluteY',
        ],
    ),
    onClientGUIMouseUp: fn(
        [
            STRING,
            NUMBER,
            NUMBER,
        ],
        VOID,
        3,
        false,
        [
            'button',
            'absoluteX',
            'absoluteY',
        ],
    ),
    onClientGUIMove: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientGUIScroll: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'scrolled',
        ],
    ),
    onClientGUISize: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientGUITabSwitched: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'theElement',
        ],
    ),
    onClientHUDRender: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientKey: fn(
        [
            STRING,
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'button',
            'pressOrRelease',
        ],
    ),
    onClientMarkerHit: fn(
        [
            named('Player'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'hitPlayer',
            'matchingDimension',
        ],
    ),
    onClientMarkerLeave: fn(
        [
            named('Player'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'leftPlayer',
            'matchingDimension',
        ],
    ),
    onClientMinimize: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientMouseEnter: fn(
        [
            NUMBER,
            NUMBER,
            named('Element'),
        ],
        VOID,
        3,
        false,
        [
            'absoluteX',
            'absoluteY',
            'leftGUI',
        ],
    ),
};
