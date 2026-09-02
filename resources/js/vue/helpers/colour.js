/**
 * Colour arithmetic for the ColorPicker. Channels: r, g, b 0–255; a 0–1; h 0–360; s, v, l 0–100.
 */

export const FORMATS = ['hex', 'rgb', 'hsl', 'hsv'];

/** Twelve hues at one weight, a brown and a neutral — any two of them sit well side by side. */
export const DEFAULT_PRESETS = [
    '#e05252', '#e8743a', '#e0a63a', '#9ab53a', '#4fb35f', '#38a996', '#3bb6c8',
    '#3a8fe0', '#5b6fe0', '#8a5be0', '#c65bd0', '#e05a9a', '#a8724f', '#5c6470',
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function parseHex(input) {
    const raw = String(input ?? '').trim().replace(/^#/, '');

    if (!/^[0-9a-f]{3,4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/i.test(raw)) {
        return null;
    }

    const full = raw.length <= 4 ? [...raw].map((c) => c + c).join('') : raw;
    const n = parseInt(full.slice(0, 6), 16);
    const a = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;

    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
}

export function toHex({ r, g, b, a = 1 }, withAlpha = false) {
    const pair = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
    const base = `#${pair(r)}${pair(g)}${pair(b)}`;

    return withAlpha && a < 1 ? `${base}${pair(a * 255)}` : base;
}

export function rgbToHsv({ r, g, b }) {
    const rn = r / 255; const gn = g / 255; const bn = b / 255;
    const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn); const d = max - min;
    let h = 0;

    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h = (h * 60 + 360) % 360;
    }

    return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
}

export function hsvToRgb({ h, s, v }) {
    const sn = clamp(s, 0, 100) / 100; const vn = clamp(v, 0, 100) / 100;
    const c = vn * sn; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = vn - c;
    const sector = Math.floor((((h % 360) + 360) % 360) / 60);
    const [rn, gn, bn] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][sector];

    return { r: (rn + m) * 255, g: (gn + m) * 255, b: (bn + m) * 255 };
}

export function rgbToHsl({ r, g, b }) {
    const { h, s, v } = rgbToHsv({ r, g, b });
    const l = (v / 100) * (1 - (s / 100) / 2);
    const sl = l === 0 || l === 1 ? 0 : ((v / 100) - l) / Math.min(l, 1 - l);

    return { h, s: sl * 100, l: l * 100 };
}

export function format(rgba, kind, withAlpha = false) {
    const { r, g, b, a = 1 } = rgba;
    const alpha = withAlpha && a < 1;
    const pct = (n) => `${Math.round(n)}%`;
    const alphaText = alpha ? ` / ${Math.round(a * 100)}%` : '';

    switch (kind) {
        case 'rgb':
            return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)}${alphaText})`;
        case 'hsl': {
            const { h, s, l } = rgbToHsl(rgba);

            return `hsl(${Math.round(h)} ${pct(s)} ${pct(l)}${alphaText})`;
        }
        case 'hsv': {
            const { h, s, v } = rgbToHsv(rgba);

            return `hsv(${Math.round(h)} ${pct(s)} ${pct(v)}${alphaText})`;
        }
        default:
            return toHex(rgba, withAlpha);
    }
}
