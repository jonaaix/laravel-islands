/**
 * Which third of the window the anchor sits in decides where a floating panel grows from: on the
 * left it opens to the right, in the middle it stays centred under the anchor, on the right it
 * opens to the left. Then it is pulled back far enough to stay on screen.
 */
export function anchoredLeft(rect, width, margin) {
    const third = window.innerWidth / 3;
    const centre = rect.left + rect.width / 2;

    const preferred = centre < third
        ? rect.left
        : centre < third * 2
            ? centre - width / 2
            : rect.right - width;

    return Math.max(margin, Math.min(preferred, window.innerWidth - width - margin));
}
