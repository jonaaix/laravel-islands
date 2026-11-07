import { inject, provide } from 'vue';

const MENU_LEVEL_KEY = Symbol('islands-menu-level');

const SUBMENU_CLOSE_DELAY = 150;

export function provideMenuLevel(level) {
    provide(MENU_LEVEL_KEY, level);
}

export function useMenuLevel() {
    return inject(MENU_LEVEL_KEY, null);
}

export function createMenuLevel(root) {
    let openSubmenu = null;
    let closeTimer = null;

    function cancelClose() {
        clearTimeout(closeTimer);
        closeTimer = null;
    }

    return {
        root,
        openSub(submenu) {
            cancelClose();

            if (openSubmenu && openSubmenu !== submenu) {
                openSubmenu.close();
            }

            openSubmenu = submenu;
        },
        subClosed(submenu) {
            if (openSubmenu === submenu) {
                openSubmenu = null;
            }
        },
        pointerEnteredItem(el) {
            cancelClose();

            if (!openSubmenu || openSubmenu.el?.contains(el)) {
                return;
            }

            const leaving = openSubmenu;

            closeTimer = setTimeout(() => {
                if (openSubmenu === leaving) {
                    leaving.close();
                }
            }, SUBMENU_CLOSE_DELAY);
        },
        holdSub: cancelClose,
    };
}
