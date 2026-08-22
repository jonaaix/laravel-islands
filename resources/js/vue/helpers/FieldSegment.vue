<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useTranslations } from '@aaix/laravel-islands/vue';
import { Icon } from '@aaix/laravel-islands/vue/helpers';

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [String, Number], default: null },
    state: { type: String, default: '' },
    interactive: { type: Boolean, default: false },
    affordance: { type: String, default: '' },
    copy: { type: Boolean, default: false },
    mono: { type: Boolean, default: false },
    emphasize: { type: Boolean, default: false },
    indicator: { type: String, default: 'dot' },
    saving: { type: Boolean, default: false },
    error: { type: String, default: '' },
});

const { t } = useTranslations();

const DOTS = {
    ok: 'bg-emerald-500',
    blocked: 'bg-amber-500',
    critical: 'bg-red-500',
    off: 'bg-gray-300 dark:bg-gray-600',
};

const ICONS = {
    ok: { name: 's-check-circle', class: 'text-emerald-500 dark:text-emerald-400' },
    blocked: { name: 's-exclamation-triangle', class: 'text-amber-500 dark:text-amber-400' },
    critical: { name: 's-exclamation-triangle', class: 'text-red-500 dark:text-red-400' },
    off: { name: 's-exclamation-circle', class: 'text-gray-300 dark:text-gray-600' },
};

const VALUE_TONES = {
    ok: 'text-emerald-700 dark:text-emerald-300',
    blocked: 'text-amber-700 dark:text-amber-300',
    critical: 'text-red-700 dark:text-red-300',
    off: 'text-gray-500 dark:text-gray-400',
};

const useIcon = computed(() => props.indicator === 'icon');
const iconMark = computed(() => (useIcon.value && ICONS[props.state]) || null);
const dotClass = computed(() => (useIcon.value ? '' : DOTS[props.state] || ''));
const valueClass = computed(() => (props.emphasize && VALUE_TONES[props.state]) || 'text-gray-900 dark:text-gray-100');
const filled = computed(() => props.value !== null && props.value !== '');

const copied = ref(false);
let copyTimer = null;

// Only a copying segment swallows the click; otherwise it has to reach the editor wrapper.
function onClick(event) {
    const text = String(props.value ?? '').trim();

    if (!props.copy || text === '') {
        return;
    }

    event?.stopPropagation();
    navigator.clipboard?.writeText(text);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copied.value = false;
    }, 1200);
}

onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
    <div
        @click="onClick($event)"
        class="relative min-w-[100px] px-4 py-2.5"
        :class="interactive || copy ? 'cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5' : ''"
    >
        <!-- Nothing here is ever cut off: the segment grows to its content instead. -->
        <p class="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ label }}</p>

        <p class="mt-0.5 flex items-center gap-1.5">
            <Icon
                v-if="iconMark"
                :name="iconMark.name"
                aria-hidden="true"
                class="h-4 w-4 shrink-0"
                :class="iconMark.class"
            />

            <span
                v-else-if="dotClass"
                aria-hidden="true"
                class="h-[7px] w-[7px] shrink-0 rounded-full"
                :class="dotClass"
            ></span>

            <svg v-if="saving" class="h-3 w-3 shrink-0 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9"/></svg>

            <span v-if="error" class="text-sm font-medium text-red-600 dark:text-red-400">{{ error }}</span>

            <!-- The confirmation replaces the value instead of covering it — same spot, so the eye stays put. -->
            <span
                v-else-if="copied"
                class="whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400"
            >{{ t('Copied!') }}</span>

            <span
                v-else-if="filled"
                class="whitespace-nowrap text-sm font-medium"
                :class="[valueClass, mono ? 'font-mono' : '']"
            >{{ value }}</span>

            <span v-else class="flex items-baseline gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                –
                <span v-if="interactive" class="text-xs underline decoration-dotted underline-offset-2">{{ t('Set') }}</span>
            </span>

            <!-- A filled value gives away nothing about being editable; the marker does. Kept out of
                 the chain above, which decides what the value itself reads as. -->
            <template v-if="filled && !error && !copied">
                <svg
                    v-if="affordance === 'menu'"
                    class="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                ><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>

                <Icon
                    v-else-if="affordance === 'edit'"
                    name="o-pencil-square"
                    class="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500"
                />
            </template>
        </p>

    </div>
</template>
