import * as React from 'mini-react';
import { decompiler } from 'decompiler';
import { Window } from 'window';
import { createRoot } from 'ui';
import { UIRoot } from 'ui/root';
import { WindowProvider } from 'components';

import { WindowMap, WindowId, WindowIds, OpenWindowParams, WindowProps } from '@app/windows';
import { setupFonts } from '@app/font-setup';
import { ThemeProvider } from '@app/contexts';

type RequestCloseCallback = () => boolean | Promise<boolean>;

type WindowData<W extends WindowId> = {
    window: Window;
    reactRoot: UIRoot;
    props: WindowProps<W>;
    requestClose: RequestCloseCallback | null;
};

type WindowDataMap = { [K in WindowId]: WindowData<K> };

const WindowProxy: React.FC<{ id: WindowId }> = ({ id }) => {
    const windowMgr = WindowManager.get();
    const { props } = windowMgr.getWindowData(id);
    const Component = WindowMap[id];

    return <Component {...props} />;
};

export class WindowManager {
    private static m_instance: WindowManager | null = null;
    private m_windowData: WindowDataMap;

    private constructor() {
        this.m_windowData = {} as WindowDataMap;

        for (const id of WindowIds) {
            const Component = WindowMap[id];

            const title = 'title' in Component ? Component.title || id : id;
            const width = 'width' in Component ? Component.width || 800 : 800;
            const height = 'height' in Component ? Component.height || 600 : 600;

            const window = new Window(title, width, height);
            decompiler.addWindow(window);

            const reactRoot = createRoot(window);

            setupFonts(reactRoot);

            this.m_windowData[id] = {
                window,
                reactRoot,
                props: {} as WindowProps<WindowId>,
                requestClose: null
            };

            reactRoot.render(
                <WindowProvider window={window}>
                    <ThemeProvider>
                        <WindowProxy id={id} />
                    </ThemeProvider>
                </WindowProvider>
            );
        }
    }

    static initialize() {
        if (this.m_instance) throw new Error('WindowManager is already initialized');
        this.m_instance = new WindowManager();
    }

    static shutdown() {
        if (!this.m_instance) throw new Error('WindowManager is not initialized');
        const windowData = this.m_instance.m_windowData;

        for (const id of WindowIds) {
            windowData[id].reactRoot.unmount();
            windowData[id].window.setOpen(false);
            windowData[id].window.destroy();
        }

        this.m_instance = null;
    }

    static get() {
        if (!this.m_instance) throw new Error('WindowManager is not initialized');
        return this.m_instance;
    }

    openWindow<W extends WindowId>(id: W, ...args: OpenWindowParams<W>) {
        if (!(id in this.m_windowData)) {
            throw new Error(`Invalid window id: ${id}`);
        }

        const { window } = this.m_windowData[id];
        const isOpen = window.isOpen();
        if (isOpen) return;

        this.m_windowData[id].props = (args.length > 0 ? (args as any[])[0] : {}) as WindowProps<W>;
        this.m_windowData[id].window.setOpen(true);
    }

    async closeWindow(id: WindowId, force?: boolean) {
        if (!(id in this.m_windowData)) {
            throw new Error(`Invalid window id: ${id}`);
        }

        const { window, requestClose } = this.m_windowData[id];

        const isOpen = window.isOpen();
        if (!isOpen) return true;

        if (requestClose && !force) {
            const result = await requestClose();
            if (result) {
                window.setOpen(false);
                return true;
            }

            return false;
        }

        window.setOpen(false);
        return true;
    }

    getWindowIdForWindow(window: Window) {
        return WindowIds.find(id => this.m_windowData[id].window === window);
    }

    getWindowData<W extends WindowId>(id: W): WindowData<W> {
        if (!(id in this.m_windowData)) {
            throw new Error(`Invalid window id: ${id}`);
        }

        return this.m_windowData[id];
    }
}
