const PRESSED_CLASS = 'il-pressed';

// A trackpad tap releases within a frame or two, so :active alone never stays up long enough to read.
const MIN_VISIBLE_MS = 180;

function isPrimaryPress(event) {
    return event.button === 0 || event.button === undefined;
}

/**
 * Holds a press on every element matching `selector` under `root` for a readable moment: the
 * element carries `il-pressed` from pointerdown until `minVisibleMs` have passed. Style that
 * class beside `:active`, which is gone again before a tap can be seen.
 */
export function delegatePress(root, selector, { minVisibleMs = MIN_VISIBLE_MS, className = PRESSED_CLASS } = {}) {
    const timers = new WeakMap();

    const onPointerDown = (event) => {
        if (! isPrimaryPress(event) || ! (event.target instanceof Element)) {
            return;
        }

        const el = event.target.closest(selector);

        if (! el || ! root.contains(el)) {
            return;
        }

        el.classList.add(className);

        clearTimeout(timers.get(el));
        timers.set(el, setTimeout(() => el.classList.remove(className), minVisibleMs));
    };

    root.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => root.removeEventListener('pointerdown', onPointerDown);
}
