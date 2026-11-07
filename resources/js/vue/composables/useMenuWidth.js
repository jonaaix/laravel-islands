import { computed, onBeforeUnmount, ref, watch } from 'vue';

const FILTER_MIN_WIDTH = 288;

export function useMenuWidth(props, triggerEl, open) {
    const triggerWidth = ref(0);

    let observer = null;

    function measure() {
        triggerWidth.value = Math.round(triggerEl.value?.getBoundingClientRect().width ?? 0);
    }

    function stopObserving() {
        observer?.disconnect();
        observer = null;
    }

    watch(open, (isOpen) => {
        stopObserving();

        if (!isOpen || !triggerEl.value) {
            return;
        }

        measure();

        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(measure);
            observer.observe(triggerEl.value);
        }
    });

    onBeforeUnmount(stopObserving);

    // A filter pill is only as wide as its word, so its list keeps a floor unless the caller sets one.
    const minWidth = computed(() => props.menuMinWidth ?? (props.variant === 'field' ? 0 : FILTER_MIN_WIDTH));

    return computed(() => {
        if (props.menuWidth !== 'trigger') {
            return Number(props.menuWidth);
        }

        const width = Math.max(triggerWidth.value, minWidth.value);

        return width > 0 ? width : FILTER_MIN_WIDTH;
    });
}
