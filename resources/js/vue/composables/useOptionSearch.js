import { computed, ref, watch } from 'vue';

/**
 * The searchable list behind a select. It normalises what the caller offers, filters and ranks
 * it against the query, keeps the parents of a match in a tree, and asks the server for options
 * while typing when the caller hands over `fetchOptions`.
 *
 * `settings` is read reactively, so a component passes its props. It needs `options`,
 * `fetchOptions`, `fetchDelay`, `searchValues`, `maxOptions` and `keepAncestors`.
 */
export function useOptionSearch(settings, query) {
    const remoteOptions = ref(null);
    const loadingOptions = ref(false);

    let fetchId = 0;
    let fetchTimer = null;

    /** A list may carry more than a value and a label — whatever it adds reaches the caller. */
    function normalize(raw) {
        if (Array.isArray(raw)) {
            return raw.map((option) => ({ ...option }));
        }

        return Object.entries(raw ?? {}).map(([value, label]) => ({ value, label }));
    }

    const normalizedOptions = computed(() => normalize(settings.options));

    /** Everything a value could be looked up in: the offered list plus what the server sent. */
    const known = computed(() => [...normalizedOptions.value, ...(remoteOptions.value ?? [])]);

    const filtered = computed(() => {
        const q = query.value.trim().toLowerCase();
        const cap = settings.maxOptions > 0 ? settings.maxOptions : Infinity;

        // A remote source has already filtered server-side.
        if (settings.fetchOptions && q !== '') {
            return (remoteOptions.value ?? []).slice(0, cap);
        }

        const hit = (option) => String(option.label).toLowerCase().includes(q)
            || (settings.searchValues && String(option.value).toLowerCase().includes(q));

        if (!q) {
            return normalizedOptions.value.slice(0, cap);
        }

        if (!settings.keepAncestors) {
            // Ranked before the cap, or an exact match past the last shown entry is cut off.
            return normalizedOptions.value
                .filter(hit)
                .sort((a, b) => rank(a, q) - rank(b, q))
                .slice(0, cap);
        }

        return withAncestors(normalizedOptions.value, hit).slice(0, cap);
    });

    // A bare substring hit ranks last, or a typed-out code sits below every name containing it.
    function rank(option, q) {
        const value = String(option.value).toLowerCase();
        const label = String(option.label).toLowerCase();

        if (value === q) {
            return 0;
        }

        if (label === q) {
            return 1;
        }

        if (label.startsWith(q)) {
            return 2;
        }

        return value.startsWith(q) ? 3 : 4;
    }

    /**
     * Every match, plus the entry each one sits under — found by walking back to the nearest
     * shallower entry, since a flat list in tree order is all the depth tells us.
     */
    function withAncestors(options, hit) {
        const keep = new Set();

        options.forEach((option, index) => {
            if (!hit(option)) {
                return;
            }

            keep.add(index);

            let depth = Number(option.depth ?? 0);

            for (let above = index - 1; above >= 0 && depth > 0; above--) {
                const found = Number(options[above].depth ?? 0);

                if (found < depth) {
                    keep.add(above);
                    depth = found;
                }
            }
        });

        return [...keep].sort((a, b) => a - b).map((index) => options[index]);
    }

    /** Forgets what the server sent; a list opens fresh. */
    function reset() {
        clearTimeout(fetchTimer);
        fetchId++;
        remoteOptions.value = null;
        loadingOptions.value = false;
    }

    watch(query, (value) => {
        if (!settings.fetchOptions) {
            return;
        }

        clearTimeout(fetchTimer);
        const q = value.trim();

        if (q === '') {
            remoteOptions.value = null;
            loadingOptions.value = false;

            return;
        }

        loadingOptions.value = true;
        fetchTimer = setTimeout(async () => {
            const id = ++fetchId;

            try {
                const result = await settings.fetchOptions(q);

                if (id === fetchId) {
                    remoteOptions.value = normalize(result);
                }
            } catch (e) {
                if (id === fetchId) {
                    remoteOptions.value = [];
                }
            } finally {
                if (id === fetchId) {
                    loadingOptions.value = false;
                }
            }
        }, settings.fetchDelay);
    });

    return { normalize, normalizedOptions, remoteOptions, loadingOptions, known, filtered, reset };
}
