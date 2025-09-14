import PluginManager from 'plugin-manager';
import { IPlugin } from 'plugin';

import { ThemeManager, WindowManager, WorkspaceManager } from '@app/managers';
import { WindowIds, WindowMap } from '@app/windows';

class WindowManagerPlugin extends IPlugin {
    constructor() {
        super('WindowManagerPlugin');
    }

    onInitialize() {
        WindowManager.initialize(WindowMap, WindowIds);
        ThemeManager.initialize();
        WorkspaceManager.initialize();
    }

    onShutdown() {
        WindowManager.shutdown();
        ThemeManager.shutdown();
        WorkspaceManager.shutdown();
    }
}

PluginManager.addPlugin(new WindowManagerPlugin());
