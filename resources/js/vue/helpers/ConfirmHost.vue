<script setup>
import { computed, inject } from 'vue';
import Modal from './Modal.vue';
import { CONFIRM_KEY } from './confirm.js';

const confirm = inject(CONFIRM_KEY, null);

const TONES = {
    danger: 'bg-red-600 hover:bg-red-500',
    primary: 'bg-primary-600 hover:bg-primary-500',
};

const options = computed(() => confirm?.options.value ?? {});
const confirmClass = computed(() => TONES[options.value.tone] ?? TONES.primary);
</script>

<template>
    <Modal
        v-if="confirm"
        :open="confirm.open.value"
        size="sm"
        :close-label="options.cancelLabel"
        @close="confirm.answer(false)"
    >
        <p
            v-if="options.title"
            class="text-sm font-semibold"
            :class="options.tone === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"
        >{{ options.title }}</p>

        <!-- Kept as written: a question with more than one paragraph reads as one wall without it. -->
        <p v-if="options.message" class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300" :class="options.title ? 'mt-2' : ''">{{ options.message }}</p>

        <template #footer>
            <button
                type="button"
                @click="confirm.answer(false)"
                class="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >{{ options.cancelLabel }}</button>

            <button
                type="button"
                @click="confirm.answer(true)"
                class="rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors"
                :class="confirmClass"
            >{{ options.confirmLabel }}</button>
        </template>
    </Modal>
</template>
