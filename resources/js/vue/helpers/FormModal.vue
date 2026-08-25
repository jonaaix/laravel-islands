<script setup>
import { computed } from 'vue';
import Button from './Button.vue';
import Modal from './Modal.vue';

const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    size: { type: String, default: 'md' },
    closeOnBackdrop: { type: Boolean, default: false },
    closeOnEscape: { type: Boolean, default: true },
    cancelLabel: { type: String, default: 'Cancel' },
    submitLabel: { type: String, default: 'Save' },
    submitTone: { type: String, default: 'cta' },
    submitDisabled: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
});

const emit = defineEmits(['cancel', 'submit']);

const submitEnabled = computed(() => !props.busy && !props.submitDisabled);
</script>

<template>
    <Modal
        :open="open"
        :title="title"
        :size="size"
        :close-on-backdrop="closeOnBackdrop"
        :close-on-escape="closeOnEscape"
        :close-label="cancelLabel"
        @close="emit('cancel')"
    >
        <template v-if="$slots.title" #title>
            <slot name="title" />
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="emit('submit')">
            <slot />

            <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                <slot name="footer">
                    <Button
                        type="button"
                        tone="secondary"
                        :disabled="busy"
                        @click="emit('cancel')"
                    >{{ cancelLabel }}</Button>

                    <Button
                        type="submit"
                        :tone="submitTone"
                        :disabled="!submitEnabled"
                        :loading="busy"
                    >{{ submitLabel }}</Button>
                </slot>
            </div>
        </form>
    </Modal>
</template>
