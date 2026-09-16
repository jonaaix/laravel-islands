<script setup>
import { computed, ref } from 'vue';
import { FIELD_SHAPES } from './fieldStyles.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    /** File (single) or FileList (multiple). Reset to null to clear. */
    modelValue: { type: [Object, null], default: null },
    /** Native `accept` pattern — mime types or file extensions. */
    accept: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    /** Overrides the default "Choose PDF …" / "Choose file …" text. */
    label: { type: String, default: '' },
    /** Optional caption below the label ("Max 10 MB" …). */
    hint: { type: String, default: '' },
    shape: { type: String, default: 'rounded' },
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputRef = ref(null);
const dragging = ref(false);
/*
 * Callers that only listen to @change would otherwise lose the chip because
 * modelValue stays null on their side. Cache the last selection locally so
 * the picked file is always visible until the caller explicitly clears it.
 */
const internal = ref(null);

const shape = computed(() => FIELD_SHAPES[props.shape] ?? FIELD_SHAPES.rounded);

const displayed = computed(() => {
    const v = props.modelValue ?? internal.value;
    if (!v) return [];
    if (typeof FileList !== 'undefined' && v instanceof FileList) return Array.from(v);
    if (Array.isArray(v)) return v;
    return [v];
});

const displayedLabel = computed(() => {
    if (props.label) return props.label;
    if (props.accept?.toLowerCase()?.includes('pdf')) return 'Click to upload a PDF or drop it here';
    return 'Click to upload a file or drop it here';
});

const zoneClasses = computed(() =>
    [
        'group relative flex w-full cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed px-4 py-6 text-center transition-colors',
        dragging.value
            ? 'border-il-primary-500 bg-il-primary-50 dark:border-il-primary-400 dark:bg-il-primary-500/10'
            : 'border-il-neutral-300 bg-white hover:border-il-primary-500 hover:bg-il-primary-50/40 dark:border-white/15 dark:bg-il-neutral-950 dark:hover:border-il-primary-400 dark:hover:bg-il-primary-500/10',
        props.disabled ? 'cursor-not-allowed opacity-60' : '',
        shape.value,
    ]
        .filter(Boolean)
        .join(' '),
);

function emitFiles(files) {
    if (!files || files.length === 0) {
        internal.value = null;
        emit('update:modelValue', null);
        emit('change', null);
        return;
    }
    if (props.multiple) {
        internal.value = files;
        emit('update:modelValue', files);
        emit('change', files);
        return;
    }
    internal.value = files[0];
    emit('update:modelValue', files[0]);
    emit('change', files[0]);
}

function onSelect(event) {
    emitFiles(event.target.files);
}

function onDrop(event) {
    dragging.value = false;
    if (props.disabled) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        emitFiles(files);
    }
}

function onDragOver(event) {
    event.preventDefault();
    if (props.disabled) return;
    dragging.value = true;
}

function onDragLeave() {
    dragging.value = false;
}

function openPicker() {
    if (props.disabled) return;
    inputRef.value?.click();
}

function removeAt(index, event) {
    event?.stopPropagation();
    const files = displayed.value.filter((_, i) => i !== index);
    if (props.multiple) {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        emitFiles(dt.files);
        return;
    }
    emitFiles(null);
}

function formatBytes(n) {
    if (!n && n !== 0) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
    <div class="il-file-field file-field" :class="$attrs.class" :data-state="dragging ? 'dragging' : (displayed.length ? 'filled' : 'empty')" :data-disabled="disabled || undefined">
        <button
            v-if="multiple || displayed.length === 0"
            type="button"
            class="il-file-field__zone"
            :class="zoneClasses"
            :aria-disabled="disabled"
            @click="openPicker"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6 text-il-neutral-400 group-hover:text-il-primary-500 dark:group-hover:text-il-primary-400" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9m0 0-3 3m3-3 3 3M6.75 19.5h10.5A2.25 2.25 0 0 0 19.5 17.25V15m-15 0v2.25A2.25 2.25 0 0 0 6.75 19.5Z"/>
            </svg>
            <p class="text-sm font-medium text-il-neutral-700 group-hover:text-il-primary-700 dark:text-il-neutral-300 dark:group-hover:text-il-primary-300">
                {{ displayedLabel }}
            </p>
            <p v-if="hint" class="text-xs text-il-neutral-500 dark:text-il-neutral-400">{{ hint }}</p>
        </button>

        <input
            ref="inputRef"
            type="file"
            class="sr-only"
            :accept="accept || undefined"
            :multiple="multiple"
            :disabled="disabled"
            :required="required"
            @change="onSelect"
        />

        <ul v-if="displayed.length" class="il-file-field__list space-y-1" :class="{ 'mt-2': multiple || displayed.length > 1 }">
            <li
                v-for="(file, i) in displayed"
                :key="i"
                class="il-file-field__file flex items-center gap-2 rounded-il-control bg-il-neutral-50 px-3 py-2 text-xs dark:bg-il-neutral-900"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 shrink-0 text-il-primary-600 dark:text-il-primary-400" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 15l2.25 2.25L15 12.75M6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25V9.564c0-.596-.237-1.168-.659-1.591L14.686 3.03A2.25 2.25 0 0 0 13.094 2.37H6.75A2.25 2.25 0 0 0 4.5 4.62v14.88a2.25 2.25 0 0 0 2.25 2.25Z"/>
                </svg>
                <span class="min-w-0 flex-1 truncate font-medium text-il-neutral-700 dark:text-il-neutral-200">{{ file.name }}</span>
                <span class="shrink-0 tabular-nums text-il-neutral-500 dark:text-il-neutral-400">{{ formatBytes(file.size) }}</span>
                <button
                    type="button"
                    class="il-file-field__remove shrink-0 rounded-full p-1 text-il-neutral-400 transition-colors hover:bg-il-danger-100 hover:text-il-danger-600 dark:hover:bg-il-danger-500/15 dark:hover:text-il-danger-300"
                    :aria-label="'Remove ' + file.name"
                    @click="(e) => removeAt(i, e)"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
                        <path fill-rule="evenodd" d="M4.28 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.66-4.72a.75.75 0 1 1 1.07 1.05L11.06 10l4.67 4.73a.75.75 0 1 1-1.07 1.05L10 11.06l-4.66 4.72a.75.75 0 1 1-1.07-1.05L8.94 10 4.28 5.27a.75.75 0 0 1 0-1.05Z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </li>
        </ul>
    </div>
</template>
