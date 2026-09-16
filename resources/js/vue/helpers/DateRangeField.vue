<script setup>
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import Button from './Button.vue';
import IconButton from './IconButton.vue';
import Popover from './Popover.vue';
import { selectSkin } from './selectSkins.js';
import { useTheme } from './theme.js';
import {
    formatDayRange,
    formatDisplay,
    fromModel,
    monthGrid,
    monthName,
    parseTyped,
    sameDay,
    weekdayNames,
    withinBounds,
} from './dateTime.js';

defineOptions({ inheritAttrs: false });

/**
 * A span of days. Two months side by side; the first click starts the span, the second ends
 * it, the footer applies it. Shortcuts beside the calendar apply at once. The `field` variant
 * also understands a typed span such as `8.9. – 16.9.2026`. The model is
 * `{ from: 'YYYY-MM-DD' | null, to: 'YYYY-MM-DD' | null }`, in the browser's local time.
 */
const props = defineProps({
    modelValue: { type: Object, default: () => ({ from: null, to: null }) },
    /** Earliest and latest allowed day, as `YYYY-MM-DD`. */
    min: { type: [String, null], default: null },
    max: { type: [String, null], default: null },
    /**
     * `{ label, from, to }` rows beside the calendar; `from` and `to` are model strings or
     * Dates, or the row carries a `range()` function returning `{ from, to }`.
     */
    shortcuts: { type: Array, default: () => [] },
    /** How many months the calendar shows at once. */
    months: { type: Number, default: 2 },
    /** 1 = Monday … 7 = Sunday, 0 = Sunday too. */
    weekStart: { type: Number, default: 1 },
    /** BCP 47 tag for month and weekday names; the browser's own when omitted. */
    locale: { type: String, default: undefined },
    /** `field` is a form control with a typed input; `filter`, `filter-card` and `filter-pill` are toolbar triggers that colour a set span. */
    variant: { type: String, default: 'field' },
    /** The theme decides when unset. */
    shape: { type: String, default: null },
    size: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    /** The words the picker needs — the application owns them. */
    labels: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const attrs = useAttrs();
const field = useTheme('field');
const selectTheme = useTheme('select');

const WORDS = computed(() => ({
    open: 'Pick a span of days',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    clear: 'Clear',
    apply: 'Apply',
    ...props.labels,
}));

const isField = computed(() => props.variant === 'field');

const anchor = ref(null);
const open = ref(false);
const text = ref('');
const invalid = ref(false);

const from = computed(() => fromModel(props.modelValue?.from, 'date'));
const to = computed(() => fromModel(props.modelValue?.to, 'date'));
const minDate = computed(() => fromModel(props.min, 'date'));
const maxDate = computed(() => fromModel(props.max, 'date'));
const hasValue = computed(() => Boolean(from.value || to.value));

const display = computed(() => formatDayRange(from.value, to.value, props.locale));

watch(display, (value) => {
    text.value = value;
    invalid.value = false;
}, { immediate: true });

function publish(start, end) {
    const [first, last] = order(start, end);
    const clamped = first && !withinBounds(first, minDate.value, maxDate.value) ? null : first;
    const clampedEnd = last && !withinBounds(last, minDate.value, maxDate.value) ? null : last;

    emit('update:modelValue', { from: toDay(clamped), to: toDay(clampedEnd ?? clamped) });
}

function toDay(date) {
    if (!date) return null;

    const pad = (n) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function order(a, b) {
    if (!a || !b) return [a ?? b ?? null, a && b ? b : null];

    return a.getTime() <= b.getTime() ? [a, b] : [b, a];
}

/* ----- The frame of the field variant, the skin of the filter ones ----- */

const frame = computed(() => [
    'inline-flex items-center overflow-hidden',
    (invalid.value ? field.frameInvalid : field.frame) ?? '',
    field.shapes[props.shape ?? field.shape] ?? field.shapes.rounded,
    field.sizes[props.size ?? field.size] ?? field.sizes.md,
    props.disabled ? 'cursor-not-allowed opacity-60' : '',
    attrs.class ?? '',
]);

const FRAME_INPUT = 'h-full w-full min-w-0 border-0 bg-transparent px-2.5 tabular-nums focus:outline-none dark:text-il-neutral-100';

const FRAME_BUTTON =
    'flex h-full shrink-0 items-center justify-center px-2 text-il-neutral-500 transition-colors ' +
    'hover:bg-il-neutral-100 hover:text-il-neutral-700 active:bg-il-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:bg-transparent dark:text-il-neutral-400 dark:hover:bg-white/5 dark:hover:text-il-neutral-200 dark:active:bg-white/15';

const skin = computed(() => selectSkin(props.variant, 'filter', selectTheme.skins));

/* ----- Typing ----- */

function commitTyped() {
    if (text.value === display.value) {
        invalid.value = false;

        return;
    }

    const raw = text.value.trim();

    if (raw === '') {
        invalid.value = false;
        publish(null, null);

        return;
    }

    // A dash between two spaces or an en dash separates the days; a bare hyphen may belong to an ISO date.
    const parts = raw.split(/\s+[–-]\s+|–/).map((part) => part.trim()).filter(Boolean).slice(0, 2);
    const parsed = parts.map((part) => parseTyped(part, 'date'));

    if (parsed.length === 0 || parsed.some((day) => day === undefined || day === null)) {
        invalid.value = true;

        return;
    }

    invalid.value = false;
    publish(parsed[0], parsed[1] ?? parsed[0]);
}

function onKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        commitTyped();
    }
    if (event.key === 'ArrowDown' && !open.value) {
        event.preventDefault();
        show();
    }
}

/* ----- The draft inside the popover ----- */

const draftFrom = ref(null);
const draftTo = ref(null);
const hovered = ref(null);
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const focusedDay = ref(null);

function show() {
    if (props.disabled) return;

    const start = from.value ?? new Date();
    draftFrom.value = from.value ? new Date(from.value) : null;
    draftTo.value = to.value ? new Date(to.value) : null;
    hovered.value = null;
    viewYear.value = start.getFullYear();
    viewMonth.value = start.getMonth();
    focusedDay.value = new Date(start);
    open.value = true;
}

function close() {
    open.value = false;
}

function apply() {
    publish(draftFrom.value, draftTo.value ?? draftFrom.value);
    close();
}

function clear() {
    publish(null, null);
    close();
}

/* ----- Calendar ----- */

const weekdays = computed(() => weekdayNames(props.locale, props.weekStart));
const today = new Date();

const pages = computed(() => Array.from({ length: Math.max(1, props.months) }, (_, offset) => {
    const first = new Date(viewYear.value, viewMonth.value + offset, 1);

    return {
        year: first.getFullYear(),
        month: first.getMonth(),
        heading: monthName(props.locale, first.getFullYear(), first.getMonth()),
        grid: monthGrid(first.getFullYear(), first.getMonth(), props.weekStart),
    };
}));

function shiftMonth(by) {
    const next = new Date(viewYear.value, viewMonth.value + by, 1);
    viewYear.value = next.getFullYear();
    viewMonth.value = next.getMonth();
}

function dayAllowed(date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    return (!minDate.value || endOfDay >= minDate.value) && (!maxDate.value || startOfDay <= maxDate.value);
}

function pickDay(date) {
    if (!dayAllowed(date)) return;

    focusedDay.value = new Date(date);

    if (!draftFrom.value || draftTo.value) {
        draftFrom.value = new Date(date);
        draftTo.value = null;

        return;
    }

    [draftFrom.value, draftTo.value] = order(draftFrom.value, new Date(date));
}

/** The span the calendar paints: the draft, or the draft's start up to the day under the pointer. */
const painted = computed(() => {
    if (!draftFrom.value) return [null, null];
    if (draftTo.value) return [draftFrom.value, draftTo.value];

    return hovered.value ? order(draftFrom.value, hovered.value) : [draftFrom.value, draftFrom.value];
});

function isEnd(date) {
    return sameDay(date, painted.value[0]) || sameDay(date, painted.value[1]);
}

function isBetween(date) {
    const [start, end] = painted.value;

    return Boolean(start && end) && date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

// The ends are solid and the days between a clear tint, stronger than a single date: a span has to read as one block. Today only a ring, the rest stay ghosts.
function isPaintedEnd(cell) {
    return cell.inMonth && isEnd(cell.date);
}

function isPaintedBetween(cell) {
    return cell.inMonth && isBetween(cell.date);
}

// With more than one month on screen, a neighbouring day would stand twice.
const showsOutsideDays = computed(() => pages.value.length === 1);

function dayTone(cell) {
    if (isPaintedEnd(cell)) return 'cta';

    return isPaintedBetween(cell) ? 'primary' : 'ghost';
}

function dayClass(cell) {
    if (isPaintedEnd(cell)) return 'font-semibold';
    if (isPaintedBetween(cell)) return '';
    if (sameDay(cell.date, today)) return 'ring-1 ring-inset ring-il-neutral-200 dark:ring-white/10';

    return cell.inMonth ? '' : 'opacity-50';
}

function moveFocus(days) {
    const next = new Date(focusedDay.value ?? draftFrom.value ?? new Date());
    next.setDate(next.getDate() + days);
    focusedDay.value = next;

    const last = new Date(viewYear.value, viewMonth.value + pages.value.length - 1, 1);
    const before = next < new Date(viewYear.value, viewMonth.value, 1);
    const after = next.getFullYear() > last.getFullYear() || (next.getFullYear() === last.getFullYear() && next.getMonth() > last.getMonth());

    if (before || after) {
        viewYear.value = next.getFullYear();
        viewMonth.value = after ? next.getMonth() - (pages.value.length - 1) : next.getMonth();
    }

    nextTick(() => document.getElementById(dayId(next))?.focus());
}

function onGridKey(event) {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

    if (moves[event.key] !== undefined) {
        event.preventDefault();
        moveFocus(moves[event.key]);
    }
    if (event.key === 'Enter' && focusedDay.value) {
        event.preventDefault();
        pickDay(focusedDay.value);
    }
}

const uid = `drf-${Math.random().toString(36).slice(2, 8)}`;
const dayId = (date) => `${uid}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/* ----- Shortcuts ----- */

function resolveShortcut(shortcut) {
    const raw = typeof shortcut.range === 'function' ? shortcut.range() : shortcut;
    const toDate = (value) => (value instanceof Date ? value : fromModel(value, 'date'));
    const start = toDate(raw?.from);
    const end = toDate(raw?.to);

    return start || end ? order(start, end ?? start) : null;
}

function isShortcutActive(shortcut) {
    const range = resolveShortcut(shortcut);

    return Boolean(range) && sameDay(range[0], from.value) && sameDay(range[1] ?? range[0], to.value);
}

function pickShortcut(shortcut) {
    const range = resolveShortcut(shortcut);
    if (!range) return;

    publish(range[0], range[1]);
    close();
}

const popoverWidth = computed(() => {
    const desired = pages.value.length * 288 + (props.shortcuts.length ? 160 : 0);

    return Math.min(desired, (typeof window === 'undefined' ? desired : window.innerWidth) - 32);
});

const footerText = computed(() => formatDayRange(painted.value[0], painted.value[1], props.locale));
</script>

<template>
    <span
        ref="anchor"
        :class="['il-date-range-field', ...(isField ? frame : ['inline-flex'])]"
        :data-variant="variant"
        :data-state="open ? 'open' : (invalid ? 'invalid' : (hasValue ? 'set' : 'empty'))"
        :data-disabled="disabled || undefined"
    >
        <template v-if="isField">
            <input
                type="text"
                :value="text"
                :class="['il-date-range-field__input', FRAME_INPUT]"
                :disabled="disabled"
                :placeholder="placeholder"
                :aria-invalid="invalid ? 'true' : 'false'"
                autocomplete="off"
                v-bind="{ ...attrs, class: undefined }"
                @input="text = $event.target.value"
                @blur="commitTyped"
                @keydown="onKeydown"
            />
            <button
                type="button"
                :class="['il-date-range-field__open', FRAME_BUTTON]"
                :disabled="disabled"
                :aria-label="WORDS.open"
                :aria-expanded="open ? 'true' : 'false'"
                @click="open ? close() : show()"
            >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/></svg>
            </button>
        </template>

        <!-- The whole trigger opens the calendar; the button inside stays the control a keyboard reaches. -->
        <div
            v-else
            v-bind="{ ...attrs, class: undefined }"
            :class="['il-date-range-field__trigger', skin.base, 'cursor-pointer', hasValue ? skin.on : skin.off, disabled ? 'cursor-not-allowed opacity-60' : '', attrs.class ?? '']"
            @click="disabled ? null : (open ? close() : show())"
        >
            <button
                type="button"
                :disabled="disabled"
                :aria-label="WORDS.open"
                :aria-expanded="open ? 'true' : 'false'"
                class="flex min-w-0 flex-1 items-center gap-1.5 text-left focus:outline-none"
            >
                <svg class="h-4 w-4 shrink-0 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/></svg>
                <span class="max-w-[18rem] truncate tabular-nums">{{ hasValue ? display : placeholder }}</span>
            </button>
            <IconButton
                v-if="hasValue && !disabled"
                :label="WORDS.clear"
                size="xs"
                tone="plain"
                :tooltip="false"
                class="ml-1"
                :class="skin.clear"
                @click.stop="clear"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </IconButton>
            <span v-else class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                <svg class="h-4 w-4 opacity-50 transition-transform" :class="open ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
            </span>
        </div>

        <Popover :anchor="anchor" :open="open" :width="popoverWidth" @close="close">
            <div class="il-date-range-field__picker flex flex-wrap">
                <div v-if="shortcuts.length" class="il-date-range-field__shortcuts flex w-40 flex-col gap-0.5 border-r border-il-neutral-200 p-2 dark:border-white/10">
                    <Button
                        v-for="shortcut in shortcuts"
                        :key="shortcut.label"
                        size="sm"
                        :tone="isShortcutActive(shortcut) ? 'primary' : 'ghost'"
                        class="justify-start"
                        @click="pickShortcut(shortcut)"
                    >{{ shortcut.label }}</Button>
                </div>

                <div class="il-date-range-field__months flex flex-1 flex-wrap" @mouseleave="hovered = null">
                    <div v-for="(page, index) in pages" :key="`${page.year}-${page.month}`" class="il-date-range-field__calendar w-72 p-3">
                        <div class="flex items-center justify-between">
                            <IconButton v-if="index === 0" size="md" :label="WORDS.previousMonth" :tooltip="false" @click="shiftMonth(-1)">
                                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
                            </IconButton>
                            <span v-else class="h-9 w-9" aria-hidden="true"></span>
                            <span class="text-sm font-semibold text-il-neutral-900 dark:text-il-neutral-100">{{ page.heading }}</span>
                            <IconButton v-if="index === pages.length - 1" size="md" :label="WORDS.nextMonth" :tooltip="false" @click="shiftMonth(1)">
                                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
                            </IconButton>
                            <span v-else class="h-9 w-9" aria-hidden="true"></span>
                        </div>

                        <div class="mt-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-wide text-il-neutral-500 dark:text-il-neutral-400">
                            <span v-for="name in weekdays" :key="name" class="py-1">{{ name }}</span>
                        </div>

                        <div role="grid" class="il-date-range-field__days grid grid-cols-7 gap-y-0.5" @keydown="onGridKey">
                            <template v-for="cell in page.grid" :key="cell.date.getTime()">
                                <span v-if="!cell.inMonth && !showsOutsideDays" role="gridcell" aria-hidden="true" class="mx-auto h-9 w-9"></span>
                                <Button
                                    v-else
                                    :id="dayId(cell.date)"
                                    role="gridcell"
                                    shape="pill"
                                    size="md"
                                    :tone="dayTone(cell)"
                                    :tabindex="sameDay(cell.date, focusedDay) ? 0 : -1"
                                    :aria-selected="isPaintedEnd(cell) || isPaintedBetween(cell) ? 'true' : 'false'"
                                    :aria-label="formatDisplay(cell.date, 'date', locale)"
                                    :disabled="!dayAllowed(cell.date)"
                                    class="mx-auto w-9 px-0 tabular-nums"
                                    :class="dayClass(cell)"
                                    @mouseenter="hovered = cell.date"
                                    @click="pickDay(cell.date)"
                                >{{ cell.date.getDate() }}</Button>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <div class="il-date-range-field__footer flex items-center justify-between gap-2 border-t border-il-neutral-200 p-2 dark:border-white/10">
                <Button size="sm" tone="ghost" @click="clear">{{ WORDS.clear }}</Button>
                <div class="flex items-center gap-4">
                    <span class="il-date-range-field__draft text-xs tabular-nums text-il-neutral-500 dark:text-il-neutral-400">{{ footerText }}</span>
                    <Button size="sm" tone="cta" :disabled="!draftFrom" @click="apply">{{ WORDS.apply }}</Button>
                </div>
            </div>
        </Popover>
    </span>
</template>
