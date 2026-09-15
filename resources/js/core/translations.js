const loaders = new Map();

export function loadTranslations(url) {
    if (!loaders.has(url)) {
        loaders.set(
            url,
            fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`[islands] translations at "${url}" answered ${response.status}`);
                    }

                    return response.json();
                })
                .catch((error) => {
                    loaders.delete(url);
                    console.error(error);

                    return {};
                }),
        );
    }

    return loaders.get(url);
}

export async function resolveTranslations(payload) {
    const meta = payload?._island;

    if (meta?.translationsUrl) {
        meta.translations = await loadTranslations(meta.translationsUrl);
    }

    return payload;
}
