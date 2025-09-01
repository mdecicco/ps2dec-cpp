import * as React from 'mini-react';
import { useCurrentWindow } from 'components';

import { WindowManager } from '@app/managers';
import { OpenWindowParams, WindowId } from '@app/windows';

type RequestCloseCallback = () => boolean | Promise<boolean>;

export function useWindowPreventClose(callback: RequestCloseCallback) {
    const { window } = useCurrentWindow();
    const windowMgr = WindowManager.get();
    const windowId = windowMgr.getWindowIdForWindow(window);

    if (!windowId) {
        throw new Error(`useWindowPreventClose must only be used on a window that's managed by the WindowManager`);
    }

    const windowData = windowMgr.getWindowData(windowId);

    React.useEffect(() => {
        windowData.requestClose = callback;

        return () => {
            windowData.requestClose = null;
        };
    }, [callback]);
}

export function useWindowManager() {
    const windowMgr = WindowManager.get();

    const closeWindow = (id: WindowId, force?: boolean) => {
        return windowMgr.closeWindow(id, force);
    };

    const openWindow = <W extends WindowId>(id: W, ...args: OpenWindowParams<W>) => {
        return windowMgr.openWindow(id, ...args);
    };

    return {
        closeWindow,
        openWindow
    };
}
