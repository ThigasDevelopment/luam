export interface Channels {
    r: number;
    g: number;
    b: number;
}

const HEX = /^#([0-9a-fA-F]{6})$/;

const WEIGHTS: Channels = { r: 0.2126, g: 0.7152, b: 0.0722 };

export function parseHex(value: string): Channels {
    const match = HEX.exec(value);

    if (match === null) {
        throw new Error(`Not a six digit hex colour: ${value}`);
    }

    const digits = match[1] as string;

    return {
        r: Number.parseInt(digits.slice(0, 2), 16),
        g: Number.parseInt(digits.slice(2, 4), 16),
        b: Number.parseInt(digits.slice(4, 6), 16),
    };
}

function pair(value: number): string {
    return Math.min(255, Math.max(0, Math.round(value))).toString(16).padStart(2, '0');
}

export function toHex(channels: Channels): string {
    return `#${pair(channels.r)}${pair(channels.g)}${pair(channels.b)}`;
}

export function withAlpha(value: string, amount: number): string {
    return `${value}${pair(Math.min(1, Math.max(0, amount)) * 255)}`;
}

function toLinear(channel: number): number {
    const value = channel / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
    const clamped = Math.min(1, Math.max(0, value));
    const channel = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;

    return channel * 255;
}

function linearChannels(value: string): Channels {
    const channels = parseHex(value);

    return { r: toLinear(channels.r), g: toLinear(channels.g), b: toLinear(channels.b) };
}

function weighted(channels: Channels): number {
    return WEIGHTS.r * channels.r + WEIGHTS.g * channels.g + WEIGHTS.b * channels.b;
}

export function luminance(value: string): number {
    return weighted(linearChannels(value));
}

export function contrast(first: string, second: string): number {
    const a = luminance(first);
    const b = luminance(second);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

    return Math.round(ratio * 100) / 100;
}

function encode(channels: Channels): string {
    return toHex({ r: fromLinear(channels.r), g: fromLinear(channels.g), b: fromLinear(channels.b) });
}

function scaled(channels: Channels, factor: number): Channels {
    return { r: channels.r * factor, g: channels.g * factor, b: channels.b * factor };
}

function lifted(channels: Channels, amount: number): Channels {
    return {
        r: channels.r + (1 - channels.r) * amount,
        g: channels.g + (1 - channels.g) * amount,
        b: channels.b + (1 - channels.b) * amount,
    };
}

function reached(channels: Channels, target: number): Channels {
    const current = weighted(channels);
    const wanted = Math.min(1, Math.max(0, target));

    if (wanted <= current) {
        return current === 0 ? channels : scaled(channels, wanted / current);
    }

    return current >= 1 ? channels : lifted(channels, (wanted - current) / (1 - current));
}

export function withLuminance(seed: string, target: number): string {
    const first = encode(reached(linearChannels(seed), target));
    const drift = target - luminance(first);

    return Math.abs(drift) < 0.0005 ? first : encode(reached(linearChannels(first), target));
}

export function mix(first: string, second: string, amount: number): string {
    const a = linearChannels(first);
    const b = linearChannels(second);

    return encode({
        r: a.r + (b.r - a.r) * amount,
        g: a.g + (b.g - a.g) * amount,
        b: a.b + (b.b - a.b) * amount,
    });
}
