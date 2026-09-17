<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import { overlayZIndex, registerOverlay, unregisterOverlay } from './overlayStack.js';
import { useTheme } from './theme.js';

const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    /** `sm` … `full`; the theme decides when unset. */
    size: { type: String, default: null },
    closable: { type: Boolean, default: true },
    closeOnBackdrop: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
    closeLabel: { type: String, default: 'Close' },
});

const emit = defineEmits(['close']);

const theme = useTheme('modal');

const panel = ref(null);

// Where focus came from, so closing puts it back on the control that opened the modal.
let returnFocusTo = null;

const resolvedSize = computed(() => props.size ?? theme.size ?? 'md');
const sizeClass = computed(() => theme.sizes[resolvedSize.value] ?? theme.sizes.md);

/** Fills the screen: the panel takes the height it is given rather than its content's. */
const fills = computed(() => resolvedSize.value === 'xl' || resolvedSize.value === 'full');

function close() {
    if (props.closable) {
        emit('close');
    }
}

function onBackdrop() {
    if (props.closeOnBackdrop) {
        close();
    }
}

function onKeydown(event) {
    if (event.key === 'Escape' && props.closeOnEscape) {
        event.stopPropagation();
        close();
        return;
    }

    if (event.key !== 'Tab') {
        return;
    }

    // Tab must not walk out into the page behind: the modal owns the keyboard while it is open.
    const stops = focusables();

    if (!stops.length) {
        event.preventDefault();
        return;
    }

    const first = stops[0];
    const last = stops[stops.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
    }
}

function focusables() {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

    return [...(panel.value?.querySelectorAll(selector) ?? [])].filter((el) => el.offsetParent !== null || el.tagName === 'IFRAME');
}

const overlayId = ref(null);
const overlayStyle = computed(() => overlayId.value !== null ? { zIndex: overlayZIndex(overlayId.value) } : {});

watch(() => props.open, async (open) => {
    if (!open) {
        returnFocusTo?.focus?.();
        returnFocusTo = null;
        return;
    }

    overlayId.value = registerOverlay();

    returnFocusTo = document.activeElement;
    await nextTick();
    (focusables()[0] ?? panel.value)?.focus?.();
}, { immediate: true });

function releaseOverlay() {
    if (overlayId.value === null) {
        return;
    }

    unregisterOverlay(overlayId.value);
    overlayId.value = null;
}

onBeforeUnmount(() => {
    returnFocusTo = null;
    releaseOverlay();
});
</script>

<template>
    <Teleport to="body">
        <Transition name="island-modal" @after-leave="releaseOverlay">
            <div
                v-if="open"
                class="il-modal fixed inset-0 flex items-center justify-center bg-il-neutral-900/50 p-4 backdrop-blur-[2px]"
                :data-size="resolvedSize"
                :style="overlayStyle"
                @click.self="onBackdrop"
                @keydown="onKeydown"
            >
            <div
                ref="panel"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                class="il-modal__panel island-modal-panel relative flex w-full flex-col overflow-hidden rounded-il-card focus:outline-none"
                :class="[theme.surface, sizeClass, fills ? 'h-full' : 'max-h-full']"
            >
                <!-- Without a title there is no bar to hang the close button in; it floats instead. -->
                <div v-if="title || $slots.title" class="il-modal__header flex shrink-0 items-center gap-4 border-b px-4 py-2" :class="theme.divider">
                    <div class="min-w-0 flex-1">
                        <slot name="title">
                            <p class="il-modal__title truncate text-sm font-semibold text-il-neutral-900 dark:text-il-neutral-100">{{ title }}</p>
                        </slot>
                    </div>

                    <!-- The bar has the room, so what acts on the content sits beside its name. -->
                    <div v-if="$slots.actions" class="il-modal__actions flex shrink-0 items-center gap-2">
                        <slot name="actions" />
                    </div>

                    <IconButton
                        v-if="closable"
                        size="sm"
                        tone="quiet"
                        :label="closeLabel"
                        :tooltip="false"
                        @click="close"
                    >
                        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
                    </IconButton>
                </div>

                <span v-else-if="closable" class="il-modal__close absolute right-2 top-2 z-10">
                    <IconButton
                        size="sm"
                        tone="quiet"
                        :label="closeLabel"
                        :tooltip="false"
                        @click="close"
                    >
                        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
                    </IconButton>
                </span>

                <div class="il-modal__body min-h-0 flex-1" :class="fills ? 'overflow-hidden' : 'overflow-y-auto p-5'">
                    <slot />
                </div>

                <div v-if="$slots.footer" class="il-modal__footer flex shrink-0 justify-end gap-2 border-t px-4 py-3" :class="theme.divider">
                    <slot name="footer" />
                </div>
            </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* The panel rises into place and drops back out; what appears must also disappear. */
.island-modal-enter-active {
    transition: opacity 260ms ease-out;
}

.island-modal-leave-active {
    transition: opacity 160ms ease-in;
}

.island-modal-enter-from,
.island-modal-leave-to {
    opacity: 0;
}

.island-modal-enter-active .island-modal-panel {
    transition:
        transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 260ms ease-out;
}

.island-modal-leave-active .island-modal-panel {
    transition:
        transform 160ms ease-in,
        opacity 160ms ease-in;
}

.island-modal-enter-from .island-modal-panel,
.island-modal-leave-to .island-modal-panel {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
    .island-modal-enter-active,
    .island-modal-leave-active,
    .island-modal-enter-active .island-modal-panel,
    .island-modal-leave-active .island-modal-panel {
        transition-duration: 1ms;
    }

    .island-modal-enter-from .island-modal-panel,
    .island-modal-leave-to .island-modal-panel {
        transform: none;
    }
}
</style>
