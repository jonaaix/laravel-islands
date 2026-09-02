<script setup>
import { computed, reactive, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import OptionStrip from './OptionStrip.vue';
import Popover from './Popover.vue';
import TextField from './TextField.vue';
import Tooltip from './Tooltip.vue';
import { DEFAULT_PRESETS, FORMATS, format, hsvToRgb, parseHex, rgbToHsv, toHex } from './colour.js';

/**
 * A hex field with a swatch that opens the picker: a saturation/value plane, a hue rail, an
 * alpha rail where asked for, a preset palette and the current value in the format of choice.
 * The model is always a hex string — `#rrggbb`, or `#rrggbbaa` when `alpha` is on and below 1.
 */
const props = defineProps({
    modelValue: { type: String, default: '' },
    /** Show the alpha rail and carry the alpha channel in the model. */
    alpha: { type: Boolean, default: false },
    /** Hex strings shown as a palette; `[]` hides the palette. */
    presets: { type: Array, default: () => DEFAULT_PRESETS },
    /** Formats offered by the switch, a subset of hex · rgb · hsl · hsv. */
    formats: { type: Array, default: () => FORMATS },
    copyable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '#3bb6c8' },
    /** The words the picker needs — the application owns them. */
    labels: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const WORDS = computed(() => ({
    open: 'Pick a colour',
    plane: 'Saturation and brightness',
    hue: 'Hue',
    alpha: 'Opacity',
    presets: 'Palette',
    copy: 'Copy',
    copied: 'Copied',
    ...props.labels,
}));

const anchor = ref(null);
const open = ref(false);
const text = ref('');
const activeFormat = ref(props.formats[0] ?? 'hex');
const copied = ref(false);

// The picker works in HSV so a drag along one rail never moves the other two.
const hsv = reactive({ h: 200, s: 70, v: 78 });
const alphaValue = ref(1);

const rgba = computed(() => ({ ...hsvToRgb(hsv), a: props.alpha ? alphaValue.value : 1 }));
const hex = computed(() => toHex(rgba.value, props.alpha));
const hueColour = computed(() => toHex(hsvToRgb({ h: hsv.h, s: 100, v: 100 })));
const display = computed(() => format(rgba.value, activeFormat.value, props.alpha));

const formatOptions = computed(() => props.formats.map((kind) => ({ value: kind, label: kind.toUpperCase() })));

function adopt(value) {
    const parsed = parseHex(value);

    if (!parsed) return false;

    const { h, s, v } = rgbToHsv(parsed);

    if (s > 0 && v > 0) hsv.h = h;
    hsv.s = s;
    hsv.v = v;
    alphaValue.value = parsed.a;

    return true;
}

watch(() => props.modelValue, (value) => {
    if (value && value !== hex.value) adopt(value);
    text.value = value ?? '';
}, { immediate: true });

function publish() {
    text.value = hex.value;
    emit('update:modelValue', hex.value);
}

function onTyped(value) {
    text.value = value;

    if (adopt(value)) emit('update:modelValue', hex.value);
}

function onBlur() {
    if (adopt(text.value)) text.value = hex.value;
    else text.value = props.modelValue ?? '';
}

/* ----- Rails and plane share one pointer contract ----- */

function track(event, onRatio) {
    if (props.disabled) return;

    const el = event.currentTarget;
    const move = (e) => {
        const box = el.getBoundingClientRect();
        onRatio(
            Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)),
            Math.min(1, Math.max(0, (e.clientY - box.top) / box.height)),
        );
    };
    const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', stop);
    };

    event.preventDefault();
    move(event);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
}

const onPlane = (event) => track(event, (x, y) => { hsv.s = x * 100; hsv.v = (1 - y) * 100; publish(); });
const onHue = (event) => track(event, (x) => { hsv.h = Math.min(359.9, x * 360); publish(); });
const onAlpha = (event) => track(event, (x) => { alphaValue.value = Math.round(x * 100) / 100; publish(); });

function nudge(event, apply) {
    const step = event.shiftKey ? 10 : 1;
    const keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };

    if (!keys[event.key]) return;

    event.preventDefault();
    apply(...keys[event.key]);
    publish();
}

const onPlaneKey = (event) => nudge(event, (dx, dy) => {
    hsv.s = Math.min(100, Math.max(0, hsv.s + dx));
    hsv.v = Math.min(100, Math.max(0, hsv.v + dy));
});
const onHueKey = (event) => nudge(event, (dx, dy) => { hsv.h = (hsv.h + dx + dy + 360) % 360; });
const onAlphaKey = (event) => nudge(event, (dx, dy) => { alphaValue.value = Math.min(1, Math.max(0, alphaValue.value + (dx + dy) / 100)); });

function pickPreset(value) {
    if (adopt(value)) publish();
}

