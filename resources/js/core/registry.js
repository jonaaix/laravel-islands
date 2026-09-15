const adapters = {};

const mounted = new Map();

let currentPath = typeof window === 'undefined' ? '' : window.location.pathname;

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

export function mountIslands() {
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

        const teardown = Promise.resolve(mount(el, payload));
        mounted.set(el, () => teardown.then((fn) => fn?.()));
        el.setAttribute('data-island-mounted', '');
    });
}

export function unmountIslands(shouldUnmount = () => true) {
    for (const [el, teardown] of mounted) {
        if (!shouldUnmount(el)) {
            continue;
        }

        mounted.delete(el);
        el.removeAttribute('data-island-mounted');
        teardown().catch((error) => console.error(`[islands] unmount failed for "${el.dataset.island}"`, error));
    }
}

function isSamePageHistoryMove(event) {
    return event.detail?.history && window.history.state?.islands && event.detail.url?.pathname === currentPath;
}

function isStrandedHistoryEntry(event) {
    return window.Livewire && !event.state?.alpine?.snapshotIdx && window.location.pathname !== currentPath;
}

export function startIslands() {
    mountIslands();

    document.addEventListener('livewire:navigate', (event) => {
        if (isSamePageHistoryMove(event)) {
            event.preventDefault();
        }
    });

    document.addEventListener('livewire:navigating', () => unmountIslands());

    document.addEventListener('livewire:navigated', () => {
        currentPath = window.location.pathname;
        unmountIslands((el) => !el.isConnected);
        mountIslands();
    });

    window.addEventListener('popstate', (event) => {
        if (isStrandedHistoryEntry(event)) {
            window.location.reload();
        }
    });
}
