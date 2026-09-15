import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

const ENTRY_SUFFIX = '.island.vue';
const SOURCE_EXTENSIONS = new Set(['.vue', '.js', '.mjs', '.ts']);
const IMPORT_PATTERNS = [
    /\bimport\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const LITERAL_KEY = /\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/gs;
const DYNAMIC_KEY = /(?<!function\s)(?<!\.)\bt\(\s*(?!['"])[^)\s]/;

export function findIslandEntries(root) {
    const entries = {};

    const walk = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);

            if (entry.isDirectory()) {
                walk(path);
            } else if (entry.name.endsWith(ENTRY_SUFFIX)) {
                entries[basename(entry.name, ENTRY_SUFFIX)] ??= path;
            }
        }
    };

    walk(root);

    return entries;
}

function parseSource(path) {
    const code = readFileSync(path, 'utf8');
    const keys = new Set();
    const imports = new Set();

    for (const match of code.matchAll(LITERAL_KEY)) {
        keys.add(match[2].replace(/\\(.)/g, '$1'));
    }

    for (const pattern of IMPORT_PATTERNS) {
        for (const match of code.matchAll(pattern)) {
            imports.add(match[1]);
        }
    }

    return { keys, imports, dynamic: DYNAMIC_KEY.test(code) };
}

function sourceFile(resolved) {
    if (!resolved || resolved.startsWith('\0')) {
        return null;
    }

    const path = resolved.split('?')[0];

    if (!SOURCE_EXTENSIONS.has(extname(path)) || path.includes('/node_modules/') || !existsSync(path)) {
        return null;
    }

    return statSync(path).isFile() ? path : null;
}

/**
 * @param {Record<string, string>} entries Island name, mapped to the absolute path of its entry file.
 * @param {(source: string, importer: string) => Promise<{ id: string } | string | null>} resolveImport
 * @returns {Promise<{ manifest: Record<string, { keys: string[], dynamic: boolean }>, files: Set<string> }>}
 */
export async function collectTranslationManifest(entries, resolveImport) {
    const parsed = new Map();
    const files = new Set();

    const parse = (path) => {
        if (!parsed.has(path)) {
            parsed.set(path, parseSource(path));
            files.add(path);
        }

        return parsed.get(path);
    };

    const resolve = async (source, importer) => {
        const result = await resolveImport(source, importer);

        return sourceFile(typeof result === 'string' ? result : result?.id);
    };

    const manifest = {};

    for (const [name, entry] of Object.entries(entries).sort(([a], [b]) => a.localeCompare(b))) {
        const keys = new Set();
        const seen = new Set();
        const queue = [entry];
        let dynamic = false;

        while (queue.length) {
            const path = queue.shift();

            if (seen.has(path)) {
                continue;
            }

            seen.add(path);
            const source = parse(path);
            source.keys.forEach((key) => keys.add(key));
            dynamic ||= source.dynamic;

            for (const specifier of source.imports) {
                const target = await resolve(specifier, path);

                if (target && !seen.has(target)) {
                    queue.push(target);
                }
            }
        }

        manifest[name] = { keys: [...keys].sort(), dynamic };
    }

    return { manifest, files };
}

export function writeManifest(path, manifest) {
    const json = JSON.stringify(manifest, null, 2) + '\n';

    if (existsSync(path) && readFileSync(path, 'utf8') === json) {
        return false;
    }

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, json);

    return true;
}
