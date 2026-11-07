<script setup>
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import ChevronRightIcon from './ChevronRightIcon.vue';
import MenuItem from './MenuItem.vue';
import Popover from './Popover.vue';
import { createMenuLevel, provideMenuLevel, useMenuLevel } from './menuLevel.js';
import { useMenuNavigation } from './menuNavigation.js';

const props = defineProps({
    label: { type: String, required: true },
    description: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    width: { type: Number, default: 200 },
    maxHeight: { type: Number, default: null },
});

const parent = useMenuLevel();
const level = createMenuLevel(parent.root);

provideMenuLevel(level);

const id = useId();
const wrapper = ref(null);
const item = ref(null);
const panel = ref(null);
const open = ref(false);

const navigation = useMenuNavigation(panel);
const handle = { el: null, close };

let focusFirst = false;

onMounted(() => {
    handle.el = wrapper.value;
});

onBeforeUnmount(() => parent.subClosed(handle));

function itemEl() {
    return item.value?.$el ?? null;
}

function show(fromKeyboard) {
    if (props.disabled) {
        return;
    }

    focusFirst = fromKeyboard;
    parent.openSub(handle);
    open.value = true;
}

function close() {
    open.value = false;
}

function onItemKeydown(event) {
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(true);
    }
}

function onPanelKeydown(event) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        close();
    } else if (event.key === 'Tab') {
        event.preventDefault();
        parent.root.tabOut(event.shiftKey);
    } else {
        navigation.onKeydown(event);
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        return;
    }

    parent.subClosed(handle);

    const active = document.activeElement;
    const inMenu = active?.closest(`[data-il-menu="${CSS.escape(parent.root.id)}"]`);
    const inParentPanel = wrapper.value?.closest('[role="menu"]')?.contains(active);

    if (inMenu && !inParentPanel) {
        itemEl()?.focus({ preventScroll: true });
    }
}, { flush: 'pre' });

watch(open, (isOpen) => {
    if (isOpen && focusFirst) {
        navigation.focusChecked() || navigation.focusFirst();
    }

    focusFirst = false;
}, { flush: 'post' });
</script>

<template>
    <div ref="wrapper" role="none" class="il-menu-sub" :data-state="open ? 'open' : 'closed'" @mouseenter="show(false)" @keydown="onItemKeydown">
        <MenuItem
            ref="item"
            keep-open
            :disabled="disabled"
            :description="description"
            aria-haspopup="menu"
            :aria-expanded="String(open)"
            :aria-controls="open ? id : undefined"
            @click="show($event.detail === 0)"
        >
            <template v-if="$slots.leading || $slots.icon" #leading>
                <slot name="leading"><slot name="icon" /></slot>
            </template>
            {{ label }}
            <template #trailing>
                <ChevronRightIcon class="il-menu-sub__chevron h-4 w-4 shrink-0 opacity-60" />
            </template>
        </MenuItem>

        <Popover
            :anchor="wrapper"
            :open="open"
            :width="width"
            side="right"
            align="start"
            :offset="0"
            :backdrop="false"
            @close="close"
        >
            <div
                :id="id"
                ref="panel"
                role="menu"
                tabindex="-1"
                :aria-label="label"
                :data-il-menu="parent.root.id"
                class="il-menu__panel relative py-1 focus:outline-none"
                :class="maxHeight ? 'slim-scrollbar overflow-y-auto' : ''"
                :style="maxHeight ? { maxHeight: `${maxHeight}px` } : undefined"
                @keydown="onPanelKeydown"
                @mouseenter="parent.holdSub()"
            >
                <slot />
            </div>
        </Popover>
    </div>
</template>
