import { ref } from 'vue';

const SETTLE_MS = 160;

/**
 * Dragging a tile into a new place, by pointer events rather than by the browser's own drag:
 * the tile follows the finger, the gap the others open up is the preview, and the list is
 * reordered as the pointer travels instead of once on release.
 *
 * `container` is a ref to the element holding the tiles, each marked with the given attribute.
 * `list` is a ref to the working array — it is reordered in place as the drag goes on.
 */
export function useSortableTiles({ container, list, attribute = 'data-tile', onReorder = null, enabled = null }) {
    const heldIndex = ref(-1);
    const heldOffset = ref({ x: 0, y: 0 });
    const settling = ref(false);
    const settleIndex = ref(-1);

    let slots = [];
    let grabX = 0;
    let grabY = 0;
    let settleTimer = null;

    function active() {
        return enabled === null ? true : Boolean(enabled.value ?? enabled);
    }

    /**
     * The grid the tiles sit in, measured once when a drag begins. Reading live element
     * positions instead would fight the move animation: right after a swap the tiles are
     * still travelling, so the pointer would appear to be over the wrong one and the swap
     * would be undone on the very next event. Page coordinates keep it valid across scrolling.
     */
    function measureSlots() {
        const items = container.value?.querySelectorAll(`[${attribute}]`) ?? [];

        slots = Array.from(items).map((el) => {
            const rect = el.getBoundingClientRect();

            return {
                left: rect.left + window.scrollX,
                right: rect.right + window.scrollX,
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
            };
        });
    }

    function slotAt(pageX, pageY) {
        for (let i = 0; i < slots.length; i += 1) {
            const slot = slots[i];

            if (pageX >= slot.left && pageX <= slot.right && pageY >= slot.top && pageY <= slot.bottom) {
                return i;
            }
        }

        return -1;
    }

    function grab(index, event) {
        if (!active() || (event.pointerType === 'mouse' && event.button !== 0)) {
            return;
        }

        event.preventDefault();
        clearTimeout(settleTimer);
        settling.value = false;
        measureSlots();
        heldIndex.value = index;
        heldOffset.value = { x: 0, y: 0 };
        grabX = event.pageX;
        grabY = event.pageY;

        // The pointer is captured on the container, never on the tile: reordering moves the
        // tile's node, and a moved node loses its capture — which ended the drag by itself.
        container.value?.setPointerCapture?.(event.pointerId);
    }

    function move(event) {
        if (heldIndex.value === -1) {
            return;
        }

        heldOffset.value = { x: event.pageX - grabX, y: event.pageY - grabY };

        const to = slotAt(event.pageX, event.pageY);

        if (to === -1 || to === heldIndex.value) {
            return;
        }

        const from = heldIndex.value;
        const next = [...list.value];
        const [held] = next.splice(from, 1);
        next.splice(to, 0, held);
        list.value = next;
        heldIndex.value = to;

        // The tile must stay under the pointer, so the offset loses the distance its slot
        // just travelled — otherwise it would jump a whole slot on every swap.
        if (slots[from] && slots[to]) {
            grabX += slots[to].left - slots[from].left;
            grabY += slots[to].top - slots[from].top;
            heldOffset.value = { x: event.pageX - grabX, y: event.pageY - grabY };
        }
    }

    function drop(event) {
        if (heldIndex.value === -1) {
            return;
        }

        // Let it glide the last stretch into its slot instead of blinking there.
        settleIndex.value = heldIndex.value;
        settling.value = true;
        heldIndex.value = -1;
        heldOffset.value = { x: 0, y: 0 };
        slots = [];

        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            settling.value = false;
            settleIndex.value = -1;
        }, SETTLE_MS);

        if (event) {
            container.value?.releasePointerCapture?.(event.pointerId);
        }

        onReorder?.(list.value);
    }

    function cancel() {
        clearTimeout(settleTimer);
        heldIndex.value = -1;
        heldOffset.value = { x: 0, y: 0 };
        settling.value = false;
        settleIndex.value = -1;
        slots = [];
    }

    /**
     * The held tile is lifted with `translate` and `scale` rather than with `transform`,
     * because a list animation owns `transform` — kept apart, the two compose instead of
     * overwriting each other.
     *
     * It also drops whatever transition the tile carries for the others' sake. The offset is
     * rewritten on every pointer event, so a duration on `translate` makes each one the start
     * of a new animation and the tile crawls after the pointer instead of following it.
     */
    function styleFor(index) {
        if (index === heldIndex.value) {
            return {
                translate: `${heldOffset.value.x}px ${heldOffset.value.y}px`,
                scale: '1.03',
                zIndex: 20,
                transition: 'none',
            };
        }

        if (settling.value && index === settleIndex.value) {
            return { translate: '0px 0px', scale: '1', zIndex: 20 };
        }

        return {};
    }

    function held(index) {
        return index === heldIndex.value;
    }

    function settlingAt(index) {
        return settling.value && index === settleIndex.value;
    }

    return { heldIndex, heldOffset, settling, settleIndex, grab, move, drop, cancel, styleFor, held, settlingAt, measureSlots };
}
