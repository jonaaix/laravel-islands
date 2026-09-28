// Counted, so a modal opened from a modal does not hand the page its scrolling back when it closes first.
let holders = 0;
let saved = null;

export function lockPageScroll() {
    holders += 1;

    if (holders > 1) {
        return;
    }

    const root = document.documentElement;
    saved = { overflow: root.style.overflow, scrollbarGutter: root.style.scrollbarGutter };

    // The gutter keeps the scrollbar's width reserved, so the page does not shift sideways.
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
}

export function unlockPageScroll() {
    if (holders === 0) {
        return;
    }

    holders -= 1;

    if (holders > 0) {
        return;
    }

    const root = document.documentElement;
    root.style.overflow = saved?.overflow ?? '';
    root.style.scrollbarGutter = saved?.scrollbarGutter ?? '';
    saved = null;
}
