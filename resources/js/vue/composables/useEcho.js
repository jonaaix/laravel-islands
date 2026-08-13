import { onBeforeUnmount } from 'vue';
import { createEchoController } from '../../core/echo.js';

/**
 * Vue binding over the core Echo controller: leaves every joined channel
 * automatically when the island unmounts.
 */
export function useEcho() {
    const controller = createEchoController();
    onBeforeUnmount(controller.leaveAll);
    return controller;
}
