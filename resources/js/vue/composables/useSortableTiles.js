import { nextTick, ref } from 'vue';

const SETTLE_MS = 160;

/**
 * Dragging a tile into a new place, by pointer events rather than by the browser's own drag:
 * the tile follows the finger, the gap the others open up is the preview, and the list is
 * reordered as the pointer travels instead of once on release.
 *
 * `container` is a ref to the element holding the tiles, each marked with the given attribute.
 * `list` is a ref to the working array — it is reordered in place as the drag goes on.
 */
export function useSortableTiles({ container, list, attribute = 'data-tile', onReorder = null, enabled = null, threshold = 0 }) {
    const heldIndex = ref(-1);
    const heldOffset = ref({ x: 0, y: 0 });
    const settling = ref(false);
    const settleIndex = ref(-1);

    let slots = [];
    let grabX = 0;
    let grabY = 0;
    let pressIndex = -1;
    let started = false;
    let lastPressDragged = false;
    let settleTimer = null;
    let releaseTimer = null;

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

    function tileAt(index) {
        return container.value?.querySelectorAll(`[${attribute}]`)[index] ?? null;
    }

    /**
     * Written straight onto the element rather than through `styleFor()`: a render on every
     * pointer event would restart a surrounding list animation each time, and the tiles
     * making way would jitter instead of gliding.
     */
    function placeHeld() {
        tileAt(heldIndex.value)?.style.setProperty('translate', `${heldOffset.value.x}px ${heldOffset.value.y}px`);
    }

    // The pointer is captured on the container, never on the tile: reordering moves the
    // tile's node, and a moved node loses its capture — which ended the drag by itself.
    function startDrag(pointerId) {
        started = true;
        lastPressDragged = true;
        heldIndex.value = pressIndex;
        container.value?.setPointerCapture?.(pointerId);
    }

    function grab(index, event) {
        if (!active() || (event.pointerType === 'mouse' && event.button !== 0)) {
            return;
        }

        clearTimeout(settleTimer);
        settling.value = false;
        settleIndex.value = -1;
        measureSlots();
        pressIndex = index;
        started = false;
        lastPressDragged = false;
        heldOffset.value = { x: 0, y: 0 };
        grabX = event.pageX;
        grabY = event.pageY;

        // Without a threshold the press is the drag; with one, it stays a click until the pointer travels.
        if (threshold <= 0) {
            event.preventDefault();
            startDrag(event.pointerId);
        }
    }

    function move(event) {
        if (pressIndex === -1) {
            return;
        }

        heldOffset.value = { x: event.pageX - grabX, y: event.pageY - grabY };

        if (!started) {
            if (Math.hypot(heldOffset.value.x, heldOffset.value.y) <= threshold) {
                return;
            }
            startDrag(event.pointerId);
        }

        placeHeld();

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
        pressIndex = to;

        // The tile must stay under the pointer, so the offset loses the distance its slot
        // just travelled — otherwise it would jump a whole slot on every swap.
        if (slots[from] && slots[to]) {
            grabX += slots[to].left - slots[from].left;
            grabY += slots[to].top - slots[from].top;
            heldOffset.value = { x: event.pageX - grabX, y: event.pageY - grabY };
        }

        nextTick(placeHeld);
    }

    // Set to zero only once the held style, and with it `transition: none`, is gone — so it glides.
    function releaseTile(index) {
        nextTick(() => {
            const tile = tileAt(index);
            tile?.style.setProperty('translate', '0px 0px');
            clearTimeout(releaseTimer);
            releaseTimer = setTimeout(() => tile?.style.removeProperty('translate'), SETTLE_MS);
        });
    }

    function drop(event) {
        if (pressIndex === -1) {
            return;
        }

        pressIndex = -1;
        heldOffset.value = { x: 0, y: 0 };
        slots = [];

        if (!started) {
            return;
        }

        started = false;

        // Let it glide the last stretch into its slot instead of blinking there.
        settleIndex.value = heldIndex.value;
        settling.value = true;
        releaseTile(heldIndex.value);
        heldIndex.value = -1;

        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            settling.value = false;
            settleIndex.value = -1;
        }, SETTLE_MS);

        if (event && container.value?.hasPointerCapture?.(event.pointerId)) {
            container.value.releasePointerCapture(event.pointerId);
        }

        onReorder?.(list.value);
    }

    function cancel() {
        clearTimeout(settleTimer);
        clearTimeout(releaseTimer);
        tileAt(heldIndex.value)?.style.removeProperty('translate');
        tileAt(settleIndex.value)?.style.removeProperty('translate');
        heldIndex.value = -1;
        heldOffset.value = { x: 0, y: 0 };
        settling.value = false;
        settleIndex.value = -1;
        pressIndex = -1;
        started = false;
        slots = [];
    }

    /** Whether the last press became a drag; reading it resets it, so the click ending a drag can be ignored. */
    function wasDragged() {
        const dragged = lastPressDragged;
        lastPressDragged = false;

        return dragged;
    }

    /**
     * The held tile is lifted with `scale` rather than with `transform`, because a list
     * animation owns `transform` — kept apart, the two compose instead of overwriting each
     * other. Its `translate` is written onto the element directly, see `placeHeld()`.
     *
     * The held one also loses its transition: the offset is rewritten on every pointer event,
     * so a duration on `translate` would restart the animation each time and the tile would
     * crawl after the pointer.
     */
    function styleFor(index) {
        if (index === heldIndex.value) {
            return { scale: '1.03', zIndex: 20, transition: 'none' };
        }

        if (settling.value && index === settleIndex.value) {
            return { scale: '1', zIndex: 20 };
        }

        return {};
    }

    function held(index) {
        return index === heldIndex.value;
    }

    function settlingAt(index) {
        return settling.value && index === settleIndex.value;
    }

    return { heldIndex, heldOffset, settling, settleIndex, grab, move, drop, cancel, styleFor, held, settlingAt, measureSlots, wasDragged };
}
