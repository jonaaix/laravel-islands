<script setup>
import { computed, nextTick, onMounted, onUpdated, reactive, ref, toRef, useId, watch } from 'vue';
import Popover from './Popover.vue';
import { createMenuLevel, provideMenuLevel } from './menuLevel.js';
import { adjacentTabbable, useMenuNavigation } from './menuNavigation.js';
import { useMenuWidth } from '../composables/useMenuWidth.js';

const props = defineProps({
    width: { type: [Number, String], default: 200 },
    minWidth: { type: Number, default: null },
    maxHeight: { type: Number, default: null },
    side: { type: String, default: 'bottom' },
    align: { type: String, default: null },
    offset: { type: Number, default: 4 },
    trigger: { type: String, default: 'click' },
    label: { type: String, default: '' },
    zIndex: { type: Number, default: 60 },
});

const LONG_PRESS = 500;
const LONG_PRESS_TOLERANCE = 10;

const id = useId();
const anchor = ref(null);
const panel = ref(null);
const popover = ref(null);
const open = ref(false);
const point = ref(null);
const triggerId = ref(null);

const isContext = computed(() => props.trigger === 'context');
const popoverAnchor = computed(() => point.value ?? anchor.value);

const menuWidth = useMenuWidth(
    reactive({ menuWidth: toRef(props, 'width'), menuMinWidth: toRef(props, 'minWidth'), variant: 'field' }),
    anchor,
    open,
);

const navigation = useMenuNavigation(panel);

let focusIntent = null;
let returnFocusTo = null;

provideMenuLevel(createMenuLevel({ id, closeAll: close, tabOut }));

function triggerElement() {
    return anchor.value?.querySelector('button, a[href], input, [tabindex]:not([tabindex="-1"])') ?? null;
}

function syncTrigger() {
    if (isContext.value) {
        return;
    }

    const el = triggerElement();

    if (!el) {
        return;
    }

    el.id ||= `${id}-trigger`;
    triggerId.value = el.id;
    el.setAttribute('aria-haspopup', 'menu');
    el.setAttribute('aria-expanded', String(open.value));

    if (open.value) {
        el.setAttribute('aria-controls', id);
    } else {
        el.removeAttribute('aria-controls');
    }
}

onMounted(syncTrigger);
onUpdated(syncTrigger);

function show(intent = null) {
    focusIntent = intent;
    returnFocusTo = isContext.value ? document.activeElement : triggerElement();
    open.value = true;
}

function close() {
    open.value = false;
}

function toggle() {
    if (open.value) {
        close();

        return;
    }

    show(focusIntent);
}

function onTriggerKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        show(event.key === 'ArrowUp' ? 'last' : 'first');
    } else if (event.key === 'Enter' || event.key === ' ') {
        focusIntent = 'first';
    }
}

function openAt(event) {
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const target = event.currentTarget instanceof Element ? event.currentTarget : event.target;

    point.value = fromKeyboard && target?.getBoundingClientRect
        ? target
        : { getBoundingClientRect: () => new DOMRect(event.clientX, event.clientY, 0, 0) };

    if (open.value) {
        nextTick(() => popover.value?.position());

        return;
    }

    show(fromKeyboard ? 'first' : null);
}

let pressTimer = null;
let pressStart = null;
let openedByPress = false;

function cancelPress() {
    clearTimeout(pressTimer);
    pressTimer = null;
    pressStart = null;
}

function onPointerDown(event) {
    if (event.pointerType !== 'touch') {
        return;
    }

    cancelPress();
    openedByPress = false;
    pressStart = { x: event.clientX, y: event.clientY };
    pressTimer = setTimeout(() => {
        openedByPress = true;
        openAt(event);
    }, LONG_PRESS);
}

function onPointerMove(event) {
    if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > LONG_PRESS_TOLERANCE) {
        cancelPress();
    }
}

function onContextMenu(event) {
    event.preventDefault();
    cancelPress();

    if (openedByPress) {
        openedByPress = false;

        return;
    }

    openAt(event);
}

function tabOut(backwards) {
    const target = adjacentTabbable(returnFocusTo, backwards ? -1 : 1) ?? returnFocusTo;

    target?.focus();
    close();
}

function onPanelKeydown(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        tabOut(event.shiftKey);

        return;
    }

    navigation.onKeydown(event);
}

watch(open, (isOpen) => {
    if (isOpen) {
        return;
    }

    if (document.activeElement?.closest(`[data-il-menu="${CSS.escape(id)}"]`)) {
        returnFocusTo?.focus({ preventScroll: true });
    }

    point.value = null;
    focusIntent = null;
}, { flush: 'pre' });

watch(open, (isOpen) => {
    syncTrigger();

    if (!isOpen) {
        return;
    }

    const intent = focusIntent;

    focusIntent = null;

    if (intent === 'last') {
        navigation.focusLast();
    } else if (intent === 'first') {
        navigation.focusChecked() || navigation.focusFirst();
    } else {
        panel.value?.focus({ preventScroll: true });
        navigation.revealChecked();
    }
}, { flush: 'post' });

defineExpose({ openAt, close });
</script>

<template>
    <div
        v-if="isContext"
        ref="anchor"
        class="il-menu contents [-webkit-touch-callout:none]"
        :data-state="open ? 'open' : 'closed'"
        @contextmenu="onContextMenu"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="cancelPress"
        @pointercancel="cancelPress"
    >
        <slot name="trigger" :open="open" :open-at="openAt" />
    </div>
    <span v-else ref="anchor" class="il-menu inline-flex" :data-state="open ? 'open' : 'closed'" @keydown="onTriggerKeydown">
        <slot name="trigger" :toggle="toggle" :open="open" />
    </span>

    <Popover
        ref="popover"
        :anchor="popoverAnchor"
        :open="open"
        :width="menuWidth"
        :side="side"
        :align="align ?? (isContext ? 'start' : null)"
        :offset="offset"
        :z-index="zIndex"
        @close="close"
    >
        <div
            :id="id"
            ref="panel"
            role="menu"
            tabindex="-1"
            :aria-labelledby="label || isContext ? undefined : triggerId"
            :aria-label="label || undefined"
            :data-il-menu="id"
            class="il-menu__panel relative py-1 focus:outline-none"
            :class="maxHeight ? 'slim-scrollbar overflow-y-auto' : ''"
            :style="maxHeight ? { maxHeight: `${maxHeight}px` } : undefined"
            @keydown="onPanelKeydown"
        >
            <slot :close="close" />
        </div>
    </Popover>
</template>
