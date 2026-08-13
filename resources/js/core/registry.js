const adapters = {};

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
    document
        .querySelectorAll('[data-island]:not([data-island-mounted])')
        .forEach((el) => {
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

            mount(el, payload);
            el.setAttribute('data-island-mounted', '');
        });
}

export function startIslands() {
    mountIslands();
    document.addEventListener('livewire:navigated', mountIslands);
}
