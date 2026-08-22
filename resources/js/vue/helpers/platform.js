const APPLE = typeof navigator !== 'undefined'
    && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '');

export const isMac = APPLE;

/** What to call the command modifier in shortcut hints. */
export const modifierKey = APPLE ? 'Cmd' : 'Ctrl';
