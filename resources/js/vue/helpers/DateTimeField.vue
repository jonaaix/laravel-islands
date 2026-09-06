<script setup>
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import Button from './Button.vue';
import IconButton from './IconButton.vue';
import Popover from './Popover.vue';
import { FIELD_SHAPES, FIELD_SIZES } from './fieldStyles.js';
import {
    formatDisplay,
    fromModel,
    minuteOptions,
    monthGrid,
    monthName,
    parseTyped,
    sameDay,
    snapMinutes,
    toModel,
    weekdayNames,
    withinBounds,
} from './dateTime.js';

defineOptions({ inheritAttrs: false });

/**
 * A field for a moment, a day or a time of day. Typed input is understood in the common
 * shapes; the button beside it opens a calendar and two clock columns, where the choice is a
 * draft until it is applied. Works in the browser's local time; the model is ISO for a
 * moment, `YYYY-MM-DD` for a day, `HH:MM` for a time.
 */
const props = defineProps({
    modelValue: { type: [String, null], default: null },
    /** `datetime` · `date` · `time` */
    mode: { type: String, default: 'datetime' },
    /** Minutes between two entries of the minute column; `1` lists every minute. */
    minuteStep: { type: Number, default: 5 },
    /** Earliest and latest allowed value, in the model's format. */
    min: { type: [String, null], default: null },
    max: { type: [String, null], default: null },
    /** `{ label, value }` rows above the calendar; `value` is a Date, a model string or a function returning either. */
    shortcuts: { type: Array, default: () => [] },
    /** 1 = Monday … 7 = Sunday, 0 = Sunday too. */
    weekStart: { type: Number, default: 1 },
    /** BCP 47 tag for month and weekday names; the browser's own when omitted. */
    locale: { type: String, default: undefined },
    shape: { type: String, default: 'rounded' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    /** The words the picker needs — the application owns them. */
    labels: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const attrs = useAttrs();

const WORDS = computed(() => ({
    open: 'Pick a date and time',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Earlier',
    nextYear: 'Later',
    chooseMonth: 'Choose month or year',
    today: 'Today',
    hours: 'Hours',
    minutes: 'Minutes',
    clear: 'Clear',
    apply: 'Apply',
    ...props.labels,
}));

const hasCalendar = computed(() => props.mode !== 'time');
const hasClock = computed(() => props.mode !== 'date');

const anchor = ref(null);
const open = ref(false);
const text = ref('');
const invalid = ref(false);

const value = computed(() => fromModel(props.modelValue, props.mode));
const minDate = computed(() => fromModel(props.min, props.mode));
const maxDate = computed(() => fromModel(props.max, props.mode));

watch(value, (date) => {
    text.value = formatDisplay(date, props.mode, props.locale);
    invalid.value = false;
}, { immediate: true });

function publish(date) {
    const clamped = date && props.mode !== 'time' && !withinBounds(date, minDate.value, maxDate.value) ? null : date;

    emit('update:modelValue', toModel(clamped, props.mode));
    text.value = formatDisplay(clamped, props.mode, props.locale);
}

/* ----- The frame, as NumberField draws it around its stepper ----- */

const frame = computed(() => [
    'inline-flex items-center overflow-hidden border bg-white dark:bg-gray-800 focus-within:ring-1',
    invalid.value
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60'
        : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-primary-500 dark:border-white/10',
    FIELD_SHAPES[props.shape] ?? FIELD_SHAPES.rounded,
    FIELD_SIZES[props.size] ?? FIELD_SIZES.md,
    props.disabled ? 'cursor-not-allowed opacity-60' : '',
    attrs.class ?? '',
]);

const FRAME_INPUT = 'h-full w-full min-w-0 border-0 bg-transparent px-2.5 tabular-nums focus:outline-none dark:text-gray-100';

const FRAME_BUTTON =
    'flex h-full shrink-0 items-center justify-center px-2 text-gray-500 transition-colors ' +
    'hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:active:bg-white/15';

/* ----- Typing ----- */

function commitTyped() {
    // The display wording is not a typed shape, so an untouched field is left alone.
    if (text.value === formatDisplay(value.value, props.mode, props.locale)) {
        invalid.value = false;

        return;
    }

    const parsed = parseTyped(text.value, props.mode, value.value);

    if (parsed === undefined) {
        invalid.value = true;

        return;
    }

    invalid.value = false;
    publish(parsed);
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

const draft = ref(null);
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const focusedDay = ref(null);

function show() {
    if (props.disabled) return;

    const start = value.value ?? defaultDraft();
    draft.value = new Date(start);
    viewYear.value = start.getFullYear();
    viewMonth.value = start.getMonth();
    focusedDay.value = new Date(start);
    view.value = 'days';
    open.value = true;
    nextTick(scrollClockIntoView);
}

function defaultDraft() {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(snapMinutes(d.getMinutes(), props.minuteStep));
    if (props.mode === 'date') d.setHours(0, 0, 0, 0);

    return d;
}

function close() {
    open.value = false;
}

function apply() {
    publish(draft.value);
    close();
}

function clear() {
    publish(null);
    close();
}

/* ----- Calendar ----- */

const weekdays = computed(() => weekdayNames(props.locale, props.weekStart));
const grid = computed(() => monthGrid(viewYear.value, viewMonth.value, props.weekStart));
const heading = computed(() => monthName(props.locale, viewYear.value, viewMonth.value));
const today = new Date();

function shiftMonth(by) {
    const next = new Date(viewYear.value, viewMonth.value + by, 1);
    viewYear.value = next.getFullYear();
    viewMonth.value = next.getMonth();
}

/* ----- Jumping: the heading opens a month grid, its year a year grid ----- */

const view = ref('days');
const monthNames = computed(() => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(new Date(2000, m, 1))));
// Whole decades, so the page a year sits on is always the same one: 2020 – 2029, 2030 – 2039.
const decade = (year) => Math.floor(year / 10) * 10;
const yearPage = ref(null);
const years = computed(() => {
    const first = yearPage.value ?? decade(viewYear.value);

    return Array.from({ length: 10 }, (_, i) => first + i);
});

function toggleHeading() {
    view.value = view.value === 'days' ? 'months' : view.value === 'months' ? 'years' : 'days';
    if (view.value === 'years') yearPage.value = decade(viewYear.value);
}

function shiftView(by) {
    if (view.value === 'days') shiftMonth(by);
    if (view.value === 'months') viewYear.value += by;
    if (view.value === 'years') yearPage.value = (yearPage.value ?? decade(viewYear.value)) + by * 10;
}

function pickMonth(month) {
    viewMonth.value = month;
    view.value = 'days';
}

function pickYear(year) {
    viewYear.value = year;
    view.value = 'months';
}

const navLabels = computed(() => (view.value === 'days'
    ? [WORDS.value.previousMonth, WORDS.value.nextMonth]
    : [WORDS.value.previousYear, WORDS.value.nextYear]));

function dayAllowed(date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    return (!minDate.value || endOfDay >= minDate.value) && (!maxDate.value || startOfDay <= maxDate.value);
}

function pickDay(date) {
    if (!dayAllowed(date)) return;

    const next = new Date(draft.value ?? defaultDraft());
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    draft.value = next;
    focusedDay.value = new Date(date);

    if (!hasClock.value) apply();
}

function moveFocus(days) {
    const next = new Date(focusedDay.value ?? draft.value ?? new Date());
    next.setDate(next.getDate() + days);
    focusedDay.value = next;
    if (next.getMonth() !== viewMonth.value || next.getFullYear() !== viewYear.value) {
        viewYear.value = next.getFullYear();
        viewMonth.value = next.getMonth();
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

const uid = `dtf-${Math.random().toString(36).slice(2, 8)}`;
const dayId = (date) => `${uid}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

// Every cell is a Button: the chosen day speaks with the CTA tone, today with the primary tint, the rest stay ghosts.
function dayTone(cell) {
    if (sameDay(cell.date, draft.value)) return 'cta';
    if (sameDay(cell.date, today)) return 'primary';

    return 'ghost';
}

/* ----- Clock ----- */

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = computed(() => minuteOptions(props.minuteStep));
const hourList = ref(null);
const minuteList = ref(null);

const draftHour = computed(() => draft.value?.getHours() ?? null);
const draftMinute = computed(() => draft.value?.getMinutes() ?? null);

function setHour(hour) {
    const next = new Date(draft.value ?? defaultDraft());
    next.setHours(hour);
    draft.value = next;
}

function setMinute(minute) {
    const next = new Date(draft.value ?? defaultDraft());
    next.setMinutes(minute, 0, 0);
    draft.value = next;
}

function scrollClockIntoView() {
    [hourList.value, minuteList.value].forEach((list) => {
        const active = list?.querySelector('[aria-selected="true"]');
        if (active) list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
    });
}

function onClockKey(event, options, current, set) {
    const moves = { ArrowUp: -1, ArrowDown: 1 };
    if (moves[event.key] === undefined) return;

    event.preventDefault();
    const index = Math.max(0, options.indexOf(current));
    const next = options[Math.min(options.length - 1, Math.max(0, index + moves[event.key]))];
    set(next);
    nextTick(scrollClockIntoView);
}

/* ----- Shortcuts ----- */

function resolveShortcut(shortcut) {
    const raw = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value;
    const date = raw instanceof Date ? raw : fromModel(raw, props.mode);

    return date && !Number.isNaN(date.getTime()) ? date : null;
}

function pickShortcut(shortcut) {
    const date = resolveShortcut(shortcut);
    if (!date) return;

    publish(date);
    close();
}

const pad = (n) => String(n).padStart(2, '0');

const CLOCK_LIST =
    'slim-scrollbar absolute inset-y-0 w-1/2 overflow-y-auto px-2 py-2 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500';

const popoverWidth = computed(() => {
    // The clock alone still needs room for its footer.
    const desired = hasCalendar.value ? 288 + (hasClock.value ? 137 : 0) : 216;

    return Math.min(desired, (typeof window === 'undefined' ? desired : window.innerWidth) - 32);
});
</script>

<template>
    <span ref="anchor" :class="frame">
        <input
            type="text"
            :value="text"
            :class="FRAME_INPUT"
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
            :class="FRAME_BUTTON"
            :disabled="disabled"
            :aria-label="WORDS.open"
            :aria-expanded="open ? 'true' : 'false'"
            @click="open ? close() : show()"
        >
            <svg v-if="hasCalendar" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/></svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clip-rule="evenodd"/></svg>
        </button>

        <Popover :anchor="anchor" :open="open" :width="popoverWidth" @close="close">
            <div v-if="shortcuts.length" class="flex flex-wrap gap-1.5 border-b border-gray-200 p-2 dark:border-white/10">
                <Button v-for="shortcut in shortcuts" :key="shortcut.label" size="sm" tone="secondary" @click="pickShortcut(shortcut)">{{ shortcut.label }}</Button>
            </div>

            <div class="flex flex-wrap">
                <div v-if="hasCalendar" class="w-72 p-3">
                    <div class="flex items-center justify-between">
                        <IconButton size="md" :label="navLabels[0]" :tooltip="false" @click="shiftView(-1)">
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
                        </IconButton>
                        <Button size="sm" tone="ghost" :aria-label="WORDS.chooseMonth" class="font-semibold text-gray-900 dark:text-gray-100" @click="toggleHeading">
                            {{ view === 'years' ? `${years[0]} – ${years[years.length - 1]}` : view === 'months' ? viewYear : heading }}
                        </Button>
                        <IconButton size="md" :label="navLabels[1]" :tooltip="false" @click="shiftView(1)">
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
                        </IconButton>
                    </div>

                    <div v-if="view === 'months'" class="mt-2 grid h-[15.5rem] grid-cols-3 content-start gap-1">
                        <Button
                            v-for="(name, month) in monthNames"
                            :key="name"
                            size="md"
                            :tone="month === viewMonth ? 'cta' : 'ghost'"
                            @click="pickMonth(month)"
                        >{{ name }}</Button>
                    </div>

                    <div v-else-if="view === 'years'" class="mt-2 grid h-[15.5rem] grid-cols-5 content-start gap-1">
                        <Button
                            v-for="year in years"
                            :key="year"
                            size="md"
                            :tone="year === viewYear ? 'cta' : 'ghost'"
                            class="w-full px-0 tabular-nums"
                            @click="pickYear(year)"
                        >{{ year }}</Button>
                    </div>

                    <div v-if="view === 'days'" class="mt-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <span v-for="name in weekdays" :key="name" class="py-1">{{ name }}</span>
                    </div>

                    <div v-if="view === 'days'" role="grid" class="grid grid-cols-7 gap-y-0.5" @keydown="onGridKey">
                        <Button
                            v-for="cell in grid"
                            :id="dayId(cell.date)"
                            :key="cell.date.getTime()"
                            role="gridcell"
                            shape="pill"
                            size="md"
                            :tone="dayTone(cell)"
                            :tabindex="sameDay(cell.date, focusedDay) ? 0 : -1"
                            :aria-selected="sameDay(cell.date, draft) ? 'true' : 'false'"
                            :aria-label="formatDisplay(cell.date, 'date', locale)"
                            :disabled="!dayAllowed(cell.date)"
                            class="mx-auto w-9 px-0 tabular-nums"
                            :class="cell.inMonth || sameDay(cell.date, draft) ? '' : 'opacity-50'"
                            @click="pickDay(cell.date)"
                        >{{ cell.date.getDate() }}</Button>
                    </div>

                    <div class="mt-2 flex justify-end">
                        <Button size="sm" tone="secondary" @click="pickDay(new Date())">{{ WORDS.today }}</Button>
                    </div>
                </div>

                <!-- Absolutely placed inside a stretched box, so the columns take the calendar's height instead of dictating it. -->
                <div v-if="hasClock" class="relative self-stretch border-gray-200 dark:border-white/10" :class="hasCalendar ? 'w-[136px] border-l' : 'h-72 w-full'">
                    <div
                        ref="hourList"
                        role="listbox"
                        tabindex="0"
                        :aria-label="WORDS.hours"
                        :class="[CLOCK_LIST, 'left-0']"
                        @keydown="onClockKey($event, hours, draftHour, setHour)"
                    >
                        <Button
                            v-for="hour in hours"
                            :key="hour"
                            role="option"
                            size="sm"
                            tabindex="-1"
                            full-width
                            :tone="draftHour === hour ? 'cta' : 'ghost'"
                            :aria-selected="draftHour === hour ? 'true' : 'false'"
                            class="my-0.5 px-0 tabular-nums"
                            @click="setHour(hour)"
                        >{{ pad(hour) }}</Button>
                    </div>
                    <div
                        ref="minuteList"
                        role="listbox"
                        tabindex="0"
                        :aria-label="WORDS.minutes"
                        :class="[CLOCK_LIST, 'right-0 border-l border-gray-200 dark:border-white/10']"
                        @keydown="onClockKey($event, minutes, draftMinute, setMinute)"
                    >
                        <Button
                            v-for="minute in minutes"
                            :key="minute"
                            role="option"
                            size="sm"
                            tabindex="-1"
                            full-width
                            :tone="draftMinute === minute ? 'cta' : 'ghost'"
                            :aria-selected="draftMinute === minute ? 'true' : 'false'"
                            class="my-0.5 px-0 tabular-nums"
                            @click="setMinute(minute)"
                        >{{ pad(minute) }}</Button>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between gap-2 border-t border-gray-200 p-2 dark:border-white/10">
                <Button size="sm" tone="ghost" @click="clear">{{ WORDS.clear }}</Button>
                <div class="flex items-center gap-2">
                    <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ formatDisplay(draft, mode, locale) }}</span>
                    <Button v-if="hasClock" size="sm" tone="cta" @click="apply">{{ WORDS.apply }}</Button>
                </div>
            </div>
        </Popover>
    </span>
</template>
