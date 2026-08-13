import { useIsland } from './useIsland.js';

/**
 * Translate strings inside an island using the app's JSON translation lines
 * shipped with the payload. The English source string is the key; unknown
 * keys fall through unchanged. Supports Laravel-style `:placeholder` tokens.
 *
 * @returns {{ t: (key: string, replace?: Record<string, string|number>) => string }}
 */
export function useTranslations() {
    const island = useIsland();
    const translations = island?._island?.translations ?? {};

    function t(key, replace = {}) {
        let line = translations[key] ?? key;

        for (const [token, value] of Object.entries(replace)) {
            line = line.replace(new RegExp(`:${token}`, 'g'), String(value));
        }

        return line;
    }

    return { t };
}
