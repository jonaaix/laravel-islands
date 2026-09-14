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

function prefersReducedMotion() {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPrimaryPress(event) {
    // Primary button only, so a right-click leaves no mark.
    return event.button === 0;
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

export function spawnRipple(el, event = {}) {
    if (prefersReducedMotion()) {
        return;
    }

    ensureStyle();

    // Applied per press rather than once, so a re-rendered element keeps clipping its circles.
    containCircles(el);

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

export function attachRipple(el, isEnabled = () => true) {
    const onPointerDown = (event) => {
        if (isPrimaryPress(event) && isEnabled(el)) {
            spawnRipple(el, event);
        }
    };

    el.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => el.removeEventListener('pointerdown', onPointerDown);
}

export function delegateRipple(root, selector, isEnabled = () => true) {
    const onPointerDown = (event) => {
        if (! isPrimaryPress(event) || ! (event.target instanceof Element)) {
            return;
        }

        const el = event.target.closest(selector);

        if (el && root.contains(el) && isEnabled(el)) {
            spawnRipple(el, event);
        }
    };

    root.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => root.removeEventListener('pointerdown', onPointerDown);
}
