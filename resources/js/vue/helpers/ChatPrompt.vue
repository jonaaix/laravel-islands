<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTheme } from './theme.js';

/**
 * The message field of a chat: a text area that grows with its text, Enter to send (or ⌘/Ctrl+Enter), the actions
 * beside it. A word still being composed with an input method never sends.
 */
const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
    /** Rows the field grows to before it scrolls; `0` grows without limit. */
    maxRows: { type: Number, default: 10 },
    /** Off, Enter adds a line and ⌘/Ctrl+Enter sends. */
    submitOnEnter: { type: Boolean, default: true },
    /** Extra classes for the text area, such as a taller enlarged state. */
    fieldClass: { type: [String, Array, Object], default: '' },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const theme = useTheme('chatPrompt');
const field = ref(null);

let compositionJustEnded = false;
let compositionTimer;
let focusTimer;

function fitRows() {
    const element = field.value;
    if (!element) {
        return;
    }
    // An empty field is one row; measuring it would force a layout of the whole page, which is costly while a view opens.
    if (element.value === '') {
        if (element.rows !== 1) {
            element.rows = 1;
        }
        return;
    }
    const style = getComputedStyle(element);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const overflow = element.style.overflow;
    element.rows = 1;
    element.style.overflow = 'hidden';
    const rows = Math.max(1, Math.round((element.scrollHeight - padding) / lineHeight));
    element.rows = props.maxRows > 0 ? Math.min(rows, props.maxRows) : rows;
    element.style.overflow = overflow;
}

function onInput(event) {
    emit('update:modelValue', event.target.value);
    fitRows();
}

function submit() {
    if (props.modelValue.trim() !== '') {
        emit('submit');
    }
}

function onKeydown(event) {
    if (event.key === 'Escape') {
        field.value?.blur();
        return;
    }
    if (event.key !== 'Enter') {
        return;
    }
    const modifier = event.metaKey || event.ctrlKey;
    const sends = props.submitOnEnter ? !modifier && !event.shiftKey && !event.altKey : modifier;
    if (!sends || compositionJustEnded || event.isComposing || event.keyCode === 229) {
        return;
    }
    event.preventDefault();
    submit();
}

// Safari fires the Enter that confirms a composed word after compositionend, so that key must not send.
function onCompositionEnd() {
    clearTimeout(compositionTimer);
    compositionJustEnded = true;
    compositionTimer = setTimeout(() => {
        compositionJustEnded = false;
    }, 50);
}

watch(() => [props.modelValue, props.maxRows], () => nextTick(fitRows));

onMounted(() => {
    fitRows();
    if (props.autofocus) {
        focusTimer = setTimeout(() => field.value?.focus());
    }
});

onBeforeUnmount(() => {
    clearTimeout(compositionTimer);
    clearTimeout(focusTimer);
});

defineExpose({ field });
</script>

<template>
    <form method="post" class="il-chat-prompt relative flex w-full flex-col items-stretch gap-2" :class="theme.surface" @submit.prevent="submit">
        <div v-if="$slots.header" class="il-chat-prompt__header flex items-center gap-1.5">
            <slot name="header" />
        </div>
        <div class="il-chat-prompt__body relative flex items-end gap-1.5">
            <span v-if="$slots.leading" class="il-chat-prompt__leading flex items-start">
                <slot name="leading" />
            </span>
            <textarea
                ref="field"
                :value="modelValue"
                rows="1"
                :placeholder="placeholder"
                :disabled="disabled"
                class="il-chat-prompt__field w-full resize-none appearance-none border-0 bg-transparent px-0 py-2 text-base/5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
                :class="[theme.field, fieldClass]"
                @input="onInput"
                @keydown="onKeydown"
                @compositionend="onCompositionEnd"
            ></textarea>
            <slot />
        </div>
        <div v-if="$slots.footer" class="il-chat-prompt__footer flex items-center justify-between gap-1.5">
            <slot name="footer" />
        </div>
    </form>
</template>