async function copy() {
    try {
        await navigator.clipboard.writeText(display.value);
        copied.value = true;
        window.setTimeout(() => { copied.value = false; }, 1200);
    } catch {
        copied.value = false;
    }
}

const isPreset = (value) => parseHex(value) && toHex(parseHex(value)) === toHex(rgba.value);
</script>

<template>
    <div class="color-picker flex items-center gap-2">
        <div class="w-40">
            <TextField
                :model-value="text"
                mono
                :placeholder="placeholder"
                :disabled="disabled"
                @update:model-value="onTyped"
                @blur="onBlur"
            />
        </div>

        <span ref="anchor" class="inline-flex">
            <button
                type="button"
                :disabled="disabled"
                :aria-label="WORDS.open"
                :aria-expanded="open ? 'true' : 'false'"
                class="h-9 w-9 rounded-md ring-1 ring-gray-200 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:ring-white/10"
                :style="{ backgroundColor: hex }"
                @click="open = !open"
            ></button>
        </span>

        <Popover :anchor="anchor" :open="open" :width="272" @close="open = false">
            <div class="space-y-3 p-3">
                <div
                    role="application"
                    tabindex="0"
                    :aria-label="WORDS.plane"
                    class="relative h-40 w-full cursor-crosshair touch-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    :style="{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColour})` }"
                    @pointerdown="onPlane"
                    @keydown="onPlaneKey"
                >
                    <span
                        aria-hidden="true"
                        class="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,.35)]"
                        :style="{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: toHex(hsvToRgb(hsv)) }"
                    ></span>
                </div>

                <div
                    role="slider"
                    tabindex="0"
                    :aria-label="WORDS.hue"
                    :aria-valuemin="0"
                    :aria-valuemax="360"
                    :aria-valuenow="Math.round(hsv.h)"
                    class="relative h-3 w-full cursor-pointer touch-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    style="background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
                    @pointerdown="onHue"
                    @keydown="onHueKey"
                >
                    <span
                        aria-hidden="true"
                        class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,.35)]"
                        :style="{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColour }"
                    ></span>
                </div>

                <div
                    v-if="alpha"
                    role="slider"
                    tabindex="0"
                    :aria-label="WORDS.alpha"
                    :aria-valuemin="0"
                    :aria-valuemax="100"
                    :aria-valuenow="Math.round(alphaValue * 100)"
                    class="relative h-3 w-full cursor-pointer touch-none rounded-full bg-[length:8px_8px] bg-[linear-gradient(45deg,#d4d4d8_25%,transparent_25%,transparent_75%,#d4d4d8_75%),linear-gradient(45deg,#d4d4d8_25%,#fff_25%,#fff_75%,#d4d4d8_75%)] [background-position:0_0,4px_4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    @pointerdown="onAlpha"
                    @keydown="onAlphaKey"
                >
                    <span aria-hidden="true" class="absolute inset-0 rounded-full" :style="{ background: `linear-gradient(to right, transparent, ${toHex(rgba)})` }"></span>
                    <span
                        aria-hidden="true"
                        class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,.35)]"
                        :style="{ left: `${alphaValue * 100}%`, backgroundColor: hex }"
                    ></span>
                </div>

                <div v-if="presets.length" role="group" :aria-label="WORDS.presets" class="grid grid-cols-7 gap-1.5">
                    <Tooltip v-for="preset in presets" :key="preset" :text="preset">
                        <button
                            type="button"
                            :aria-label="preset"
                            :aria-pressed="isPreset(preset) ? 'true' : 'false'"
                            class="h-7 w-7 rounded-md ring-1 ring-inset ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            :class="isPreset(preset) ? 'ring-2 ring-offset-2 ring-offset-white ring-gray-900 dark:ring-white dark:ring-offset-gray-800' : ''"
                            :style="{ backgroundColor: preset }"
                            @click="pickPreset(preset)"
                        ></button>
                    </Tooltip>
                </div>

                <div class="space-y-2 border-t border-gray-200 pt-3 dark:border-white/10">
                    <div class="flex items-center justify-between gap-2">
                        <OptionStrip
                            v-if="formatOptions.length > 1"
                            variant="segmented"
                            size="sm"
                            :marker="false"
                            :model-value="activeFormat"
                            :options="formatOptions"
                            @update:model-value="activeFormat = $event"
                        />

                        <IconButton v-if="copyable" size="sm" :label="copied ? WORDS.copied : WORDS.copy" @click="copy">
                            <svg v-if="!copied" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z"/><path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z"/></svg>
                            <svg v-else class="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                        </IconButton>
                    </div>

                    <code class="block truncate font-mono text-xs text-gray-700 dark:text-gray-200">{{ display }}</code>
                </div>
            </div>
        </Popover>
    </div>
</template>
