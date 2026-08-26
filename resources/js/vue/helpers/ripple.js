const LIFETIME_MS = 400;

const STYLE_ID = 'aaix-ripple-style';

const STYLE = `
.aaix-ripple {
    position: absolute;
    border-radius: 9999px;
    background-color: currentColor;
    pointer-events: none;
    transform: scale(0);
    opacity: 0.35;
    animation-name: aaix-ripple-scale, aaix-ripple-fade;
    animation-duration: 220ms, ${LIFETIME_MS}ms;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1), linear;
    animation-fill-mode: forwards, forwards;
}

@keyframes aaix-ripple-scale {
    to { transform: scale(1); }
}

@keyframes aaix-ripple-fade {
    0% { opacity: 0.35; }
    100% { opacity: 0; }
}
`;

const listeners = new WeakMap();

const enabled = new WeakMap();

// Placed from here rather than shipped as a stylesheet, so the package stays free of an import step.
function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE;
    document.head.appendChild(style);
}

function containCircles(el) {
    const computed = getComputedStyle(el);

    if (computed.position === 'static') {
        el.style.position = 'relative';
    }

    if (computed.overflow === 'visible') {
        el.style.overflow = 'hidden';
    }
}

function spawnCircle(el, event) {
    const box = el.getBoundingClientRect();
    const size = Math.max(box.width, box.height) * 2;
    const circle = document.createElement('span');

    circle.className = 'aaix-ripple';
    circle.style.left = `${(event.clientX ?? box.left + box.width / 2) - box.left - size / 2}px`;
    circle.style.top = `${(event.clientY ?? box.top + box.height / 2) - box.top - size / 2}px`;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    el.appendChild(circle);

    setTimeout(() => circle.remove(), LIFETIME_MS);
}

export const vRipple = {
    mounted(el, binding) {
        ensureStyle();
        containCircles(el);
        enabled.set(el, binding.value !== false);

        const onPointerDown = (event) => {
            // Primary button only, so a right-click leaves no mark.
            if (enabled.get(el) && event.button === 0) {
                spawnCircle(el, event);
            }
        };

        listeners.set(el, onPointerDown);
        el.addEventListener('pointerdown', onPointerDown);
    },

    updated(el, binding) {
        enabled.set(el, binding.value !== false);
    },

    unmounted(el) {
        el.removeEventListener('pointerdown', listeners.get(el));
        listeners.delete(el);
        enabled.delete(el);
    },
};
