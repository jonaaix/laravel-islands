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
            class="il-confirm__title text-sm font-semibold"
            :class="options.tone === 'danger' ? 'text-il-danger-600 dark:text-il-danger-400' : 'text-il-neutral-900 dark:text-il-neutral-100'"
            :data-tone="options.tone || undefined"
        >{{ options.title }}</p>

        <p v-if="options.message" class="il-confirm__message whitespace-pre-line text-sm text-il-neutral-700 dark:text-il-neutral-300" :class="options.title ? 'mt-2' : ''">{{ options.message }}</p>

        <template #footer>
            <Button tone="secondary" size="sm" @click="confirm.answer(false)">{{ options.cancelLabel }}</Button>
            <Button :tone="confirmTone" size="sm" @click="confirm.answer(true)">{{ options.confirmLabel }}</Button>
        </template>
    </Modal>
</template>
