/*
 * Date arithmetic and text handling for DateTimeField. Everything works in the browser's local
 * time; the model formats are ISO for a moment, `YYYY-MM-DD` for a day and `HH:MM` for a time.
 */

export const MODES = ['datetime', 'date', 'time'];

const pad = (n) => String(n).padStart(2, '0');

export function toModel(date, mode) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    if (mode === 'date') return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    if (mode === 'time') return `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    return date.toISOString();
}

export function fromModel(value, mode, now = new Date()) {
    if (!value) return null;

    if (mode === 'time') {
        const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
        if (!m) return null;
        const d = new Date(now);
        d.setHours(Number(m[1]), Number(m[2]), 0, 0);
        return d;
    }

    if (mode === 'date') {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (!m) return null;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0);
    }

    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDisplay(date, mode, locale) {
    if (!date) return '';
    const clock = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
    const day = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

    if (mode === 'time') return new Intl.DateTimeFormat(locale, clock).format(date);
    if (mode === 'date') return new Intl.DateTimeFormat(locale, day).format(date);

    return `${new Intl.DateTimeFormat(locale, day).format(date)} · ${new Intl.DateTimeFormat(locale, clock).format(date)}`;
}

/**
 * What a person types: `8.9.2026 14:00`, `8.9. 14:00`, `08.09.26`, `2026-09-08 14:00`,
 * `2026-09-08T14:00`, or just `14:00`, which keeps the day the field already holds.
 */
export function parseTyped(text, mode, base = null, now = new Date()) {
    const s = String(text ?? '').trim();
    if (s === '') return null;

    const time = /(\d{1,2}):(\d{2})\s*$/.exec(s);
    const hours = time ? Number(time[1]) : null;
    const minutes = time ? Number(time[2]) : null;
    if (time && (hours > 23 || minutes > 59)) return undefined;

    const datePart = time ? s.slice(0, time.index).trim() : s;
    let day = null;

    if (datePart !== '') {
        const dotted = /^(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?$/.exec(datePart);
        const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})T?$/.exec(datePart);

        if (dotted) {
            const year = dotted[3] ? Number(dotted[3].length === 2 ? `20${dotted[3]}` : dotted[3]) : now.getFullYear();
            day = new Date(year, Number(dotted[2]) - 1, Number(dotted[1]));
            if (day.getMonth() !== Number(dotted[2]) - 1) return undefined;
        } else if (iso) {
            day = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        } else {
            return undefined;
        }
    }

    if (mode === 'time') {
        if (!time) return undefined;
        const d = new Date(now);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }

    const result = new Date(day ?? base ?? now);
    if (day) result.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

    if (mode === 'date') {
        if (!day) return undefined;
        result.setHours(0, 0, 0, 0);
        return result;
    }

    if (time) {
        result.setHours(hours, minutes, 0, 0);
    } else if (!base) {
        result.setHours(0, 0, 0, 0);
    }

    return result;
}

/** Six rows of seven, so the grid never changes height between months. */
export function monthGrid(year, month, weekStart = 1) {
    const first = new Date(year, month, 1);
    const lead = (first.getDay() - weekStart + 7) % 7;
    const start = new Date(year, month, 1 - lead);
    const cells = [];

    for (let i = 0; i < 42; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        cells.push({ date, inMonth: date.getMonth() === month });
    }

    return cells;
}

export function weekdayNames(locale, weekStart = 1) {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // 4 Jan 1970 was a Sunday, so day n of that week is weekday n.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(1970, 0, 4 + ((weekStart + i) % 7))));
}

export function monthName(locale, year, month) {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

export function sameDay(a, b) {
    return Boolean(a && b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function snapMinutes(minute, step) {
    const snapped = Math.round(minute / step) * step;

    return snapped >= 60 ? 60 - step : snapped;
}

export function minuteOptions(step) {
    const safe = Math.min(60, Math.max(1, Math.round(step) || 1));

    return Array.from({ length: Math.ceil(60 / safe) }, (_, i) => i * safe).filter((m) => m < 60);
}

export function withinBounds(date, min, max) {
    if (!date) return true;
    if (min && date.getTime() < min.getTime()) return false;
    if (max && date.getTime() > max.getTime()) return false;

    return true;
}
