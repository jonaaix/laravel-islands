<script setup>
import { computed, inject } from 'vue';
import Button from './Button.vue';
import Modal from './Modal.vue';
import { CONFIRM_KEY } from './confirm.js';

const confirm = inject(CONFIRM_KEY, null);

const options = computed(() => confirm?.options.value ?? {});
const confirmTone = computed(() => options.value.tone === 'danger' ? 'danger' : 'cta');
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

        <p v-if="options.message" class="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300" :class="options.title ? 'mt-2' : ''">{{ options.message }}</p>

        <template #footer>
            <Button tone="secondary" size="sm" @click="confirm.answer(false)">{{ options.cancelLabel }}</Button>
            <Button :tone="confirmTone" size="sm" @click="confirm.answer(true)">{{ options.confirmLabel }}</Button>
        </template>
    </Modal>
</template>
