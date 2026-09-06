<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import Button from './Button.vue';
import IconButton from './IconButton.vue';
import Popover from './Popover.vue';
import { fieldClasses } from './fieldStyles.js';
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

const WORDS = computed(() => ({
    open: 'Pick a date and time',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
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
const input = ref(null);
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

function dayClass(cell) {
    const selected = sameDay(cell.date, draft.value);
    const isToday = sameDay(cell.date, today);

    if (selected) return 'bg-primary-500 font-semibold text-white';
    if (!dayAllowed(cell.date)) return 'text-gray-300 line-through dark:text-gray-600';
    if (!cell.inMonth) return 'text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/10';
    if (isToday) return 'font-semibold text-primary-600 ring-1 ring-inset ring-primary-300 hover:bg-primary-50 dark:text-primary-300 dark:ring-primary-500/50 dark:hover:bg-primary-500/10';

    return 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10';
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

const popoverWidth = computed(() => {
    // The clock alone still needs room for its footer.
    const desired = hasCalendar.value ? 288 + (hasClock.value ? 137 : 0) : 216;

    return Math.min(desired, (typeof window === 'undefined' ? desired : window.innerWidth) - 32);
});

const inputClasses = computed(() => fieldClasses({
    shape: props.shape,
    size: props.size,
    tabular: true,
    extra: `pr-10 ${invalid.value ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60' : ''}`,
}));
</script>

<template>
    <div ref="anchor" class="date-time-field relative">
        <input
            ref="input"
            type="text"
            :value="text"
            :class="inputClasses"
            :disabled="disabled"
            :placeholder="placeholder"
            :aria-invalid="invalid ? 'true' : 'false'"
            autocomplete="off"
            @input="text = $event.target.value"
            @blur="commitTyped"
            @keydown="onKeydown"
        />
        <button
            type="button"
            class="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-400 dark:hover:text-white"
            :disabled="disabled"
            :aria-label="WORDS.open"
            :aria-expanded="open ? 'true' : 'false'"
            @click="open ? close() : show()"
        >
            <svg v-if="hasCalendar" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </button>

        <Popover :anchor="anchor" :open="open" :width="popoverWidth" @close="close">
            <div v-if="shortcuts.length" class="flex flex-wrap gap-1.5 border-b border-gray-200 p-2 dark:border-white/10">
                <Button v-for="shortcut in shortcuts" :key="shortcut.label" size="sm" tone="secondary" @click="pickShortcut(shortcut)">{{ shortcut.label }}</Button>
            </div>

            <div class="flex flex-wrap">
                <div v-if="hasCalendar" class="w-72 p-3">
                    <div class="flex items-center justify-between">
                        <IconButton size="sm" :label="WORDS.previousMonth" :tooltip="false" @click="shiftMonth(-1)">
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
                        </IconButton>
                        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ heading }}</span>
                        <IconButton size="sm" :label="WORDS.nextMonth" :tooltip="false" @click="shiftMonth(1)">
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
                        </IconButton>
                    </div>

                    <div class="mt-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <span v-for="name in weekdays" :key="name" class="py-1">{{ name }}</span>
                    </div>

                    <div role="grid" class="grid grid-cols-7 gap-y-0.5" @keydown="onGridKey">
                        <button
                            v-for="cell in grid"
                            :id="dayId(cell.date)"
                            :key="cell.date.getTime()"
                            type="button"
                            role="gridcell"
                            :tabindex="sameDay(cell.date, focusedDay) ? 0 : -1"
                            :aria-selected="sameDay(cell.date, draft) ? 'true' : 'false'"
                            :aria-label="formatDisplay(cell.date, 'date', locale)"
                            :disabled="!dayAllowed(cell.date)"
                            class="mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            :class="dayClass(cell)"
                            @click="pickDay(cell.date)"
                        >{{ cell.date.getDate() }}</button>
                    </div>

                    <div class="mt-2 flex justify-end">
                        <Button size="sm" tone="secondary" @click="pickDay(new Date())">{{ WORDS.today }}</Button>
                    </div>
                </div>

                <div v-if="hasClock" class="flex border-gray-200 dark:border-white/10" :class="hasCalendar ? 'w-[136px] border-l' : 'w-full'">
                    <div
                        ref="hourList"
                        role="listbox"
                        tabindex="0"
                        :aria-label="WORDS.hours"
                        class="h-72 flex-1 overflow-y-auto py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                        @keydown="onClockKey($event, hours, draftHour, setHour)"
                    >
                        <button
                            v-for="hour in hours"
                            :key="hour"
                            type="button"
                            role="option"
                            tabindex="-1"
                            :aria-selected="draftHour === hour ? 'true' : 'false'"
                            class="mx-auto my-0.5 flex h-8 w-12 items-center justify-center rounded-md text-sm tabular-nums transition-colors"
                            :class="draftHour === hour ? 'bg-primary-500 font-semibold text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10'"
                            @click="setHour(hour)"
                        >{{ pad(hour) }}</button>
                    </div>
                    <div
                        ref="minuteList"
                        role="listbox"
                        tabindex="0"
                        :aria-label="WORDS.minutes"
                        class="h-72 flex-1 overflow-y-auto border-l border-gray-200 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:border-white/10"
                        @keydown="onClockKey($event, minutes, draftMinute, setMinute)"
                    >
                        <button
                            v-for="minute in minutes"
                            :key="minute"
                            type="button"
                            role="option"
                            tabindex="-1"
                            :aria-selected="draftMinute === minute ? 'true' : 'false'"
                            class="mx-auto my-0.5 flex h-8 w-12 items-center justify-center rounded-md text-sm tabular-nums transition-colors"
                            :class="draftMinute === minute ? 'bg-primary-500 font-semibold text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10'"
                            @click="setMinute(minute)"
                        >{{ pad(minute) }}</button>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between gap-2 border-t border-gray-200 p-2 dark:border-white/10">
                <Button size="sm" tone="secondary" @click="clear">{{ WORDS.clear }}</Button>
                <div class="flex items-center gap-2">
                    <span class="text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ formatDisplay(draft, mode, locale) }}</span>
                    <Button v-if="hasClock" size="sm" tone="cta" @click="apply">{{ WORDS.apply }}</Button>
                </div>
            </div>
        </Popover>
    </div>
</template>
