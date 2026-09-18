const OPT_OUT = 'data-no-spa';

function navigator() {
    return typeof window !== 'undefined'
        ? (window.Livewire?.navigate ?? window.Alpine?.navigate ?? null)
        : null;
}

function wantsANewTab(event) {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function staysInside(link, within) {
    const url = new URL(link.href, window.location.origin);

    if (url.origin !== window.location.origin) {
        return false;
    }

    const base = '/'.concat(within.replace(/^\/+|\/+$/g, ''));

    return base === '/' || url.pathname === base || url.pathname.startsWith(`${base}/`);
}

function isSwappable(link, within) {
    return link.getAttribute('href')
        && ! link.hasAttribute(OPT_OUT)
        && ! link.closest(`[${OPT_OUT}]`)
        && ! link.hasAttribute('download')
        && ! link.target
        && ! link.hasAttribute('wire:navigate')
        && ! /^(mailto|tel|javascript):/i.test(link.getAttribute('href'))
        && staysInside(link, within);
}

/**
 * Turns every plain link under `root` that points inside `within` into an in-place page swap,
 * so markup written before this existed needs no attribute of its own. Anything the browser
 * should keep doing — a new tab, a download, a foreign host, `data-no-spa` — is left alone,
 * and without Livewire on the page nothing happens at all.
 */
export function delegateNavigate(root, { within = '/', isEnabled = () => true } = {}) {
    const onClick = (event) => {
        const go = navigator();

        if (! go || event.defaultPrevented || wantsANewTab(event) || ! (event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest('a');

        if (! link || ! root.contains(link) || ! isSwappable(link, within) || ! isEnabled(link)) {
            return;
        }

        event.preventDefault();
        go(link.href);
    };

    root.addEventListener('click', onClick);

    return () => root.removeEventListener('click', onClick);
}
