import * as React from 'mini-react';
import { Window } from 'window';
import { createRoot } from 'ui';
import { UIRoot } from 'ui/root';
import { WindowProvider } from 'components';
import { RootElementProvider } from 'hooks';

import type { WindowId, OpenWindowParams, WindowProps, WindowMapType } from '@app/windows';
import { setupFonts } from '@app/font-setup';
import { HotkeyProvider, ThemeProvider, WorkspaceProvider } from '@app/contexts';

type RequestCloseCallback = () => boolean | Promise<boolean>;

type WindowData<W extends WindowId> = {
    window: Window;
    reactRoot: UIRoot;
    props: WindowProps<W>;
    requestClose: RequestCloseCallback | null;
};

type WindowDataMap = { [K in WindowId]: WindowData<K> };

const WindowProxy: React.FC<{ id: WindowId; windowMap: WindowMapType }> = props => {
    const { id, windowMap } = props;

    const windowMgr = WindowManager.get();
    const { props: windowProps } = windowMgr.getWindowData(id);
    const Component = windowMap[id];

    return <Component {...windowProps} />;
};

export class WindowManager {
    private static m_instance: WindowManager | null = null;
    private m_windowData: WindowDataMap;
    private m_windowIds: WindowId[];

    private constructor(windowMap: WindowMapType, windowIds: WindowId[]) {
        this.m_windowData = {} as WindowDataMap;
        this.m_windowIds = windowIds;

        for (const id of windowIds) {
            const Component = windowMap[id];

            const title = 'title' in Component ? Component.title || id : id;
            const width = 'width' in Component ? Component.width || 800 : 800;
            const height = 'height' in Component ? Component.height || 600 : 600;

            const window = new Window(title, width, height);

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
                        <RootElementProvider root={reactRoot}>
                            <WorkspaceProvider>
                                <HotkeyProvider>
                                    <WindowProxy id={id} windowMap={windowMap} />
                                </HotkeyProvider>
                            </WorkspaceProvider>
                        </RootElementProvider>
                    </ThemeProvider>
                </WindowProvider>
            );
        }
    }

    static initialize(windowMap: WindowMapType, windowIds: WindowId[]) {
        if (this.m_instance) throw new Error('WindowManager is already initialized');
        this.m_instance = new WindowManager(windowMap, windowIds);
    }

    static shutdown() {
        if (!this.m_instance) throw new Error('WindowManager is not initialized');
        const windowData = this.m_instance.m_windowData;

        for (const id of this.m_instance.m_windowIds) {
            windowData[id].reactRoot.unmount();
            windowData[id].window.close();
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
        const isOpen = window.isOpen;
        if (isOpen) return;

        this.m_windowData[id].props = (args.length > 0 ? (args as any[])[0] : {}) as WindowProps<W>;
        this.m_windowData[id].window.open();
    }

    async closeWindow(id: WindowId, force?: boolean) {
        if (!(id in this.m_windowData)) {
            throw new Error(`Invalid window id: ${id}`);
        }

        const { window, requestClose } = this.m_windowData[id];

        const isOpen = window.isOpen;
        if (!isOpen) return true;

        if (requestClose && !force) {
            const result = await requestClose();
            if (result) {
                window.close();
                return true;
            }

            return false;
        }

        window.close();
        return true;
    }

    getWindowIdForWindow(window: Window) {
        return this.m_windowIds.find(id => this.m_windowData[id].window === window);
    }

    getWindowData<W extends WindowId>(id: W): WindowData<W> {
        if (!(id in this.m_windowData)) {
            throw new Error(`Invalid window id: ${id}`);
        }

        return this.m_windowData[id];
    }
}
