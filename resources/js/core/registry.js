const PAGE_STATES_LIMIT = 10;

const STORAGE_KEY = 'islands.pageStates';

// A page left longer ago than this paints from a fresh fetch again: its rows would be too old to show even for a moment.
const STORAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const adapters = {};

const mounted = new Map();

const pageStates = new Map();

let currentPath = typeof window === 'undefined' ? '' : window.location.pathname;

// On a back or forward step the address already names the destination when the page is left.
let currentUrl = typeof window === 'undefined' ? '' : window.location.pathname + window.location.search;

let historyMove = false;

export function registerAdapter(name, mount) {
    adapters[name] = mount;
}

function parsePayload(el) {
    try {
        return JSON.parse(el.dataset.islandPayload || '{}');
    } catch (error) {
        console.error(`[islands] invalid payload for "${el.dataset.island}"`, error);
        return null;
    }
}

function pageKey() {
    return window.location.pathname + window.location.search;
}

function normalizeMountResult(result) {
    if (typeof result === 'function') {
        return { teardown: result, snapshot: null };
    }

    return { teardown: result?.teardown ?? null, snapshot: result?.snapshot ?? null };
}

export function mountIslands() {
    const remembered = pageStates.get(pageKey())?.islands ?? {};

    document.querySelectorAll('[data-island]').forEach((el) => {
        if (mounted.has(el)) {
            return;
        }

        const adapter = el.dataset.islandAdapter;
        const mount = adapters[adapter];

        if (!mount) {
            console.warn(`[islands] no adapter registered for "${adapter}"`);
            return;
        }

        const payload = parsePayload(el);
        if (payload === null) {
            return;
        }

        if (remembered[el.dataset.island] !== undefined) {
            payload._island = { ...(payload._island ?? {}), restored: remembered[el.dataset.island] };
        }

        const island = { teardown: null, snapshot: null, pending: null };
        const context = { isCancelled: () => mounted.get(el) !== island };

        try {
            island.pending = Promise.resolve(mount(el, payload, context)).then((result) => {
                Object.assign(island, normalizeMountResult(result));
            });
        } catch (error) {
            console.error(`[islands] mount failed for "${el.dataset.island}"`, error);
            return;
        }

        island.pending.catch((error) => console.error(`[islands] mount failed for "${el.dataset.island}"`, error));
        mounted.set(el, island);
        el.setAttribute('data-island-mounted', '');
    });
}

function teardown(el, island) {
    const report = (error) => console.error(`[islands] unmount failed for "${el.dataset.island}"`, error);

    if (island.teardown) {
        try {
            island.teardown();
        } catch (error) {
            report(error);
        }

        return;
    }

    island.pending.then(() => island.teardown?.()).catch(report);
}

export function unmountIslands(shouldUnmount = () => true) {
    for (const [el, island] of mounted) {
        if (!shouldUnmount(el)) {
            continue;
        }

        mounted.delete(el);
        el.removeAttribute('data-island-mounted');
        teardown(el, island);
    }
}

function readStoredPages() {
    try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
        const cutoff = Date.now() - STORAGE_MAX_AGE_MS;

        return Array.isArray(stored) ? stored.filter(([, page]) => (page?.storedAt ?? 0) > cutoff) : [];
    } catch {
        return [];
    }
}

function storePages() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...pageStates]));
    } catch {
        return;
    }
}

function rememberPage() {
    const islands = {};

    for (const [el, island] of mounted) {
        try {
            const state = island.snapshot?.();

            if (state !== null && state !== undefined) {
                islands[el.dataset.island] = state;
            }
        } catch (error) {
            console.error(`[islands] state of "${el.dataset.island}" could not be kept`, error);
        }
    }

    if (Object.keys(islands).length === 0) {
        return;
    }

    pageStates.delete(currentUrl);
    pageStates.set(currentUrl, { islands, scrollY: window.scrollY, storedAt: Date.now() });

    while (pageStates.size > PAGE_STATES_LIMIT) {
        pageStates.delete(pageStates.keys().next().value);
    }

    storePages();
}

function restoreScroll() {
    const scrollY = pageStates.get(pageKey())?.scrollY;

    if (scrollY === undefined) {
        return;
    }

    Promise.allSettled([...mounted.values()].map((island) => island.pending)).then(() => {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    });
}

function isStrandedHistoryEntry(event) {
    return window.Livewire && !event.state?.alpine?.snapshotIdx && window.location.pathname !== currentPath;
}

export function startIslands() {
    for (const [url, page] of readStoredPages()) {
        pageStates.set(url, page);
    }

    mountIslands();

    document.addEventListener('livewire:navigating', () => {
        rememberPage();
        unmountIslands();
    });

    window.addEventListener('pagehide', rememberPage);

    document.addEventListener('livewire:navigated', () => {
        currentPath = window.location.pathname;
        currentUrl = pageKey();
        unmountIslands((el) => !el.isConnected);
        mountIslands();

        if (historyMove) {
            historyMove = false;
            restoreScroll();
        }
    });

    window.addEventListener('popstate', (event) => {
        historyMove = Boolean(event.state?.alpine?.snapshotIdx);

        if (isStrandedHistoryEntry(event)) {
            window.location.reload();
        }
    });
}
