const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';

const TABBABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

const TYPEAHEAD_RESET = 500;

export function useMenuNavigation(panelEl) {
    let typed = '';
    let typedTimer = null;

    function items() {
        return [...(panelEl.value?.querySelectorAll(ITEM_SELECTOR) ?? [])]
            .filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true');
    }

    function reveal(el) {
        const box = panelEl.value;

        if (!box || box.scrollHeight <= box.clientHeight) {
            return;
        }

        if (el.offsetTop < box.scrollTop) {
            box.scrollTop = el.offsetTop;
        } else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) {
            box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight;
        }
    }

    function focusItem(el) {
        el.focus({ preventScroll: true });
        reveal(el);
    }

    function focusAt(index) {
        const list = items();

        if (list.length > 0) {
            focusItem(list[(index + list.length) % list.length]);
        }
    }

    function checkedItem() {
        return items().find((el) => el.getAttribute('aria-checked') === 'true') ?? null;
    }

    function focusChecked() {
        const checked = checkedItem();

        if (checked) {
            focusItem(checked);
        }

        return checked !== null;
    }

    function revealChecked() {
        const checked = checkedItem();

        if (checked) {
            reveal(checked);
        }
    }

    function labelOf(el) {
        return (el.querySelector('.il-menu-item__label')?.textContent ?? el.textContent).trim().toLowerCase();
    }

    function typeahead(key) {
        clearTimeout(typedTimer);
        typed += key.toLowerCase();
        typedTimer = setTimeout(() => { typed = ''; }, TYPEAHEAD_RESET);

        const list = items();
        const current = list.indexOf(document.activeElement);
        const start = typed.length === 1 ? current + 1 : Math.max(current, 0);
        const ordered = [...list.slice(start), ...list.slice(0, start)];
        const match = ordered.find((el) => labelOf(el).startsWith(typed));

        if (match) {
            focusItem(match);
        }
    }

    function onKeydown(event) {
        const list = items();
        const current = list.indexOf(document.activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusAt(current + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusAt(current < 0 ? -1 : current - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusAt(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusAt(-1);
        } else if (event.key === ' ' && document.activeElement?.tagName === 'A') {
            event.preventDefault();
            document.activeElement.click();
        } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
            typeahead(event.key);
        }
    }

    return {
        onKeydown,
        focusFirst: () => focusAt(0),
        focusLast: () => focusAt(-1),
        focusChecked,
        revealChecked,
    };
}

export function adjacentTabbable(from, step) {
    if (!from) {
        return null;
    }

    const all = [...document.querySelectorAll(TABBABLE_SELECTOR)]
        .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest('[data-il-menu]'));

    const at = all.indexOf(from);

    return at < 0 ? null : all[at + step] ?? null;
}
